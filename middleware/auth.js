const jwt = require("jsonwebtoken");

const authMiddleware = async (req, res, next) => {
    console.log("INSIDE AUTH MIDDLEWARE");
  let token = req.cookies.token;

  console.log("Token is", token);

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Not Authorized, login again" });
  }

  try {
    const decoded = jwt.verify(token, "Roww");
    req.user = { id: decoded.userId, email: decoded.email }; // Attach user details to request

    console.log("Email: ",req.user.email)

    next();
  } catch (error) {
    console.log("JWT Verification Error:", error);
    res
      .status(401)
      .json({ success: false, message: "Invalid or expired token" });
  }
};

module.exports = authMiddleware;
