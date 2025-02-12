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
      subject: "🔑 Room Access Request - Action Required",
      html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border-radius: 10px; background-color: #f9f9f9; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
      
      <h2 style="color: #333; text-align: center;">🔔 Access Request for Your Room</h2>
      
      <p style="font-size: 16px; color: #555;">
        <strong>${email}</strong> has requested access to your room <strong>${roomId}</strong>.
      </p>
      
      <p style="font-size: 16px; color: #555;">
        Please approve or reject the request using the buttons below:
      </p>
      
      <div style="text-align: center; margin: 20px 0;">
        <a href="${approvalLink}" 
           style="display: inline-block; padding: 12px 20px; font-size: 16px; font-weight: bold; color: white; background-color: #28a745; text-decoration: none; border-radius: 5px; margin-right: 10px;">
           ✅ Approve
        </a>
        
        <a href="${rejectionLink}" 
           style="display: inline-block; padding: 12px 20px; font-size: 16px; font-weight: bold; color: white; background-color: #dc3545; text-decoration: none; border-radius: 5px;">
           ❌ Reject
        </a>
      </div>
      
      <p style="font-size: 14px; color: #777; text-align: center;">
        If you did not expect this request, you can ignore this email.
      </p>
      
      <hr style="border: none; height: 1px; background-color: #ddd; margin: 20px 0;">
      
      <footer style="font-size: 12px; color: #888; text-align: center;">
        🔒 Secure Collaboration Platform | &copy; ${new Date().getFullYear()}
      </footer>
    
    </div>
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
    console.log("INSIDE CHECK ACCESS");
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
  requestAccess,
  approveAccess,
  checkAccess,
};
