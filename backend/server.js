// ================= PLATFORM-SPECIFIC DNS WORKAROUND =================
// Only apply Google DNS servers on Windows to resolve Node.js v24 SRV lookup issues.
// Do NOT run on Render/Linux.
if (process.platform === "win32") {
    const dns = require("node:dns");
    dns.setServers(["8.8.8.8", "8.8.4.4"]);
}

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;

// Validate that MONGODB_URI is provided before proceeding
if (!MONGODB_URI) {
    console.error("❌ FATAL: MONGODB_URI environment variable is not defined. Please set it in your environment or .env file.");
    process.exit(1);
}

// ================= CORS CONFIGURATION =================
// Support local development origins and configured production frontend URL
const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    "http://127.0.0.1:5175"
];

// If a production FRONTEND_URL is set (e.g. on Netlify), register it
if (process.env.FRONTEND_URL) {
    // Strip any trailing slash for consistent matching
    const normalizedFrontend = process.env.FRONTEND_URL.replace(/\/+$/, "");
    if (!allowedOrigins.includes(normalizedFrontend)) {
        allowedOrigins.push(normalizedFrontend);
    }
}

const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (such as mobile apps, curl, server-to-server, Postman)
        if (!origin) {
            return callback(null, true);
        }

        const normalizedOrigin = origin.replace(/\/+$/, "");
        if (allowedOrigins.includes(normalizedOrigin)) {
            return callback(null, true);
        }

        // In development mode only, permit fallback while logging warning
        if (process.env.NODE_ENV !== "production") {
            return callback(null, true);
        }

        // In production, strictly reject unauthorized browser origins
        return callback(new Error(`CORS blocked: Origin ${origin} is not allowed.`));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    credentials: true,
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// ================= BODY PARSERS =================
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// ================= STATIC FILES =================
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ================= MONGODB CONNECTION =================
mongoose
    .connect(MONGODB_URI)
    .then(() => {
        // Never log credentials or full URI; mask host safely
        try {
            const urlObj = new URL(MONGODB_URI);
            console.log(`📦 MongoDB connected successfully to [${urlObj.protocol}//${urlObj.host}${urlObj.pathname}]`);
        } catch {
            console.log("📦 MongoDB connected successfully");
        }
    })
    .catch((err) => {
        console.error("❌ MongoDB connection error:", err.message);
    });

// ================= API ROUTES =================
const authRoutes = require("./src/routes/auth.routes");
const orgRoutes = require("./src/routes/org.routes");
const videoRoutes = require("./src/routes/video.routes");
const userRoutes = require("./src/routes/user.routes");
const cameraRoutes = require("./src/routes/camera.routes");
const eventRoutes = require("./src/routes/event.routes");
const superadminRoutes = require("./src/routes/superadmin.routes");

app.use("/api/auth", authRoutes);
app.use("/api/org", orgRoutes);
app.use("/api/video", videoRoutes);
app.use("/api/user", userRoutes);
app.use("/api/camera", cameraRoutes);
app.use("/api/event", eventRoutes);
app.use("/api/superadmin", superadminRoutes);

// ================= HEALTH CHECK =================
app.get("/", (req, res) => {
    res.json({
        status: "online",
        platform: "AI-Based Surveillance & Anomaly Detection API",
        version: "2.0.0",
        timestamp: new Date().toISOString()
    });
});

app.get("/api/health", (req, res) => {
    const isDbConnected = mongoose.connection.readyState === 1;
    res.status(isDbConnected ? 200 : 503).json({
        status: isDbConnected ? "healthy" : "unhealthy",
        database: isDbConnected ? "connected" : "disconnected",
        uptime: process.uptime()
    });
});

// ================= GLOBAL ERROR HANDLER =================
app.use((err, req, res, next) => {
    if (err.message && err.message.startsWith("CORS blocked")) {
        return res.status(403).json({
            message: err.message
        });
    }

    console.error("Server exception:", err);
    res.status(err.status || 500).json({
        message: err.message || "Internal server error occurred",
        error: process.env.NODE_ENV === "production" ? {} : err.stack
    });
});

// ================= START SERVER =================
// Bind to 0.0.0.0 to properly accept external traffic on Render
app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Surveillance Backend Service operational on port ${PORT} (0.0.0.0)`);
});
