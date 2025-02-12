const express = require('express')
const router = express.Router();
const authMiddleware = require("../middleware/auth");

const { registerUser, loginUser } = require("../controllers/userController");
const { createRoom,requestAccess,approveAccess, checkAccess } = require("../controllers/room")

router.post("/signup", registerUser);
router.post("/login", loginUser);
router.post("/createRoom", authMiddleware,createRoom);
router.post("/requestAccess", authMiddleware, requestAccess);
router.post("/approveAccess", authMiddleware,approveAccess);
router.get("/check-access", authMiddleware, checkAccess);

module.exports = router;

