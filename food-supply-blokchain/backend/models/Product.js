const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    productId: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true,
        enum: ['fruits', 'vegetables', 'dairy', 'meat', 'grains', 'seafood', 'beverages', 'other']
    },
    origin: {
        location: String,
        farmName: String,
        coordinates: {
            lat: Number,
            lng: Number
        }
    },
    producer: {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        name: String,
        contact: String
    },
    productionDate: {
        type: Date,
        required: true
    },
    expiryDate: {
        type: Date
    },
    quantity: {
        value: Number,
        unit: String
    },
    currentStatus: {
        type: String,
        enum: ['registered', 'in_transit', 'at_warehouse', 'at_retailer', 'delivered', 'verified'],
        default: 'registered'
    },
    transportHistory: [{
        status: String,
        location: String,
        temperature: Number,
        condition: String,
        timestamp: Date,
        updatedBy: {
            userId: mongoose.Schema.Types.ObjectId,
            name: String
        },
        blockchainBlockIndex: Number
    }],
    verificationHistory: [{
        verifiedBy: {
            userId: mongoose.Schema.Types.ObjectId,
            name: String,
            role: String
        },
        timestamp: Date,
        status: String,
        notes: String,
        blockchainBlockIndex: Number
    }],
    blockchainHashes: [{
        blockIndex: Number,
        transactionHash: String,
        hash: String, // Keep legacy or use for blockHash
        action: String,
        timestamp: Date
    }],
    qrCode: String,
    metadata: {
        certifications: [String],
        qualityGrade: String,
        description: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Product', productSchema);
