const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth.controller");
const { authenticateUser } = require("../middleware/auth.middleware");

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/forgot-password", authController.forgotPassword);
router.get("/check-status", authenticateUser, authController.checkStatus);

module.exports = router;