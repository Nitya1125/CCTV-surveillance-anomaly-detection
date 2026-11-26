const express = require("express");
const router = express.Router();

const userController = require("../controllers/user.controller");
const { authenticateUser, requireOrg, requireAdmin } = require("../middleware/auth.middleware");

router.get("/org-users", authenticateUser, requireOrg, userController.getUsersByOrg);
router.put("/role/:id", authenticateUser, requireOrg, requireAdmin, userController.updateUserRole);
router.delete("/:id", authenticateUser, requireOrg, requireAdmin, userController.removeUser);

router.get("/profile", authenticateUser, userController.getUserProfile);
router.put("/profile", authenticateUser, userController.updateProfile);
router.post("/change-password", authenticateUser, userController.changePassword);

module.exports = router;
