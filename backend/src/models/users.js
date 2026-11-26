const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },

    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },

    phone: {
        type: String,
        trim: true
    },

    password_hash: {
        type: String,
        required: true
    },

    role: {
        type: String,
        enum: ["owner", "admin", "operator", "viewer", "super_admin"],
        required: true,
        default: "operator"
    },

    organization_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Organization"
    },

    status: {
        type: String,
        enum: ["active", "pending", "suspended"],
        default: "active"
    }

}, {
    timestamps: true
});

module.exports = mongoose.model("User", userSchema);
