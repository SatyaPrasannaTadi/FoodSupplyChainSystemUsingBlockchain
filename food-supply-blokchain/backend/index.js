require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const productRoutes = require("./routes/product.routes");
const Product = require("./models/Product");
const { generateMockProducts } = require("./utils/mockData");

const app = express();

// Configure CORS to allow requests from frontend
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001', 'https://food-supply-chain-system-using-blockchain-30itxzcte.vercel.app'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 200
}));
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.error("MongoDB connection error:", err));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);

// Blockchain routes - REMOVED (Replaced by direct smart contract interaction from frontend)

// Initialize mock data (optional - uncomment to populate on startup)
/*
async function initializeMockData() {
    try {
        const count = await Product.countDocuments();
        if (count === 0) {
            console.log("Initializing mock data...");
            const mockProducts = generateMockProducts();

            for (const productData of mockProducts) {
                // Blockchain interaction is now handled by frontend + smart contract
                // We cannot generate valid blockchain hashes here without a wallet
                
                // Save to database without blockchain hashes for now
                productData.blockchainHashes = []; 

                await Product.create(productData);
            }

            console.log(`Mock data initialized: ${mockProducts.length} products created`);
        }
    } catch (error) {
        console.error("Error initializing mock data:", error);
    }
}
*/

// Uncomment to enable mock data on startup
// mongoose.connection.once('open', initializeMockData);

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
