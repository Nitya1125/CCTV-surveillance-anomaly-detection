const jwt = require("jsonwebtoken");

exports.authenticateUser = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "Authentication required. No valid token provided."
            });
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_surveillance_secret_key");

        req.user = decoded;
        next();

    } catch (error) {
        return res.status(401).json({
            message: "Session expired or invalid token. Please log in again."
        });
    }
};

exports.requireOrg = (req, res, next) => {
    if (!req.user || !req.user.organization_id) {
        return res.status(403).json({
            message: "Organization membership required to access this resource."
        });
    }
    next();
};

exports.requireAdmin = (req, res, next) => {
    const allowed = ["owner", "admin", "super_admin"];
    if (!req.user || !allowed.includes(req.user.role)) {
        return res.status(403).json({
            message: "Administrative privileges required."
        });
    }
    next();
};

exports.requireOwner = (req, res, next) => {
    const allowed = ["owner", "super_admin"];
    if (!req.user || !allowed.includes(req.user.role)) {
        return res.status(403).json({
            message: "Organization owner privileges required."
        });
    }
    next();
};

exports.requireSuperAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== "super_admin") {
        return res.status(403).json({
            message: "Super Admin privileges required."
        });
    }
    next();
};

exports.requireRole = (roles = []) => {
    return (req, res, next) => {
        if (!req.user || (!roles.includes(req.user.role) && req.user.role !== "super_admin")) {
            return res.status(403).json({
                message: "Access forbidden: insufficient permissions."
            });
        }
        next();
    };
};
