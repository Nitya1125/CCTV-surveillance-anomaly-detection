const mongoose = require("mongoose");

const organizationSchema = new mongoose.Schema({
    organization_name: {
        type: String,
        required: true,
        trim: true
    },

    org_type: {
        type: String,
        enum: ["Company", "College", "Office", "Startup", "Enterprise", "Other"],
        default: "Company"
    },

    join_code: {
        type: String,
        required: true,
        unique: true
    },

    owner_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    admin_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    status: {
        type: String,
        enum: ["active", "pending", "suspended"],
        default: "active"
    },

    settings: {
        retention_days: {
            type: Number,
            default: 30
        },
        auto_alerts: {
            type: Boolean,
            default: true
        },
        sensitivity: {
            type: String,
            enum: ["low", "standard", "high"],
            default: "standard"
        }
    }

}, {
    timestamps: true
});

module.exports = mongoose.model("Organization", organizationSchema);
