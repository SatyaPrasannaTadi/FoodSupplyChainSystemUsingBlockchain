require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const productRoutes = require("./routes/product.routes");
const Product = require("./models/Product");
const { generateMockProducts } = require("./utils/mockData");

const app = express();


// ✅ 🔥 FINAL CORS FIX (NO ERRORS)
app.use(cors({
    origin: "*",   // allow all (fixes Vercel issue completely)
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));


// ✅ Middleware
app.use(express.json());


// ✅ MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.error("MongoDB connection error:", err));


// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);


// ✅ OPTIONAL MOCK DATA (UNCHANGED)
async function initializeMockData() {
    try {
        const count = await Product.countDocuments();
        if (count === 0) {
            console.log("Initializing mock data...");
            const mockProducts = generateMockProducts();

            for (const productData of mockProducts) {
                productData.blockchainHashes = [];
                await Product.create(productData);
            }

            console.log(`Mock data initialized: ${mockProducts.length} products created`);
        }
    } catch (error) {
        console.error("Error initializing mock data:", error);
    }
}

// Uncomment if needed
// mongoose.connection.once('open', initializeMockData);


// ✅ Start Server
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});