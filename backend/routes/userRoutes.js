const express = require("express");
const { getUsers } = require("../controllers/userController");

const { protectRest } = require("../middleware/authMiddleware");
const router = express.Router();

router.get("/", protectRest, getUsers);

module.exports = router;
