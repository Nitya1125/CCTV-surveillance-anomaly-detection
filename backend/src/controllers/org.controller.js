const Organization = require("../models/organizations");
const User = require("../models/users");
const Camera = require("../models/cameras");
const Video = require("../models/videos");
const Event = require("../models/events");
const generateToken = require("../utils/generateToken");

// Seed initial cameras for an organization
async function seedDefaultCameras(orgId, userId) {
    const defaultCameras = [
        {
            organization_id: orgId,
            name: "Camera 01 - Main Entrance",
            location: "Building A - Lobby",
            camera_type: "entrance",
            status: "active",
            resolution: "1080p",
            fps: 30,
            zone_name: "Zone Alpha (Access Portal)",
            created_by: userId,
            assigned_activities: ["Restricted Area", "Sudden Run", "Loitering"]
        },
        {
            organization_id: orgId,
            name: "Camera 02 - South Perimeter",
            location: "Exterior Perimeter Fence",
            camera_type: "perimeter",
            status: "active",
            resolution: "1080p",
            fps: 25,
            zone_name: "Zone Bravo (Fence Line)",
            created_by: userId,
            assigned_activities: ["Restricted Area", "Loitering"]
        },
        {
            organization_id: orgId,
            name: "Camera 03 - Server Vault Lobby",
            location: "Sublevel 1 - Data Center",
            camera_type: "indoor",
            status: "active",
            resolution: "1080p",
            fps: 30,
            zone_name: "Zone Charlie (High Security)",
            created_by: userId,
            assigned_activities: ["Restricted Area", "Sudden Run", "Loitering"]
        },
        {
            organization_id: orgId,
            name: "Camera 04 - East Loading Dock",
            location: "Logistics Bay 2",
            camera_type: "outdoor",
            status: "active",
            resolution: "1080p",
            fps: 30,
            zone_name: "Zone Delta (Dispatch)",
            created_by: userId,
            assigned_activities: ["Restricted Area", "Sudden Run"]
        }
    ];

    try {
        await Camera.insertMany(defaultCameras);
    } catch (e) {
        console.error("Default camera seeding note:", e.message);
    }
}

// ================= CREATE ORGANIZATION =================
exports.createOrganization = async (req, res) => {
    try {
        const { orgName, orgType, adminPhone } = req.body;
        const userId = req.user.id;

        if (!orgName || !orgName.trim()) {
            return res.status(400).json({ message: "Organization name is required." });
        }

        // Generate unique 6-digit join code
        let joinCode;
        let codeExists = true;
        while (codeExists) {
            joinCode = String(Math.floor(100000 + Math.random() * 900000));
            codeExists = await Organization.findOne({ join_code: joinCode });
        }

        // Create organization - immediately active with creator as owner
        const org = await Organization.create({
            organization_name: orgName.trim(),
            org_type: orgType || "Company",
            join_code: joinCode,
            owner_id: userId,
            admin_id: userId,
            status: "active"
        });

        // Update creator to "owner" role, active status, and link organization
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                role: "owner",
                organization_id: org._id,
                status: "active",
                phone: adminPhone || undefined
            },
            { new: true }
        );

        // Seed initial surveillance cameras for instant usability
        await seedDefaultCameras(org._id, userId);

        // Issue fresh token containing the new role and organization_id
        const freshToken = generateToken(updatedUser);

        res.status(201).json({
            message: "Organization established successfully",
            token: freshToken,
            organization: org,
            joinCode: joinCode,
            user: {
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                organization_id: updatedUser.organization_id,
                organization_name: org.organization_name
            }
        });

    } catch (error) {
        console.error("Create organization error:", error);
        res.status(500).json({
            message: "Failed to create organization",
            error: error.message
        });
    }
};

// ================= JOIN ORGANIZATION =================
exports.joinOrganization = async (req, res) => {
    try {
        const { joinCode } = req.body;
        const userId = req.user.id;

        if (!joinCode) {
            return res.status(400).json({ message: "Join code is required." });
        }

        const org = await Organization.findOne({ join_code: joinCode.trim() });

        if (!org) {
            return res.status(404).json({
                message: "Invalid organization join code. Please verify the 6-digit code."
            });
        }

        if (org.status !== "active") {
            return res.status(403).json({
                message: "This organization is currently inactive."
            });
        }

        // Update user with organization reference and operator role
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                organization_id: org._id,
                role: "operator",
                status: "active"
            },
            { new: true }
        );

        const freshToken = generateToken(updatedUser);

        res.json({
            message: `Successfully joined ${org.organization_name}`,
            token: freshToken,
            organization: org,
            user: {
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                organization_id: updatedUser.organization_id,
                organization_name: org.organization_name
            }
        });

    } catch (error) {
        console.error("Join organization error:", error);
        res.status(500).json({
            message: "Failed to join organization",
            error: error.message
        });
    }
};

// ================= GET ORGANIZATION PROFILE =================
exports.getOrgProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);

        if (!user || !user.organization_id) {
            return res.status(404).json({
                message: "User is not linked to any organization"
            });
        }

        const org = await Organization.findById(user.organization_id)
            .populate("owner_id", "name email");

        if (!org) {
            return res.status(404).json({ message: "Organization record not found" });
        }

        const totalUsers = await User.countDocuments({ organization_id: org._id });
        const totalCameras = await Camera.countDocuments({ organization_id: org._id });
        const activeCameras = await Camera.countDocuments({ organization_id: org._id, status: "active" });
        const totalVideos = await Video.countDocuments({ organization_id: org._id });
        const totalEvents = await Event.countDocuments({ organization_id: org._id });

        res.json({
            _id: org._id,
            orgName: org.organization_name,
            joinCode: org.join_code,
            orgType: org.org_type,
            status: org.status,
            owner: org.owner_id ? { name: org.owner_id.name, email: org.owner_id.email } : null,
            settings: org.settings || { retention_days: 30, auto_alerts: true, sensitivity: "standard" },
            stats: {
                totalUsers,
                totalCameras,
                activeCameras,
                totalVideos,
                totalEvents
            }
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch organization profile",
            error: error.message
        });
    }
};

// ================= UPDATE ORGANIZATION SETTINGS =================
exports.updateOrgSettings = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);

        if (!user || !user.organization_id) {
            return res.status(404).json({ message: "Organization not found" });
        }

        const { orgName, orgType, settings } = req.body;

        const updateData = {};
        if (orgName) updateData.organization_name = orgName.trim();
        if (orgType) updateData.org_type = orgType;
        if (settings) updateData.settings = settings;

        const updated = await Organization.findByIdAndUpdate(
            user.organization_id,
            updateData,
            { new: true }
        );

        res.json({
            message: "Organization settings updated successfully",
            organization: updated
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to update organization settings",
            error: error.message
        });
    }
};

// ================= REGENERATE JOIN CODE =================
exports.regenerateJoinCode = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);

        if (!user || !user.organization_id) {
            return res.status(404).json({ message: "Organization not found" });
        }

        let joinCode;
        let codeExists = true;
        while (codeExists) {
            joinCode = String(Math.floor(100000 + Math.random() * 900000));
            codeExists = await Organization.findOne({ join_code: joinCode });
        }

        const org = await Organization.findByIdAndUpdate(
            user.organization_id,
            { join_code: joinCode },
            { new: true }
        );

        res.json({
            message: "New join code generated",
            joinCode: org.join_code
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to regenerate join code",
            error: error.message
        });
    }
};

// ================= GET ALL ORGANIZATIONS (SUPERADMIN ONLY) =================
exports.getAllOrganizations = async (req, res) => {
    try {
        const organizations = await Organization.find()
            .populate("owner_id", "name email");

        const orgsWithUsers = await Promise.all(
            organizations.map(async (org) => {
                const userCount = await User.countDocuments({ organization_id: org._id });
                const cameraCount = await Camera.countDocuments({ organization_id: org._id });
                return {
                    _id: org._id,
                    name: org.organization_name,
                    owner: org.owner_id ? org.owner_id.name : "System",
                    users: userCount,
                    cameras: cameraCount,
                    status: org.status,
                    org_type: org.org_type,
                    join_code: org.join_code,
                    createdAt: org.createdAt
                };
            })
        );

        res.json({ organizations: orgsWithUsers });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch organizations",
            error: error.message
        });
    }
};
