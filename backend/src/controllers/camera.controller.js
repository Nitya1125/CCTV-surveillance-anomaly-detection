const Camera = require("../models/cameras");
const Event = require("../models/events");

// ================= GET ALL CAMERAS (Scoped to Organization) =================
exports.getCameras = async (req, res) => {
    try {
        const orgId = req.user.organization_id;
        if (!orgId) {
            return res.json({ cameras: [] });
        }

        const { status, type, search } = req.query;

        const filter = { organization_id: orgId };
        if (status && status !== "all") {
            filter.status = status;
        }
        if (type && type !== "all") {
            filter.camera_type = type;
        }
        if (search) {
            filter.name = { $regex: search, $options: "i" };
        }

        const cameras = await Camera.find(filter).sort({ createdAt: -1 });

        // Augment with recent alert count
        const camerasWithStats = await Promise.all(
            cameras.map(async (cam) => {
                const alertCount = await Event.countDocuments({
                    organization_id: orgId,
                    $or: [
                        { camera_id: cam._id },
                        { camera_name: { $regex: cam.name, $options: "i" } }
                    ]
                });
                return {
                    ...cam.toObject(),
                    recentAlerts: alertCount
                };
            })
        );

        res.json({ cameras: camerasWithStats });

    } catch (error) {
        console.error("Get cameras error:", error);
        res.status(500).json({
            message: "Failed to fetch cameras",
            error: error.message
        });
    }
};

// ================= GET CAMERA BY ID =================
exports.getCameraById = async (req, res) => {
    try {
        const { id } = req.params;
        const orgId = req.user.organization_id;

        const camera = await Camera.findOne({ _id: id, organization_id: orgId });
        if (!camera) {
            return res.status(404).json({ message: "Camera not found in your organization" });
        }

        const recentEvents = await Event.find({
            organization_id: orgId,
            $or: [
                { camera_id: camera._id },
                { camera_name: { $regex: camera.name, $options: "i" } }
            ]
        }).sort({ createdAt: -1 }).limit(10);

        res.json({ camera, recentEvents });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch camera",
            error: error.message
        });
    }
};

// ================= CREATE CAMERA =================
exports.createCamera = async (req, res) => {
    try {
        const orgId = req.user.organization_id;
        const userId = req.user.id;

        if (!orgId) {
            return res.status(400).json({ message: "Organization required to register cameras" });
        }

        const { name, location, stream_url, camera_type, resolution, fps, zone_name, assigned_activities } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ message: "Camera name is required" });
        }

        const camera = await Camera.create({
            organization_id: orgId,
            name: name.trim(),
            location: location || "Main Facility",
            stream_url: stream_url || "",
            camera_type: camera_type || "indoor",
            resolution: resolution || "1080p",
            fps: fps || 30,
            zone_name: zone_name || "Zone A",
            status: "active",
            created_by: userId,
            assigned_activities: assigned_activities || ["Restricted Area", "Sudden Run", "Loitering"]
        });

        res.status(201).json({
            message: "Camera registered successfully",
            camera
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to create camera",
            error: error.message
        });
    }
};

// ================= UPDATE CAMERA =================
exports.updateCamera = async (req, res) => {
    try {
        const { id } = req.params;
        const orgId = req.user.organization_id;

        const updated = await Camera.findOneAndUpdate(
            { _id: id, organization_id: orgId },
            { $set: req.body },
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({ message: "Camera not found" });
        }

        res.json({
            message: "Camera updated successfully",
            camera: updated
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to update camera",
            error: error.message
        });
    }
};

// ================= DELETE CAMERA =================
exports.deleteCamera = async (req, res) => {
    try {
        const { id } = req.params;
        const orgId = req.user.organization_id;

        const deleted = await Camera.findOneAndDelete({ _id: id, organization_id: orgId });
        if (!deleted) {
            return res.status(404).json({ message: "Camera not found" });
        }

        res.json({ message: "Camera removed successfully" });

    } catch (error) {
        res.status(500).json({
            message: "Failed to delete camera",
            error: error.message
        });
    }
};
