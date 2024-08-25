require("dotenv").config();
const JWT = require("jsonwebtoken");
const User = require("../models/User");

// Middleware to check for user authentication
const requireSignin = async (req, res, next) => {
  try {
    let token;

    const authHeader = req.headers.authorization;

    if (authHeader && authHeader?.split(" ")[1]) {
      token = authHeader?.split(" ")[1];
    } else {
      token = req.cookies.auth || req.headers["x-access-token"];
    }

    if (!token) {
      return res.status(401).send("Access denied. No token provided.");
    }

    const decode = JWT.verify(token, process.env.JWT_SECRET_KEY);
    const user = await User.findById(decode?.userId);

    if (!user || user.status !== "active") {
      return res.status(401).json({
        message: "Profile not found. Please login again.",
        success: false,
      });
    }

    if (!user || user.role !== "customer") {
      return res.status(401).json({
        message: "You are not authorized to access this resource.",
        success: false,
      });
    }

    req.user = { ...user._doc, userId: user._id };

    next();
  } catch (error) {
    console.error("Error in requireSignin middleware:", error);
    return res.status(401).json({
      message: "Please login to continue",
    });
  }
};
const isAdmin = async (req, res, next) => {
  try {
    let token;

    const authHeader = req.headers.authorization;

    if (authHeader && authHeader?.split(" ")[1]) {
      token = authHeader?.split(" ")[1];
    } else {
      token = req.cookies.auth || req.headers["x-access-token"];
    }

    if (!token) {
      return res.status(401).send("Access denied. No token provided.");
    }

    const decode = JWT.verify(token, process.env.JWT_SECRET_KEY);
    const user = await User.findById(decode?.userId);

    if (!user || user.status !== "active") {
      return res.status(401).json({
        message: "Profile not found. Please login again.",
        success: false,
      });
    }

    if (!user || user.role !== "admin") {
      return res.status(401).json({
        message: "You are not authorized to access this resource.",
        success: false,
      });
    }

    req.user = { ...user._doc, userId: user._id };

    next();
  } catch (error) {
    console.error("Error in requireSignin middleware:", error);
    return res.status(401).json({
      message: "Please login to continue",
    });
  }
};
const isProvider = async (req, res, next) => {
  try {
    let token;

    const authHeader = req.headers.authorization;

    if (authHeader && authHeader?.split(" ")[1]) {
      token = authHeader?.split(" ")[1];
    } else {
      token = req.cookies.auth || req.headers["x-access-token"];
    }

    if (!token) {
      return res.status(401).send("Access denied. No token provided.");
    }

    const decode = JWT.verify(token, process.env.JWT_SECRET_KEY);
    const user = await User.findById(decode?.userId);

    if (!user || user.status !== "active") {
      return res.status(401).json({
        message: "Profile not found. Please login again.",
        success: false,
      });
    }
    console.log(user.role);
    if (!user || user.role !== "provider") {
      return res.status(401).json({
        message: "You are not authorized to access this resource.",
        success: false,
      });
    }
    // if (!user || user.status !== "admin") {
    //   return res.status(401).json({
    //     message: "You are not authorized to access this resource.",
    //     success: false,
    //   });
    // }

    req.user = { ...user._doc, userId: user._id };
    next();
  } catch (error) {
    console.error("Error in requireSignin middleware:", error);
    return res.status(401).json({
      message: "Please login to continue",
    });
  }
};

const SignToken = (userId) => {
  return JWT.sign(
    {
      userId,
    },
    process.env.JWT_SECRET_KEY,
    {
      expiresIn: "7d",
    }
  );
};
const isProviderCustomer = async (req, res, next) => {
  try {
    let token;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.split(" ")[1]) {
      token = authHeader.split(" ")[1];
    } else {
      token = req.cookies.auth || req.headers["x-access-token"];
    }

    if (!token) {
      return res.status(401).send("Access denied. No token provided.");
    }

    const decode = JWT.verify(token, process.env.JWT_SECRET_KEY);
    const user = await User.findById(decode?.userId);

    if (!user || user.status !== "active") {
      return res.status(401).json({
        message: "Profile not found. Please login again.",
        success: false,
      });
    }

    if (user.role === "provider" || user.role === "customer") {
      req.user = { ...user._doc, userId: user._id };
      next();
    } else {
      res.status(403).json({
        message: "Access denied. Only providers and customers are allowed.",
      });
    }
  } catch (error) {
    console.error("Error in isProviderCustomer middleware:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

module.exports = {
  requireSignin,
  isAdmin,
  SignToken,
  isProvider,
  isProviderCustomer,
};
