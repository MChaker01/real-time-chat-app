const User = require("../models/User");

// 1. GET /api/users - Get all users

// Protected: Yes (requires JWT)
// Logic:

// Select only: _id, username, userImage, isOnline
// Don't return passwords!

const getUsers = async (req, res) => {
  try {
    // Fetch all users except the current logged-in user
    const users = await User.find({ _id: { $ne: req.user._id } }).select(
      "-password"
    ); // $ne = "not equal"

    res.status(200).json({ users });
  } catch (error) {
    console.error("Error fetching users : ", error);
    res.status(500).json({ message: "Server Error while retreiving users." });
  }
};

module.exports = { getUsers };
