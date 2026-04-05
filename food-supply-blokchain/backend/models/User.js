const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
        type: String,
        required: true,
        enum: ['producer', 'supplier', 'retailer', 'consumer', 'admin', 'distributor'],
        default: 'consumer'
    },
    organization: { type: String },
    phone: { type: String },
    address: { type: String },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", UserSchema);
