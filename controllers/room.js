const Room = require("../models/RoomModel");
const nodemailer = require("nodemailer");
require("dotenv").config();
const io = require("../server");

/**
 * @desc Create a new room
 * @route POST /api/rooms/create
 * @access Public
 */
const createRoom = async (req, res) => {
    console.log("INSIDE CREATE ROOM");
  const roomId  = req.body.id;
  const ownerEmail = req.user.email;

    console.log(roomId);
    console.log(ownerEmail);


  try {
    const existingRoom = await Room.findOne({ roomId });
    if (existingRoom) {
      return res
        .status(400)
        .json({ success: false, message: "Room ID already exists" });
    }

    const newRoom = new Room({ roomId, ownerEmail });
    await newRoom.save();
    console.log("Room Created");

    res
      .status(201)
      .json({ success: true, message: "Room created", room: newRoom });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

/**
 * @desc Get the owner of a room
 * @route GET /api/rooms/owner/:roomId
 * @access Public
 */
const getRoomOwner = async (req, res) => {
    console.log("INSIDE GET ROOM OWNER");
  const roomId = req.body.roomId;
  const email = req.user.email;

  console.log(roomId);
  console.log(email);

  if (!roomId || !username) {
    return res
      .status(400)
      .json({ success: false, message: "Room ID and username are required" });
  }

  const room = Room.get(roomId);

  console.log(room)
  console.log(room.ownerEmail)

  if (room && room.ownerEmail === email) {
    return res.json({ success: true, isOwner: true });
  } else {
    return res.json({ success: true, isOwner: false });
  }
};

/**
 * @desc Request access to a room
 * @route POST /api/rooms/request-access
 * @access Public
 */

const requestAccess = async (req, res) => {
  console.log("INSIDE REQUEST ACCESS");

  const roomId = req.body.roomId;
  const email = req.user.email;

  console.log(roomId);
  console.log(email);

  try {
    const room = await Room.findOne({ roomId });
    if (!room) {
      return res
        .status(404)
        .json({ success: false, message: "Room not found" });
    }

    // Check if request already exists
    const existingParticipant = room.participants.find(
      (p) => p.email === email
    );
    if (existingParticipant) {
      return res
        .status(400)
        .json({ success: false, message: "Request already sent" });
    }

    // Add participant as pending
    room.participants.push({ email, status: "pending" });
    await room.save();
    console.log("Added to DB");

    // Generate approval link
    const approvalLink = `http://localhost:3000/approve-access?roomId=${roomId}&email=${email}&approve=true`;
    const rejectionLink = `http://localhost:3000/approve-access?roomId=${roomId}&email=${email}&approve=false`;

    // Send email to room owner
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      auth: {
        user: process.env.EMAIL_USER, // Your email
        pass: process.env.EMAIL_PASS, // Your email password or app password
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: room.ownerEmail,
      subject: "Room Access Request",
      html: `
    <p>User with email <strong>${email}</strong> has requested to join room <strong>${roomId}</strong>.</p>
    <p>Click below to approve or reject the request:</p>
    <a href="${approvalLink}" 
       style="display:inline-block;padding:10px 20px;margin:5px;background-color:#28a745;color:white;text-decoration:none;border-radius:5px;">
       ✅ Approve
    </a>
    <a href="${rejectionLink}" 
       style="display:inline-block;padding:10px 20px;margin:5px;background-color:#dc3545;color:white;text-decoration:none;border-radius:5px;">
       ❌ Reject
    </a>
  `,
    };


    await transporter.sendMail(mailOptions);
    console.log("Email sent");

    res.json({ success: true, message: "Request sent to room owner" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};



/**
 * @desc Approve or deny room access
 * @route POST /api/rooms/approve-access
 * @access Private (Room owner only)
 */
const approveAccess = async (req, res) => {
  const { roomId, email, isApproved } = req.body;

  try {
    const room = await Room.findOne({ roomId });
    if (!room) {
      return res
        .status(404)
        .json({ success: false, message: "Room not found" });
    }

    const participant = room.participants.find((p) => p.email === email);
    if (!participant) {
      return res
        .status(404)
        .json({ success: false, message: "User not found in requests" });
    }

    participant.status = isApproved ? "approved" : "denied";
    await room.save();

    res.json({
      success: true,
      message: `User ${isApproved ? "approved" : "denied"} access`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const checkAccess =  async (req, res) => {
  const { roomId } = req.query;
  const email = req.user.email; // Assuming user is authenticated

  try {
    const room = await Room.findOne({ roomId });
    if (!room) return res.status(404).json({ status: "not found" });

    const participant = room.participants.find((p) => p.email === email);
    if (!participant) return res.status(404).json({ status: "not found" });

    res.json({ status: participant.status });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error" });
  }
};


module.exports = {
  createRoom,
  getRoomOwner,
  requestAccess,
  approveAccess,
  checkAccess,
};
