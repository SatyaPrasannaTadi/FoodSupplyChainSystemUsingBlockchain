const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
// const blockchain = require('../blockchain/blockchain'); // Removed fake blockchain
const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

// Load ABI
const abiPath = path.join(__dirname, '../abis/FoodSupplyChain.json');
let contractABI = null;
let contractAddress = null;

if (fs.existsSync(abiPath)) {
    const abiData = JSON.parse(fs.readFileSync(abiPath, 'utf8'));
    contractABI = abiData.abi;
    contractAddress = abiData.address;
}

// Dynamic import for uuid (ES Module)
let uuidv4;
(async () => {
    const uuid = await import('uuid');
    uuidv4 = uuid.v4;
})();

// Helper to get provider (optional, for verification)
const getProvider = () => {
    return new ethers.JsonRpcProvider("http://127.0.0.1:7545");
};

// Register a new product (Producer)
router.post('/register', async (req, res) => {
    try {
        const { name, category, origin, producer, productionDate, expiryDate, quantity, metadata, transactionHash, blockNumber } = req.body;

        // Ensure uuid is loaded
        if (!uuidv4) {
            const uuid = await import('uuid');
            uuidv4 = uuid.v4;
        }

        // Generate ID - In a real app, this might come from the contract event or be consistent
        // Use the ID provided by frontend if available (since they called createProduct(id...))
        const productId = req.body.productId || `FSC-${Date.now()}-${uuidv4().substring(0, 8).toUpperCase()}`;

        // Create product in database
        const product = new Product({
            productId,
            name,
            category,
            origin,
            producer,
            productionDate,
            expiryDate,
            quantity,
            currentStatus: 'registered',
            metadata,
            blockchainHashes: [{
                blockIndex: blockNumber,
                transactionHash: transactionHash,
                action: 'PRODUCT_REGISTERED',
                timestamp: new Date()
            }]
        });

        await product.save();

        res.status(201).json({
            success: true,
            message: 'Product registered successfully',
            product
        });
    } catch (error) {
        console.error('Error registering product:', error);
        res.status(500).json({ success: false, message: 'Error registering product', error: error.message });
    }
});

// Update transport status (Supplier)
router.put('/:id/transport', async (req, res) => {
    try {
        const { status, location, temperature, condition, updatedBy, transactionHash, blockNumber } = req.body;
        const product = await Product.findOne({ productId: req.params.id });

        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        // Update product
        product.transportHistory.push({
            status,
            location,
            temperature,
            condition,
            timestamp: new Date(),
            updatedBy,
            blockchainBlockIndex: blockNumber
        });

        product.currentStatus = status;
        product.blockchainHashes.push({
            blockIndex: blockNumber,
            transactionHash: transactionHash,
            action: 'TRANSPORT_UPDATE',
            timestamp: new Date()
        });

        await product.save();

        res.json({
            success: true,
            message: 'Transport status updated',
            product
        });
    } catch (error) {
        console.error('Error updating transport:', error);
        res.status(500).json({ success: false, message: 'Error updating transport status', error: error.message });
    }
});

// Verify product (Retailer)
router.put('/:id/verify', async (req, res) => {
    try {
        const { verifiedBy, status, notes, transactionHash, blockNumber } = req.body;
        const product = await Product.findOne({ productId: req.params.id });

        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        // Update product
        product.verificationHistory.push({
            verifiedBy,
            timestamp: new Date(),
            status,
            notes,
            blockchainBlockIndex: blockNumber
        });

        product.currentStatus = 'verified';
        product.blockchainHashes.push({
            blockIndex: blockNumber,
            transactionHash: transactionHash,
            action: 'PRODUCT_VERIFIED',
            timestamp: new Date()
        });

        await product.save();

        res.json({
            success: true,
            message: 'Product verified successfully',
            product
        });
    } catch (error) {
        console.error('Error verifying product:', error);
        res.status(500).json({ success: false, message: 'Error verifying product', error: error.message });
    }
});

// Get product details and history (Consumer)
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findOne({ productId: req.params.id });

        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        // For now, we return the stored blockchainHashes. 
        // In a real app, we might verify them against the provider here.

        res.json({
            success: true,
            product,
            blockchainData: product.blockchainHashes,
            contractAddress: contractAddress,
            contractABI: contractABI // Optional: Send ABI to frontend if needed dynamically
        });
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ success: false, message: 'Error fetching product', error: error.message });
    }
});

// Get all products (Admin / List)
router.get('/', async (req, res) => {
    try {
        const { category, status, producer } = req.query;
        let filter = {};

        if (category) filter.category = category;
        if (status) filter.currentStatus = status;
        if (producer) filter['producer.name'] = new RegExp(producer, 'i');

        const products = await Product.find(filter).sort({ createdAt: -1 });

        res.json({
            success: true,
            count: products.length,
            products
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ success: false, message: 'Error fetching products', error: error.message });
    }
});

// Get QR code data for product
router.get('/:id/qr', async (req, res) => {
    try {
        const product = await Product.findOne({ productId: req.params.id });

        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        // Return data that can be encoded in QR
        const qrData = {
            productId: product.productId,
            name: product.name,
            producer: product.producer.name,
            productionDate: product.productionDate,
            verifyUrl: `${req.protocol}://${req.get('host')}/dashboard/consumer?id=${product.productId}` // Point to frontend
        };

        res.json({
            success: true,
            qrData,
            qrString: JSON.stringify(qrData)
        });
    } catch (error) {
        console.error('Error generating QR data:', error);
        res.status(500).json({ success: false, message: 'Error generating QR data', error: error.message });
    }
});

module.exports = router;
