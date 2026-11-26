const mongoose = require("mongoose");

const cameraSchema = new mongoose.Schema({
    organization_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Organization",
        required: true,
        index: true
    },

    name: {
        type: String,
        required: true,
        trim: true
    },

    location: {
        type: String,
        default: "Main Entrance",
        trim: true
    },

    stream_url: {
        type: String,
        default: "",
        trim: true
    },

    status: {
        type: String,
        enum: ["active", "offline", "maintenance"],
        default: "active"
    },

    camera_type: {
        type: String,
        enum: ["indoor", "outdoor", "perimeter", "entrance"],
        default: "indoor"
    },

    resolution: {
        type: String,
        default: "1080p"
    },

    fps: {
        type: Number,
        default: 30
    },

    zone_name: {
        type: String,
        default: "Zone A"
    },

    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    last_heartbeat: {
        type: Date,
        default: Date.now
    },

    alert_count: {
        type: Number,
        default: 0
    },

    assigned_activities: {
        type: [String],
        default: ["Restricted Area", "Sudden Run", "Loitering"]
    }

}, {
    timestamps: true
});

module.exports = mongoose.model("Camera", cameraSchema);
