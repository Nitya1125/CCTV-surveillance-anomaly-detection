const express = require("express");
const router = express.Router();

const superadminController = require("../controllers/superadmin.controller");
const { authenticateUser, requireSuperAdmin } = require("../middleware/auth.middleware");

router.get("/stats", authenticateUser, requireSuperAdmin, superadminController.getStats);
router.get("/pending-admins", authenticateUser, requireSuperAdmin, superadminController.getPendingAdmins);
router.post("/approve/:id", authenticateUser, requireSuperAdmin, superadminController.approveAdmin);
router.delete("/reject/:id", authenticateUser, requireSuperAdmin, superadminController.rejectAdmin);

module.exports = router;
