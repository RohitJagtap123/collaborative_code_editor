import { Request, Response } from "express";
import bcrypt from "bcrypt";
import validator from "validator";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel";
import dotenv from "dotenv";

dotenv.config();

const createToken = (id: string, email: string): string => {
  return jwt.sign({ userId: id, email }, process.env.JWT_SECRET as string, {
    expiresIn: "7d",
  });
};

export const registerUser = async (req: Request, res: Response) => {
  console.log(req.body);

  const { name, email, password } = req.body;
  try {
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ success: false, message: "Please enter a valid email" });
    }

    if (!validator.isStrongPassword(password, { minLength: 8, minNumbers: 1, minUppercase: 1, minSymbols: 1 })) {
      return res.status(400).json({ success: false, message: "Password must have 8+ chars, 1 uppercase, 1 number, and 1 symbol" });
    }

    const exists = await userModel.findOne({ email });
    if (exists) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new userModel({
      name,
      email,
      password: hashedPassword,
    });

    const user = await newUser.save();
    const token = createToken(user._id.toString(), user.email);

    res.status(201).json({
      success: true,
      token,
      message: "User registered successfully",
      user: { id: user._id, name: user.name, email: user.email },
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  console.log("Inside Login User", req.body);
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const token = createToken(user._id.toString(), user.email);
    console.log("Generated Token:", token);

    res.cookie("token", token, {
      httpOnly: true,
      // secure: process.env.NODE_ENV === "production",
      // sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      success: true,
      token,
      message: "User logged in successfully",
      user: { id: user._id, name: user.name, email: user.email },
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
