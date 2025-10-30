const express = require("express");
const { getMessages } = require("../controllers/messageController");

const { protectRest } = require("../middleware/authMiddleware");
const router = express.Router();

router.get("/:userId", protectRest, getMessages);

module.exports = router;
