const User = require("../models/users");
const Organization = require("../models/organizations");
const Video = require("../models/videos");
const Event = require("../models/events");

exports.getStats = async (req, res) => {
    try {
        const totalOrganizations = await Organization.countDocuments();
        const pendingAdmins = await User.countDocuments({ role: "admin", status: "pending" });
        const totalUsers = await User.countDocuments({ role: { $ne: "super_admin" } });
        const totalVideos = await Video.countDocuments();

        res.json({
            totalOrganizations,
            pendingAdmins,
            totalUsers,
            totalVideos
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch stats",
            error: error.message
        });
    }
};

exports.getPendingAdmins = async (req, res) => {
    try {
        const admins = await User.find(
            { role: "admin" },
            { password_hash: 0 }
        ).populate("organization_id", "organization_name");

        const adminList = admins.map(admin => ({
            _id: admin._id,
            name: admin.name,
            email: admin.email,
            organization: admin.organization_id ? admin.organization_id.organization_name : "Unknown",
            status: admin.status
        }));

        res.json({ admins: adminList });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch admins",
            error: error.message
        });
    }
};

exports.approveAdmin = async (req, res) => {
    try {
        const { id } = req.params;

        const admin = await User.findById(id);
        if (!admin) {
            return res.status(404).json({ message: "Admin not found" });
        }

        admin.status = "active";
        await admin.save();

        // Also activate the organization
        if (admin.organization_id) {
            await Organization.findByIdAndUpdate(admin.organization_id, {
                status: "active"
            });
        }

        res.json({ message: "Admin approved successfully" });

    } catch (error) {
        res.status(500).json({
            message: "Failed to approve admin",
            error: error.message
        });
    }
};

exports.rejectAdmin = async (req, res) => {
    try {
        const { id } = req.params;

        const admin = await User.findById(id);
        if (!admin) {
            return res.status(404).json({ message: "Admin not found" });
        }

        // Delete the organization they created
        if (admin.organization_id) {
            await Organization.findByIdAndDelete(admin.organization_id);
        }

        // Reset user to operator
        admin.role = "operator";
        admin.status = "active";
        admin.organization_id = undefined;
        await admin.save();

        res.json({ message: "Admin rejected" });

    } catch (error) {
        res.status(500).json({
            message: "Failed to reject admin",
            error: error.message
        });
    }
};
