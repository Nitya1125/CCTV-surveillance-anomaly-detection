const User = require("../models/users");
const Video = require("../models/videos");
const Event = require("../models/events");
const bcrypt = require("bcryptjs");

// ================= GET USERS BY ORGANIZATION =================
exports.getUsersByOrg = async (req, res) => {
    try {
        const userId = req.user.id;
        const currentUser = await User.findById(userId);

        if (!currentUser || !currentUser.organization_id) {
            return res.json({ users: [] });
        }

        const users = await User.find(
            { organization_id: currentUser.organization_id },
            { password_hash: 0 }
        ).sort({ createdAt: -1 });

        res.json({ users });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch organization users",
            error: error.message
        });
    }
};

// ================= UPDATE USER ROLE =================
exports.updateUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;
        const currentUserId = req.user.id;
        const orgId = req.user.organization_id;

        if (!["admin", "operator", "viewer"].includes(role)) {
            return res.status(400).json({ message: "Invalid role specified" });
        }

        if (id === currentUserId) {
            return res.status(400).json({ message: "Cannot change your own role" });
        }

        const targetUser = await User.findOne({ _id: id, organization_id: orgId });
        if (!targetUser) {
            return res.status(404).json({ message: "User not found in your organization" });
        }

        if (targetUser.role === "owner") {
            return res.status(403).json({ message: "Cannot modify organization owner" });
        }

        targetUser.role = role;
        await targetUser.save();

        res.json({
            message: `User role updated to ${role}`,
            user: {
                _id: targetUser._id,
                name: targetUser.name,
                role: targetUser.role
            }
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to update member role",
            error: error.message
        });
    }
};

// ================= REMOVE USER FROM ORG =================
exports.removeUser = async (req, res) => {
    try {
        const { id } = req.params;
        const currentUserId = req.user.id;
        const orgId = req.user.organization_id;

        if (id === currentUserId) {
            return res.status(400).json({ message: "Cannot remove yourself from organization" });
        }

        const targetUser = await User.findOne({ _id: id, organization_id: orgId });
        if (!targetUser) {
            return res.status(404).json({ message: "User not found in this organization" });
        }

        if (targetUser.role === "owner") {
            return res.status(403).json({ message: "Cannot remove the organization owner" });
        }

        await User.findByIdAndUpdate(id, {
            $unset: { organization_id: "" },
            role: "operator"
        });

        res.json({ message: `${targetUser.name} removed from organization` });

    } catch (error) {
        res.status(500).json({
            message: "Failed to remove user",
            error: error.message
        });
    }
};

// ================= GET USER PROFILE =================
exports.getUserProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId, { password_hash: 0 })
            .populate("organization_id", "organization_name org_type join_code");

        if (!user) {
            return res.status(404).json({ message: "User profile not found" });
        }

        const totalVideos = await Video.countDocuments({ uploaded_by: userId });
        const assignedIncidents = await Event.countDocuments({ assigned_to: userId });

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            username: user.username,
            phone: user.phone || "",
            role: user.role,
            status: user.status,
            organization: user.organization_id ? user.organization_id.organization_name : "None",
            organization_id: user.organization_id ? user.organization_id._id : null,
            join_code: user.organization_id ? user.organization_id.join_code : null,
            stats: {
                videosUploaded: totalVideos,
                assignedIncidents
            }
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch user profile",
            error: error.message
        });
    }
};

// ================= UPDATE PROFILE DETAILS =================
exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, phone } = req.body;

        const updateData = {};
        if (name) updateData.name = name.trim();
        if (phone !== undefined) updateData.phone = phone.trim();

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: updateData },
            { new: true, select: "-password_hash" }
        );

        res.json({
            message: "Profile updated successfully",
            user: updatedUser
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to update profile",
            error: error.message
        });
    }
};

// ================= CHANGE PASSWORD =================
exports.changePassword = async (req, res) => {
    try {
        const userId = req.user.id;
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: "Current and new password are required" });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: "New password must be at least 6 characters" });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password_hash);

        if (!isMatch) {
            return res.status(400).json({ message: "Incorrect current password" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password_hash = hashedPassword;
        await user.save();

        res.json({ message: "Password updated successfully" });

    } catch (error) {
        res.status(500).json({
            message: "Failed to change password",
            error: error.message
        });
    }
};
