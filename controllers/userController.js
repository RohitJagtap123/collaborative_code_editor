const userModel = require("../models/userModel");
const bcrypt = require('bcrypt');
const validator = require('validator');
const jwt = require('jsonwebtoken');

const createToken = (id, email) => {
  return jwt.sign({ userId: id, email }, "Roww", {
    expiresIn: "7d",
  });
};


exports.registerUser = async (req, res) => {
    console.log(req.body);
    console.log(req.header);
    const { name, email, password } = req.body;
    try {
        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        if (!validator.isEmail(email)) {
            return res.status(400).json({ success: false, message: "Please enter a valid email" });
        }

        if (!validator.isStrongPassword(password, { minLength: 8 })) {
            return res.status(400).json({ success: false, message: "Password must be stronger (min 8 chars, 1 uppercase, 1 number)" });
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

        const token = createToken(user._id,user.email);

        res.status(201).json({
            success: true,
            token,
            message: "User registered successfully",
            user: { id: user._id, name: user.name, email: user.email }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

exports.loginUser = async (req, res) => {
    console.log("Inside Login User");
  console.log(req.body);
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    const user = await userModel.findOne({ email });
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    const token = createToken(user._id, user.email);

    console.log("Your Token is: ", token);

    // Set token in an HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true, // Prevents client-side access (protection against XSS)
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days expiration
    });

    res.json({
      success: true,
      token, // Send token in response for API clients
      message: "User logged in successfully",
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
