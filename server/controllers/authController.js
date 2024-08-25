const User = require("../models/User");
const bcrypt = require("bcryptjs");
const cryptoObj = require("node:crypto");
const { SignToken } = require("../middlewares/authmiddleware");

module.exports = authController = {
  signUp: async (req, res) => {
    const { name, email, password, role } = req.body;

    if (!email || !name || !password || !role) {
      return res
        .status(400)
        .json({ message: "All fields are required", success: false });
    }

    try {
      const existingUser = await User.findOne({ email });

      if (existingUser) {
        return res
          .status(400)
          .json({ message: "Email already exists", success: false });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const newUser = new User({
        name,
        email,
        role,
        password: hashedPassword,
      });

      const savedUser = await newUser.save();
      console.log(newUser, "User");
      res.status(201).json({
        message: "Account created successfully",
        success: true,
        user: savedUser,
      });
    } catch (error) {
      res.status(400).json({ message: error.message, success: false });
    }
  },

  signIn: async (req, res) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid credentials", success: false });
    }

    if (user.status === "disabled") {
      res
        .status(403)
        .json({ message: "Your account is not active", success: false });
    }
    if (user.status === "blocked") {
      res.status(403).json({
        message: "Your Account Is Blocked try another Account",
        success: false,
      });
    }

    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "Invalid credentials", success: false });
    }
    const token = SignToken(user._id);
    user.isLoggedIn = true;
    await user.save();
    try {
      res.cookie("auth", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      });
      res.json({
        message: "Sign in successful!",
        success: true,
        user: {
          avatar: user.avatar,
          name: user.name,
          role: user.role,
          email: user.email,
          phone: user.phone,
          provider: user.provider,
          newsletter: user.newsletter,
          isLoggedIn: user.isLoggedIn,
          _id: user._id,
        },
        token,
      });
    } catch (error) {
      res.status(400).json({ message: error.message, success: false });
    }
  },

  signOut: async (req, res) => {
    try {
      const userId = req.body.userId;
      console.log(userId);
      // Clear the JWT Auth cookie
      res.clearCookie("auth");
      res.clearCookie("role");
      res.clearCookie("userId");
      res.clearCookie("isLoggedIn");
      res.clearCookie("token");

      await User.findOneAndUpdate({ _id: userId }, { isLoggedIn: false });
      res.status(200).json({
        message: "Logged out successfully",
        success: true,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to logout", success: false });
    }
  },

  sendVerificationLink: async (req, res) => {
    try {
      const { email } = req.body;
      const user = await User.findOne({ email });

      if (!user) {
        return res
          .status(404)
          .json({ success: false, error: "User not found" });
      }

      if (user.provider !== "local") {
        return res.status(404).json({
          success: false,
          error: `Instead of resetting password, please sign in with ${user.provider}!`,
        });
      }

      if (req.user && req.user._id !== user._id) {
        return res.status(404).json({ success: false, error: "Wrong Email!" });
      }

      const resetToken = cryptoObj.randomBytes(32).toString("hex");
      const expirationTime = new Date(Date.now() + 10 * 60 * 1000);
      await User.findOneAndUpdate(
        { email },
        { resetToken, resetTokenExpiration: expirationTime }
      );
      const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

      // Example response without sending email
      res
        .status(200)
        .json({ success: true, message: "Reset link generated successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  },

  resetPassword: async (req, res) => {
    try {
      const { resetToken } = req.params;
      const { password } = req.body;
      const user = await User.findOne({ resetToken });
      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found, Try again" });
      }

      if (user.resetTokenExpiration < new Date()) {
        return res
          .status(404)
          .json({ success: false, message: "Link expired, Try again" });
      }
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      await User.findOneAndUpdate(
        { resetToken },
        { password: hashedPassword, resetToken: null }
      );
      res
        .status(200)
        .json({ success: true, message: "Password changed successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  },

  verified: (req, res) => {
    try {
      const user = req.user;
      res
        .status(200)
        .json({ message: "Sign in successful!", success: true, user });
    } catch (error) {
      res.status(400).json({ message: error.message, success: false });
    }
  },

  callbackSignin: async (req, res) => {
    const user = req.user;

    if (!user) {
      return res.json({
        success: false,
        message: "User not found, Please login again!",
      });
    }

    const token = SignToken(user._id);

    res.cookie("auth", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    });

    // Redirect to the client success URL
    res.redirect(`${process.env.CLIENT_AUTH_SUCCESS_URL}?token=${token}`);
  },
};
