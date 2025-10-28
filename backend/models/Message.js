const mongoose = require("mongoose");

const messageSchema = mongoose.Schema(
  {
    // Reference to the User who SENT the message
    sender: {
      type: mongoose.Schema.Types.ObjectId, // Stores the _id of a User document
      required: true,
      ref: "User",
    },

    // Reference to the User who RECEIVES the message
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    content: {
      type: String,
      required: [true, "Message content cannot be empty"],
      trim: true,
    },
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
