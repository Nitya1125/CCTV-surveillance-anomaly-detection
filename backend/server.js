const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/CVMU_final";

// ================= CORS CONFIGURATION =================
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (e.g. curl, server-to-server, postman)
        if (!origin) return callback(null, true);
        const allowedOrigins = [
            "http://localhost:5173",
            "http://localhost:5174",
            "http://localhost:5175",
            "http://127.0.0.1:5173",
            "http://127.0.0.1:5174",
            "http://127.0.0.1:5175",
        ];
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(null, true); // Dev-friendly fallback
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    credentials: true,
    optionsSuccessStatus: 200,
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
        console.log("📦 MongoDB connected successfully to", MONGODB_URI);
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
    res.json({
        status: "healthy",
        database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
        uptime: process.uptime()
    });
});

// ================= GLOBAL ERROR HANDLER =================
app.use((err, req, res, next) => {
    console.error("Server exception:", err);
    res.status(err.status || 500).json({
        message: err.message || "Internal server error occurred",
        error: process.env.NODE_ENV === "production" ? {} : err.stack
    });
});

// ================= START SERVER =================
app.listen(PORT, () => {
    console.log(`🚀 Surveillance Backend Service operational on port ${PORT}`);
});
