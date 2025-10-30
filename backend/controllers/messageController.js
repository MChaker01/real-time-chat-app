const Message = require("../models/Message");

// 2. GET /api/messages/:userId - Get conversation with a user

// Protected: Yes (requires JWT)
// Logic:

// Find all messages where:

// (sender = current user AND receiver = userId) OR
// (sender = userId AND receiver = current user)

// Sort by createdAt (oldest first, so chat appears in chronological order)
// Populate sender and receiver with: username, userImage

const getMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: req.params.userId },
        { sender: req.params.userId, receiver: req.user._id },
      ],
    })
      .sort({ createdAt: 1 })
      .populate("sender receiver");

    res.status(200).json({ messages });
  } catch (error) {
    console.log("Error fetching old messages.", error);
    res
      .status(500)
      .json({ message: "Server Error while retreiving old messages." });
  }
};

module.exports = { getMessages };
