const express = require("express");
const router = express.Router();

const eventController = require("../controllers/event.controller");
const { authenticateUser, requireOrg } = require("../middleware/auth.middleware");

router.get("/", authenticateUser, requireOrg, eventController.getEvents);
router.get("/stats", authenticateUser, requireOrg, eventController.getEventStats);
router.put("/:id", authenticateUser, requireOrg, eventController.updateEventStatus);
router.delete("/:id", authenticateUser, requireOrg, eventController.deleteEvent);

module.exports = router;
