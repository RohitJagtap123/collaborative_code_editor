const mongoose = require("mongoose");

const RoomSchema = new mongoose.Schema({
  roomId: { type: String, required: true, unique: true },
  ownerEmail: { type: String, required: true },
  participants: [
    {
      email: String,
      status: {
        type: String,
        enum: ["pending", "approved", "denied"],
        default: "pending",
      },
    },
  ],
});

module.exports = mongoose.model("Room", RoomSchema);
