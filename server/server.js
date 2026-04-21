const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken'); 
const rateLimit = require('express-rate-limit'); // 🛡️ NEW: The Rate Limiter Package
require('dotenv').config();

const app = express();

// ==========================================
// 1. UPDATED CORS HANDSHAKE
// ==========================================
app.use(cors({
  // 🔥 FIXED: Added your official live domains to the VIP allowed list!
  origin: [
    'https://study-marrow-careers.vercel.app', 
    'http://localhost:5173',
    'https://careers.studymarrow.in',
    'https://www.careers.studymarrow.in'
  ], 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'] 
}));
app.use(express.json()); 

// ==========================================
// 2. DATABASE CONNECTION
// ==========================================
console.log("Connecting to Study Marrow database...");
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Successfully connected to MongoDB Atlas!'))
  .catch((err) => console.log('❌ Database connection error:', err.message));

// ==========================================
// 🛡️ NEW: RATE LIMITER FOR LOGIN
// ==========================================
// This creates a strict rule: Max 3 attempts per 3 hours from the same IP address
const loginLimiter = rateLimit({
  windowMs: 3 * 60 * 60 * 1000, // 3 hours in milliseconds
  max: 3, // Limit each IP to exactly 3 requests per window (3 hours)
  message: { 
    success: false, 
    message: '🚨 SECURITY LOCKDOWN: Too many login attempts. Your IP has been blocked for 3 hours.' 
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// ==========================================
// 🔐 3. SECURE LOGIN ROUTE (With Limiter Attached)
// ==========================================
// Notice we put 'loginLimiter' right in the middle to guard the door!
app.post('/api/auth/login', loginLimiter, (req, res) => {
  const { password } = req.body;
  
  if (password === process.env.ADMIN_PASSWORD) {
    const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.json({ success: true, token });
  } else {
    res.status(401).json({ success: false, message: 'Invalid password. Access Denied.' });
  }
});

// ==========================================
// 4. API ROUTES
// ==========================================
const jobRoutes = require('./routes/jobRoutes'); 
app.use('/api/jobs', jobRoutes); 

const noticeRoutes = require('./routes/noticeRoutes'); 
app.use('/api/notices', noticeRoutes);

const impLinkRoutes = require('./routes/impLinkRoutes');
app.use('/api/implinks', impLinkRoutes);

const contactRoutes = require('./routes/contactRoutes');
app.use('/api/contacts', contactRoutes);

const subscriberRoutes = require('./routes/subscriberRoutes');
app.use('/api/subscribe', subscriberRoutes);

app.get('/', (req, res) => {
  res.send('🚀 Study Marrow Careers API is Live and Secured!');
});

// ==========================================
// 5. SERVER STARTUP
// ==========================================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`📡 Server is live on port: ${PORT}`);
});