const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema({
    organization_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Organization",
        required: true
    },

    uploaded_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    filename: {
        type: String,
        required: true
    },

    video_path: {
        type: String,
        required: true
    },

    selected_activities: {
        type: [String],
        default: []
    },

    zone_coordinates: {
        type: Array,
        default: null
    },

    processing_status: {
        type: String,
        enum: ["pending", "processing", "processed", "failed"],
        default: "pending"
    },

    events: [{
        event_type: String,
        person_id: Number,
        timestamp_seconds: Number,
        risk_level: String,
        confidence: Number
    }],

    annotated_video_url: {
        type: String
    },

    upload_time: {
        type: Date,
        default: Date.now
    }

}, {
    timestamps: true
});

module.exports = mongoose.model("Video", videoSchema);