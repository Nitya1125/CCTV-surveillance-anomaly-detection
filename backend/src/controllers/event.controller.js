const Event = require("../models/events");
const Video = require("../models/videos");

// ================= GET EVENTS WITH FILTERS & PAGINATION =================
exports.getEvents = async (req, res) => {
    try {
        const orgId = req.user.organization_id;
        if (!orgId) {
            return res.json({ events: [], total: 0, page: 1, totalPages: 0 });
        }

        const {
            event_type,
            risk_level,
            status,
            search,
            camera_id,
            page = 1,
            limit = 15,
            sort = "-createdAt"
        } = req.query;

        const query = { organization_id: orgId };

        if (event_type && event_type !== "all") {
            query.event_type = event_type;
        }

        if (risk_level && risk_level !== "all") {
            query.risk_level = risk_level;
        }

        if (status && status !== "all") {
            query.status = status;
        }

        if (camera_id && camera_id !== "all") {
            query.camera_id = camera_id;
        }

        if (search) {
            query.$or = [
                { camera_name: { $regex: search, $options: "i" } },
                { event_type: { $regex: search, $options: "i" } },
                { notes: { $regex: search, $options: "i" } }
            ];
        }

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        const total = await Event.countDocuments(query);
        const events = await Event.find(query)
            .sort(sort)
            .skip(skip)
            .limit(limitNum)
            .populate("uploaded_by", "name email")
            .populate("video_id", "filename annotated_video_url processing_status")
            .populate("assigned_to", "name email");

        res.json({
            events,
            total,
            page: pageNum,
            totalPages: Math.ceil(total / limitNum)
        });

    } catch (error) {
        console.error("Get events error:", error);
        res.status(500).json({
            message: "Failed to fetch surveillance events",
            error: error.message
        });
    }
};

// ================= GET EVENT / INCIDENT METRICS =================
exports.getEventStats = async (req, res) => {
    try {
        const orgId = req.user.organization_id;
        if (!orgId) {
            return res.json({
                total: 0,
                byType: [],
                bySeverity: [],
                byStatus: [],
                trends: []
            });
        }

        const allEvents = await Event.find({ organization_id: orgId });

        const total = allEvents.length;

        // Group by event type
        const typeCounts = {
            "restricted_area_entry": 0,
            "sudden_running": 0,
            "loitering": 0,
            "unauthorized_access": 0
        };

        // Group by severity
        const severityCounts = {
            critical: 0,
            high: 0,
            medium: 0,
            low: 0
        };

        // Group by status
        const statusCounts = {
            detected: 0,
            investigating: 0,
            resolved: 0,
            false_alarm: 0
        };

        allEvents.forEach(e => {
            if (typeCounts[e.event_type] !== undefined) typeCounts[e.event_type]++;
            else typeCounts[e.event_type] = 1;

            if (severityCounts[e.risk_level] !== undefined) severityCounts[e.risk_level]++;
            if (statusCounts[e.status] !== undefined) statusCounts[e.status]++;
        });

        // Generate 7-day trend history
        const now = new Date();
        const trends = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().slice(0, 10);
            const dayLabel = date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

            const countForDay = allEvents.filter(e => {
                const eventDate = new Date(e.createdAt).toISOString().slice(0, 10);
                return eventDate === dateStr;
            }).length;

            trends.push({
                date: dayLabel,
                incidents: countForDay,
                critical: allEvents.filter(e => new Date(e.createdAt).toISOString().slice(0, 10) === dateStr && (e.risk_level === 'high' || e.risk_level === 'critical')).length
            });
        }

        res.json({
            total,
            byType: [
                { name: "Restricted Area", value: typeCounts["restricted_area_entry"] || 0, key: "restricted_area_entry" },
                { name: "Sudden Running", value: typeCounts["sudden_running"] || 0, key: "sudden_running" },
                { name: "Loitering", value: typeCounts["loitering"] || 0, key: "loitering" }
            ],
            bySeverity: [
                { name: "Critical", value: severityCounts.critical, color: "#DC4545" },
                { name: "High", value: severityCounts.high, color: "#E59A23" },
                { name: "Medium", value: severityCounts.medium, color: "#2563EB" },
                { name: "Low", value: severityCounts.low, color: "#16A36A" }
            ],
            byStatus: statusCounts,
            trends
        });

    } catch (error) {
        console.error("Event stats error:", error);
        res.status(500).json({
            message: "Failed to fetch event statistics",
            error: error.message
        });
    }
};

// ================= UPDATE EVENT INCIDENT STATUS =================
exports.updateEventStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const orgId = req.user.organization_id;
        const userId = req.user.id;
        const { status, notes, assigned_to, risk_level } = req.body;

        const updateData = {};
        if (status) {
            updateData.status = status;
            if (status === "resolved") {
                updateData.resolved_at = new Date();
                updateData.resolved_by = userId;
            }
        }
        if (notes !== undefined) updateData.notes = notes;
        if (assigned_to !== undefined) updateData.assigned_to = assigned_to || null;
        if (risk_level) updateData.risk_level = risk_level;

        const updated = await Event.findOneAndUpdate(
            { _id: id, organization_id: orgId },
            { $set: updateData },
            { new: true }
        ).populate("assigned_to", "name email");

        if (!updated) {
            return res.status(404).json({ message: "Event not found" });
        }

        res.json({
            message: "Incident status updated successfully",
            event: updated
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to update incident",
            error: error.message
        });
    }
};

// ================= DELETE EVENT =================
exports.deleteEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const orgId = req.user.organization_id;

        const deleted = await Event.findOneAndDelete({ _id: id, organization_id: orgId });
        if (!deleted) {
            return res.status(404).json({ message: "Event not found" });
        }

        res.json({ message: "Event record cleared" });

    } catch (error) {
        res.status(500).json({
            message: "Failed to delete event",
            error: error.message
        });
    }
};
