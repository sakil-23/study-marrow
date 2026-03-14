const dns = require('dns');
const mongoose = require('mongoose');
const Material = require('./models/Material'); 
require('dotenv').config();

// --- THE FIX START ---
// We force your computer to use Google's Phonebook (DNS)
try {
    dns.setServers(['8.8.8.8', '8.8.4.4']);
    console.log("✅ DNS forced to Google (8.8.8.8)");
} catch (e) {
    console.log("⚠️ Could not force DNS (proceeding anyway)...");
}
// --- THE FIX END ---

const sampleMaterials = [
    {
        title: "Class 10 Science NCERT Solutions",
        category: "Class 10",
        subCategory: "NCERT Solutions",
        type: "PDF",
        link: "https://example.com/class10-science.pdf"
    },
    {
        title: "Class 10 Math Formula Sheet",
        category: "Class 10",
        subCategory: "Handwritten Notes",
        type: "PDF",
        link: "https://example.com/class10-math-formulas.pdf"
    },
    {
        title: "Class 12 Physics: Electrostatics Notes",
        category: "Class 12",
        subCategory: "Handwritten Notes",
        type: "PDF",
        link: "https://example.com/class12-physics.pdf"
    },
    {
        title: "October 2023 Current Affairs",
        category: "Current Affairs",
        subCategory: "Monthly",
        type: "Article",
        link: "https://example.com/current-affairs-oct.pdf"
    }
];

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ MongoDB Connected");

        await Material.deleteMany({});
        console.log("🗑️  Old data cleared");

        await Material.insertMany(sampleMaterials);
        console.log("🌱 Database Seeded Successfully!");

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedDB();