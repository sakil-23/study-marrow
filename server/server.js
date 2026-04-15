const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// 🛡️ SECURITY PACKAGES
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken'); 
const { body, validationResult } = require('express-validator'); 

// 📧 EMAIL, UPLOADS, & AI PACKAGES
const nodemailer = require('nodemailer');
const multer = require('multer');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// 🗂️ MODELS
const Material = require('./models/Material');
const Subscriber = require('./models/Subscriber');
const CurrentAffair = require('./models/CurrentAffair');

const app = express();

// ✅ CRITICAL FOR RENDER: Tells the rate-limiter to read the actual user's IP
app.set('trust proxy', 1);

// ==========================================
// 🧠 AI & UPLOAD CONFIGURATION
// ==========================================
// Store uploaded PDFs temporarily in RAM (Memory)
const upload = multer({ storage: multer.memoryStorage() });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const aiModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// ==========================================
// 📧 EMAIL TRANSPORTER SETUP (ZOHO MAIL)
// ==========================================
const transporter = nodemailer.createTransport({
    host: 'smtp.zoho.in', // Zoho India server
    port: 465,
    secure: true, 
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

transporter.verify((error, success) => {
    if (error) {
        console.log("⚠️ Email Service Error:", error);
    } else {
        console.log("📧 Email Service is Ready!");
    }
});

// ==========================================
// 🛡️ SECURITY & CONFIG MIDDLEWARE
// ==========================================
app.use(helmet()); 
app.use(mongoSanitize()); 
app.use(cors({
    origin: [
        "https://study-marrow.vercel.app",
        "http://localhost:3000",
        "https://studymarrow.in",
        "https://www.studymarrow.in"
    ],
    methods: ["GET", "POST", "DELETE", "PUT"],
    credentials: true
}));

app.use(express.json());

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 500, 
    message: { message: "⚠️ Too many requests from this IP. Please wait 15 minutes." }
});

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 6, 
    message: { message: "🚫 Too many failed login attempts. You are locked out for 15 minutes." }
});

app.use('/api/', apiLimiter);

// ==========================================
// 🗄️ DATABASE & AUTH
// ==========================================
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "mysecretpass";
const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_key"; 

const verifyAdmin = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(403).json({ message: "⛔ Access Denied: No Token Provided" });
    }

    const token = authHeader.split(" ")[1];
    try {
        jwt.verify(token, JWT_SECRET); 
        next();
    } catch (err) {
        return res.status(403).json({ message: "⛔ Access Denied: Invalid or Expired Token" });
    }
};

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/eduportal';
mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ MongoDB Connected Securely'))
    .catch(err => console.log(err));

app.get('/', (req, res) => res.send('Server is running and healthy! 🚀'));

// ==========================================
// 🚀 API ROUTES (Materials & Subscribers)
// ==========================================

app.get('/api/materials', async (req, res) => {
    try {
        const materials = await Material.find().sort({ order: 1, date: -1 });
        res.json(materials);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

app.put('/api/materials/reorder', verifyAdmin, async (req, res) => {
    try {
        const { updates } = req.body; 
        const operations = updates.map(item => {
            return Material.findByIdAndUpdate(item.id, { order: item.order });
        });
        await Promise.all(operations);
        res.json({ message: "Order updated successfully" });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

app.post('/api/subscribe', [
    body('email').isEmail().withMessage('Must be a valid email address').normalizeEmail()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: "Invalid email format", errors: errors.array() });

    try {
        const { email } = req.body;
        const exists = await Subscriber.findOne({ email });
        if (exists) return res.status(400).json({ message: "Already subscribed!" });
        
        const newSub = new Subscriber({ email });
        await newSub.save();
        res.status(201).json({ message: "Subscribed!" });
    } catch (err) { res.status(500).json({ message: "Server error" }); }
});

app.post('/api/verify-admin', loginLimiter, (req, res) => {
    const providedPassword = req.headers['admin-key'];
    if (providedPassword === ADMIN_PASSWORD) {
        const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '2h' });
        res.json({ success: true, token }); 
    } else {
        res.status(403).json({ message: "⛔ Access Denied: Wrong Password" });
    }
});

app.post('/api/upload', verifyAdmin, [
    body('title').trim().notEmpty().escape(), 
    body('link').optional({ checkFalsy: true }).isURL().withMessage("Must be a valid URL"), 
    body('description').optional({ checkFalsy: true }).trim().escape(), 
    body('vertical').trim().notEmpty().escape(),
    body('category').trim().notEmpty().escape()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: "Invalid input data detected", errors: errors.array() });

    try {
        const { vertical, title, category, subject, resourceType, link, description, board } = req.body;
        
        const topItem = await Material.findOne({ vertical, category, subject }).sort({ order: 1 });
        const newOrder = topItem ? topItem.order - 1 : 0;

        const newMaterial = new Material({ 
            vertical, title, category, subject, resourceType, link, description, board, 
            order: newOrder 
        });
        
        await newMaterial.save();

        try {
            const subs = await Subscriber.find({}, 'email');
            if (subs.length > 0 && process.env.EMAIL_USER) {
                const bccList = subs.map(s => s.email).filter(email => email !== process.env.EMAIL_USER).join(',');
                if (bccList.length > 0) {
                    const mailOptions = {
                        from: `"Study Marrow" <${process.env.EMAIL_USER}>`,
                        to: `"Study Marrow Subscribers" <noreply@studymarrow.com>`, 
                        bcc: bccList, 
                        subject: `📚 New Upload: ${title}`,
                        html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden;"><div style="background-color: #0f172a; padding: 20px; text-align: center;"><h1 style="color: white; margin: 0;">Study Marrow</h1></div><div style="padding: 30px; background-color: #f8fafc;"><h2 style="color: #1e293b; margin-top: 0;">New Material Added! 🚀</h2><p style="color: #475569; font-size: 16px;">We have just uploaded a new resource to help with your preparation.</p><div style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #3b82f6; margin: 20px 0;"><p style="margin: 5px 0;"><strong>Title:</strong> ${title}</p><p style="margin: 5px 0;"><strong>Category:</strong> ${vertical} > ${category} ${subject ? '> ' + subject : ''}</p><p style="margin: 5px 0;"><strong>Type:</strong> ${resourceType}</p></div><div style="text-align: center; margin-top: 30px;"><a href="${link}" style="background-color: #2563eb; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Access Material</a></div></div><div style="text-align: center; padding: 15px; font-size: 12px; color: #94a3b8;">You are receiving this because you subscribed to Study Marrow updates.</div></div>`
                    };
                    transporter.sendMail(mailOptions).catch(err => console.error("Email failed:", err));
                }
            }
        } catch (emailError) { console.error("Error sending emails:", emailError); }

        res.status(201).json(newMaterial);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

app.put('/api/materials/:id', verifyAdmin, [
    body('title').trim().notEmpty().escape()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: "Invalid title format", errors: errors.array() });

    try {
        const { title } = req.body;
        const updatedMaterial = await Material.findByIdAndUpdate(req.params.id, { title }, { new: true });
        res.json(updatedMaterial);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

app.delete('/api/materials/:id', verifyAdmin, async (req, res) => {
    try {
        await Material.findByIdAndDelete(req.params.id);
        res.json({ message: "Deleted successfully" });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

app.get('/api/subscribe', verifyAdmin, async (req, res) => {
    try {
        const subs = await Subscriber.find().sort({ dateJoined: -1 });
        res.json(subs);
    } catch (err) { res.status(500).json({ message: "Error" }); }
});

// ==========================================
// 📰 CURRENT AFFAIRS API ROUTES
// ==========================================

app.get('/api/current-affairs', async (req, res) => {
    try {
        const affairs = await CurrentAffair.find().sort({ order: 1, date: -1 });
        res.json(affairs);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

app.put('/api/current-affairs/reorder', verifyAdmin, async (req, res) => {
    try {
        const { updates } = req.body; 
        const operations = updates.map(item => {
            return CurrentAffair.findByIdAndUpdate(item.id, { order: item.order });
        });
        await Promise.all(operations);
        res.json({ message: "Current affairs order updated successfully" });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

app.post('/api/current-affairs', verifyAdmin, [
    body('title').trim().notEmpty(), 
    body('content').trim().notEmpty(),
    body('category').trim().notEmpty(),
    body('pdfLink').optional({ checkFalsy: true }).isURL().withMessage("Must be a valid URL")
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: "Invalid input", errors: errors.array() });

    try {
        const { date, title, content, category, pdfLink, groupName } = req.body; // 👈 NEW: Extracted groupName
        
        const topItem = await CurrentAffair.findOne({ category }).sort({ order: 1 });
        const newOrder = topItem && topItem.order !== undefined ? topItem.order - 1 : 0;

        const newAffair = new CurrentAffair({
            date: date || Date.now(),
            title,
            content,
            category,
            pdfLink,
            groupName: groupName || "", // 👈 NEW: Saved to DB
            order: newOrder
        });

        await newAffair.save(); 
        res.status(201).json({ message: "Study guide saved!", data: newAffair });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

app.put('/api/current-affairs/:id', verifyAdmin, async (req, res) => {
    try {
        const { title, content, groupName } = req.body; // 👈 NEW: Extracted groupName
        const updatedAffair = await CurrentAffair.findByIdAndUpdate(req.params.id, { title, content, groupName }, { new: true });
        res.json(updatedAffair);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

app.delete('/api/current-affairs/:id', verifyAdmin, async (req, res) => {
    try {
        await CurrentAffair.findByIdAndDelete(req.params.id);
        res.json({ message: "Current affair deleted successfully" });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// ==========================================
// 🤖 13. THE NEW AI PDF REWRITE ENGINE (Native Gemini)
// ==========================================
app.post('/api/ai-rewrite', verifyAdmin, upload.single('pdfFile'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: "No PDF file uploaded." });
        
        const { title, category, pdfLink, groupName } = req.body; // 👈 NEW: Extracted groupName
        if (!title || !category) return res.status(400).json({ message: "Title and Category are required." });

        console.log(`📄 Formatting PDF for Gemini: ${req.file.originalname}`);
        
        const pdfPart = {
            inlineData: {
                data: req.file.buffer.toString("base64"),
                mimeType: "application/pdf"
            }
        };

        let formattingRules = "";
        
        if (category === "Weekly Current Affairs") {
            formattingRules = `Categorize into exactly these headers (Only include headers that have relevant news):
### 🏛️ POLITY & GOVERNANCE
### 💹 ECONOMY & BANKING
### 🌍 INTERNATIONAL & DEFENSE
### 🚀 SCIENCE & ENVIRONMENT
### 🏆 AWARDS, APPOINTMENTS & SPORTS
### 🦏 ASSAM & NORTHEAST`;
        } else {
            formattingRules = `Since this document is already focused on a specific topic, DO NOT use the standard weekly categories. 
Instead, use the document's main topic as the single primary header (formatted exactly with three hashes and a space, e.g., '### National News'). 
Extract EVERY SINGLE factual point from the document under this one header.`;
        }

        const prompt = `Act as the Master Content Creator for Indian competitive exams.

YOUR MISSION:
1. Read the document and extract EVERY SINGLE factual news point. Be highly detailed. DO NOT summarize or skip any events.
2. COMPLETELY REWRITE the text to avoid copyright.
3. Remove any branding from the original author.

CRITICAL FORMATTING RULES:
- You MUST format category headers exactly as Markdown Level 3 headings.
- Start the header line with exactly three hashes and a space (e.g., ### 🏛️ POLITY & GOVERNANCE).
- DO NOT put backslashes (\\) before the hashes. Do NOT escape the markdown.
- DO NOT add empty spaces before the hashes.
- DO NOT use bold text (**...**) for headers.
- Provide a blank line before and after every header.
- Format using standard Markdown: '-' for bullet points.

${formattingRules}`;

        console.log(`🧠 Handing PDF directly to Gemini AI...`);

        const result = await aiModel.generateContent([prompt, pdfPart]);
        const rewrittenContent = result.response.text();

        const topItem = await CurrentAffair.findOne({ category }).sort({ order: 1 });
        const newOrder = topItem && topItem.order !== undefined ? topItem.order - 1 : 0;

        const newAffair = new CurrentAffair({
            title: title,
            content: rewrittenContent,
            category: category,
            pdfLink: pdfLink || "",
            groupName: groupName || "", // 👈 NEW: Saved to DB
            order: newOrder
        });

        await newAffair.save();
        console.log(`✅ Successfully rewritten and published: ${title}`);
        
        res.status(201).json({ message: "AI successfully rewrote and published the PDF!", data: newAffair });

    } catch (error) {
        console.error("❌ AI Rewrite Error:", error);
        // 🕵️‍♂️ Enhanced error reporting
        const serverError = error.response?.data?.error || error.response?.data?.message || error.message;
        res.status(500).json({ error: serverError });
    }
});

// ==========================================
// 🏁 START SERVER
// ==========================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Secure Server running on port ${PORT}`));