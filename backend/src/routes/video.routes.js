const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const videoController = require("../controllers/video.controller");
const { authenticateUser, requireOrg } = require("../middleware/auth.middleware");

// Configure multer for video uploads
const uploadDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`;
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 500 * 1024 * 1024 }, // 500MB limit
    fileFilter: (req, file, cb) => {
        const allowed = [".mp4", ".avi", ".mov", ".mkv", ".wmv"];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowed.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error("Only standard video files (.mp4, .avi, .mov, .mkv) are allowed"));
        }
    }
});

router.post("/upload", authenticateUser, requireOrg, upload.single("video"), videoController.uploadVideo);
router.get("/dashboard-stats", authenticateUser, requireOrg, videoController.getDashboardStats);
router.get("/", authenticateUser, requireOrg, videoController.getVideos);
router.get("/:id", authenticateUser, requireOrg, videoController.getVideoById);
router.delete("/:id", authenticateUser, requireOrg, videoController.deleteVideo);

module.exports = router;
