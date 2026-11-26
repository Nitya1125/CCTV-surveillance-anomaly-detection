const User = require("../models/users");
const Organization = require("../models/organizations");
const bcrypt = require("bcryptjs");
const generateToken = require("../utils/generateToken");

// ================= SIGNUP =================
exports.signup = async (req, res) => {
    try {
        const { name, email, username, password } = req.body;

        if (!name || !email || !username || !password) {
            return res.status(400).json({
                message: "Name, email, username, and password are required."
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters long."
            });
        }

        const cleanEmail = email.toLowerCase().trim();
        const cleanUsername = username.toLowerCase().trim();

        const existingUser = await User.findOne({
            $or: [{ email: cleanEmail }, { username: cleanUsername }]
        });

        if (existingUser) {
            return res.status(400).json({
                message: "An account with this email or username already exists."
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name: name.trim(),
            email: cleanEmail,
            username: cleanUsername,
            password_hash: hashedPassword,
            role: "operator", // default role until an organization is created (which promotes to owner) or joined
            status: "active"
        });

        const token = generateToken(user);

        res.status(201).json({
            message: "Account registered successfully",
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                username: user.username,
                role: user.role,
                organization_id: user.organization_id,
                status: user.status
            }
        });

    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({
            message: "Registration failed. Please try again.",
            error: error.message
        });
    }
};

// ================= LOGIN =================
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                message: "Username and password are required."
            });
        }

        const cleanIdentifier = username.toLowerCase().trim();

        // Allow login by either username or email
        const user = await User.findOne({
            $or: [{ username: cleanIdentifier }, { email: cleanIdentifier }]
        });

        if (!user) {
            return res.status(401).json({
                message: "Invalid credentials. Please verify your details."
            });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid credentials. Please verify your details."
            });
        }

        let orgData = null;
        if (user.organization_id) {
            orgData = await Organization.findById(user.organization_id);
        }

        const token = generateToken(user);

        res.json({
            message: "Login successful",
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                username: user.username,
                role: user.role,
                organization_id: user.organization_id,
                organization_name: orgData ? orgData.organization_name : null,
                status: user.status
            }
        });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({
            message: "Authentication failed",
            error: error.message
        });
    }
};

// ================= FORGOT PASSWORD =================
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const user = await User.findOne({ email: email.toLowerCase().trim() });

        if (!user) {
            return res.status(404).json({
                message: "No account found registered with this email address."
            });
        }

        // In a production setup this would dispatch an email token.
        // For self-contained testing, we return a simulated success receipt.
        res.json({
            message: "Password reset instructions have been dispatched to your email address.",
            resetSent: true
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to process password reset request",
            error: error.message
        });
    }
};

// ================= CHECK / REFRESH STATUS =================
exports.checkStatus = async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await User.findById(userId).select("-password_hash");

        if (!user) {
            return res.status(404).json({
                message: "User session not found"
            });
        }

        let orgData = null;
        if (user.organization_id) {
            orgData = await Organization.findById(user.organization_id);
        }

        res.json({
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                username: user.username,
                role: user.role,
                organization_id: user.organization_id,
                organization_name: orgData ? orgData.organization_name : null,
                status: user.status
            }
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to retrieve user status",
            error: error.message
        });
    }
};
