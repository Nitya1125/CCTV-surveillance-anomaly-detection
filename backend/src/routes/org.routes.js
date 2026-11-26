const express = require("express");
const router = express.Router();

const orgController = require("../controllers/org.controller");
const { authenticateUser, requireAdmin, requireSuperAdmin } = require("../middleware/auth.middleware");

router.post("/create", authenticateUser, orgController.createOrganization);
router.post("/join", authenticateUser, orgController.joinOrganization);
router.get("/profile", authenticateUser, orgController.getOrgProfile);
router.put("/settings", authenticateUser, requireAdmin, orgController.updateOrgSettings);
router.post("/regenerate-code", authenticateUser, requireAdmin, orgController.regenerateJoinCode);
router.get("/all", authenticateUser, requireSuperAdmin, orgController.getAllOrganizations);

module.exports = router;
