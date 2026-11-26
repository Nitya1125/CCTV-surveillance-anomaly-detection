const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
    video_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video"
    },

    camera_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Camera"
    },

    camera_name: {
        type: String,
        default: "Camera 01"
    },

    organization_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Organization",
        required: true,
        index: true
    },

    uploaded_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    event_type: {
        type: String,
        enum: ["loitering", "sudden_running", "restricted_area_entry", "unauthorized_access", "motion_detected"],
        required: true
    },

    timestamp_seconds: {
        type: Number,
        default: 0
    },

    risk_level: {
        type: String,
        enum: ["low", "medium", "high", "critical"],
        default: "medium"
    },

    person_id: {
        type: Number
    },

    confidence: {
        type: Number,
        default: 0.85
    },

    status: {
        type: String,
        enum: ["detected", "investigating", "resolved", "false_alarm"],
        default: "detected"
    },

    notes: {
        type: String,
        default: ""
    },

    assigned_to: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    resolved_at: {
        type: Date
    },

    resolved_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }

}, {
    timestamps: true
});

module.exports = mongoose.model("Event", eventSchema);
