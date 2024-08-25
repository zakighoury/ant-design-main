const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    name: { type: String, required: true, maxlength: 50 },
    email: { type: String, required: true, unique: true, maxlength: 50 },
    password: { type: String, required: true },
    role: {
      type: String,
      required: [true, "Role is required"],
      enum: ["admin", "provider", "customer"],
    },
    isLoggedIn: { type: Boolean, default: false },
    avatar: {
      type: String,
      default:
        "https://w7.pngwing.com/pngs/178/595/png-transparent-user-profile-computer-icons-login-user-avatars-thumbnail.png",
    },
    resetToken: { type: String, default: "" },
    resetTokenExpiration: { type: Date, default: null },
    status: {
      type: String,
      default: "active",
      enum: ["active", "disabled", "blocked"],
    },
    wishlists: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    provider: {
      type: String,
      default: "local",
      enum: ["local", "google"],
    },
  },
  { timestamps: true }
);
const User = mongoose.model("User", userSchema);
module.exports = User;
