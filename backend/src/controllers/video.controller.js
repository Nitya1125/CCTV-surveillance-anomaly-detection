const Video = require("../models/videos");
const Event = require("../models/events");
const User = require("../models/users");
const Camera = require("../models/cameras");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const FormData = require("form-data");

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://127.0.0.1:8000";

// ================= UPLOAD & PROCESS VIDEO =================
exports.uploadVideo = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);

        if (!user || !user.organization_id) {
            return res.status(400).json({
                message: "User must belong to an organization to upload footage."
            });
        }

        if (!req.file) {
            return res.status(400).json({ message: "No video file provided" });
        }

        const selectedActivities = req.body.selectedActivities
            ? JSON.parse(req.body.selectedActivities)
            : ["Restricted Area", "Sudden Run", "Loitering"];

        const zoneCoordinates = req.body.zoneCoordinates
            ? JSON.parse(req.body.zoneCoordinates)
            : null;

        const cameraName = req.body.cameraName || "Surveillance Feed 01";
        const cameraId = req.body.cameraId || null;

        // Save video record in DB
        const video = await Video.create({
            organization_id: user.organization_id,
            uploaded_by: userId,
            filename: req.file.originalname,
            video_path: req.file.path,
            selected_activities: selectedActivities,
            zone_coordinates: zoneCoordinates,
            processing_status: "processing"
        });

        // Forward video to Python AI service
        try {
            const formData = new FormData();
            formData.append("video", fs.createReadStream(req.file.path), {
                filename: req.file.originalname,
                contentType: req.file.mimetype || "video/mp4"
            });

            // Default bounding zone if none provided
            const zones = (zoneCoordinates && zoneCoordinates.length > 2)
                ? zoneCoordinates
                : [[50, 50], [400, 50], [400, 350], [50, 350]];

            formData.append("zones", JSON.stringify(zones));
            formData.append("selected_activities", JSON.stringify(selectedActivities));

            const aiResponse = await axios.post(
                `${AI_SERVICE_URL}/analyze-video`,
                formData,
                {
                    headers: formData.getHeaders(),
                    maxContentLength: Infinity,
                    maxBodyLength: Infinity,
                    timeout: 300000 // 5 min timeout for video processing
                }
            );

            const aiResult = aiResponse.data;

            // Map user-friendly activity names to event_types
            const activityMap = {
                "Loitering": "loitering",
                "Restricted Area": "restricted_area_entry",
                "Sudden Run": "sudden_running"
            };

            const selectedTypes = selectedActivities.map(a => activityMap[a]).filter(Boolean);

            const rawEvents = aiResult.events || [];
            const filteredEvents = rawEvents.filter(
                e => selectedTypes.length === 0 || selectedTypes.includes(e.event_type)
            );

            // Update video record
            video.events = filteredEvents;
            video.annotated_video_url = aiResult.annotated_video_url || null;
            video.processing_status = "processed";
            await video.save();

            // Save each event to the Event collection for centralized alerting
            for (const event of filteredEvents) {
                await Event.create({
                    video_id: video._id,
                    camera_id: cameraId || undefined,
                    camera_name: cameraName,
                    organization_id: user.organization_id,
                    uploaded_by: userId,
                    event_type: event.event_type,
                    timestamp_seconds: event.timestamp_seconds || 0,
                    risk_level: event.risk_level || (event.event_type === "restricted_area_entry" ? "high" : "medium"),
                    person_id: event.person_id || 1,
                    confidence: event.confidence || 0.85,
                    status: "detected"
                });
            }

            // Clean up temporary server upload file
            if (fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }

            res.json({
                message: "Video processed and analyzed successfully",
                video: {
                    _id: video._id,
                    filename: video.filename,
                    processing_status: video.processing_status,
                    events: filteredEvents,
                    annotated_video_url: video.annotated_video_url,
                    createdAt: video.createdAt
                }
            });

        } catch (aiError) {
            console.error("AI service communication error:", aiError.message);
            video.processing_status = "failed";
            await video.save();

            if (fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }

            res.status(502).json({
                message: "AI analysis service was unreachable or encountered an error. Ensure the Python microservice is active on port 8000.",
                error: aiError.message,
                video: {
                    _id: video._id,
                    filename: video.filename,
                    processing_status: "failed"
                }
            });
        }

    } catch (error) {
        console.error("Upload error:", error);
        res.status(500).json({
            message: "Video upload failed",
            error: error.message
        });
    }
};

// ================= GET VIDEOS LIST =================
exports.getVideos = async (req, res) => {
    try {
        const orgId = req.user.organization_id;
        if (!orgId) return res.json({ videos: [] });

        const { page = 1, limit = 12 } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        const total = await Video.countDocuments({ organization_id: orgId });
        const videos = await Video.find({ organization_id: orgId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum)
            .populate("uploaded_by", "name email");

        res.json({
            videos,
            total,
            page: pageNum,
            totalPages: Math.ceil(total / limitNum)
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch videos",
            error: error.message
        });
    }
};

// ================= GET SINGLE VIDEO DETAILS =================
exports.getVideoById = async (req, res) => {
    try {
        const { id } = req.params;
        const orgId = req.user.organization_id;

        const video = await Video.findOne({ _id: id, organization_id: orgId })
            .populate("uploaded_by", "name email");

        if (!video) {
            return res.status(404).json({ message: "Video record not found" });
        }

        const events = await Event.find({ video_id: video._id })
            .sort({ timestamp_seconds: 1 });

        res.json({ video, events });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch video details",
            error: error.message
        });
    }
};

// ================= DELETE VIDEO =================
exports.deleteVideo = async (req, res) => {
    try {
        const { id } = req.params;
        const orgId = req.user.organization_id;

        const video = await Video.findOneAndDelete({ _id: id, organization_id: orgId });
        if (!video) {
            return res.status(404).json({ message: "Video not found" });
        }

        // Clean up linked events
        await Event.deleteMany({ video_id: id });

        res.json({ message: "Video and associated alerts removed successfully" });

    } catch (error) {
        res.status(500).json({
            message: "Failed to delete video",
            error: error.message
        });
    }
};

// ================= GET COMPREHENSIVE DASHBOARD STATS =================
exports.getDashboardStats = async (req, res) => {
    try {
        const orgId = req.user.organization_id;

        if (!orgId) {
            return res.json({
                totalVideos: 0,
                totalIncidents: 0,
                criticalAlerts: 0,
                totalUsers: 0,
                eventsByType: [],
                recentEvents: [],
                recentVideos: []
            });
        }

        const totalVideos = await Video.countDocuments({ organization_id: orgId });
        const totalUsers = await User.countDocuments({ organization_id: orgId });

        const allEvents = await Event.find({ organization_id: orgId });
        const totalIncidents = allEvents.length;

        const criticalAlerts = allEvents.filter(e => e.risk_level === "high" || e.risk_level === "critical").length;

        // Group events by type
        const loitering = allEvents.filter(e => e.event_type === "loitering").length;
        const restrictedArea = allEvents.filter(e => e.event_type === "restricted_area_entry").length;
        const suddenRun = allEvents.filter(e => e.event_type === "sudden_running").length;

        const eventsByType = [
            { name: "Restricted Area", value: restrictedArea, color: "#DC4545" },
            { name: "Sudden Running", value: suddenRun, color: "#E59A23" },
            { name: "Loitering", value: loitering, color: "#2563EB" }
        ];

        // Fetch recent alerts for the live dashboard feed
        const recentEvents = await Event.find({ organization_id: orgId })
            .sort({ createdAt: -1 })
            .limit(6)
            .populate("uploaded_by", "name");

        // Fetch recent videos
        const recentVideos = await Video.find({ organization_id: orgId })
            .sort({ createdAt: -1 })
            .limit(4);

        res.json({
            totalVideos,
            totalIncidents,
            criticalAlerts,
            totalUsers,
            eventsByType,
            recentEvents,
            recentVideos
        });

    } catch (error) {
        console.error("Dashboard stats error:", error);
        res.status(500).json({
            message: "Failed to fetch dashboard stats",
            error: error.message
        });
    }
};
