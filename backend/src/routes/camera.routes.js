const express = require("express");
const router = express.Router();

const cameraController = require("../controllers/camera.controller");
const { authenticateUser, requireOrg, requireAdmin } = require("../middleware/auth.middleware");

router.get("/", authenticateUser, requireOrg, cameraController.getCameras);
router.get("/:id", authenticateUser, requireOrg, cameraController.getCameraById);
router.post("/", authenticateUser, requireOrg, requireAdmin, cameraController.createCamera);
router.put("/:id", authenticateUser, requireOrg, requireAdmin, cameraController.updateCamera);
router.delete("/:id", authenticateUser, requireOrg, requireAdmin, cameraController.deleteCamera);

module.exports = router;
