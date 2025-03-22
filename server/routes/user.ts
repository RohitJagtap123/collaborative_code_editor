import express from "express";
import authMiddleware from "../middleware/auth";
import { registerUser, loginUser } from "../controllers/userController";
import { createRoom, requestAccess, approveAccess, checkAccess, checkUserRole } from "../controllers/room";

const router = express.Router();

// Define routes with TypeScript
router.post("/signup", registerUser);
router.post("/login", loginUser);
router.post("/createRoom", authMiddleware, createRoom);
router.post("/requestAccess", authMiddleware, requestAccess);
router.post("/approveAccess", approveAccess);
router.get("/check-access", authMiddleware, checkAccess);
router.get("/checkUserRole", authMiddleware, checkUserRole);

export default router;
