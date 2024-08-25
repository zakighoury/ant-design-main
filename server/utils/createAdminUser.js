const Admin = require("../models/Admin");
const bcrypt = require("bcryptjs"); // Import bcrypt for password hashing

const createAdminUser = async () => {
  try {
    // Check if there is already an admin user
    const existingAdmin = await Admin.findOne({ role: "admin" });

    if (existingAdmin) {
      console.log("Admin user already exists.");
      return;
    }

    // Create a new admin user if none exists
    const adminUserData = {
      username: "admin",
      password: await bcrypt.hash("Admin", 6), // Hash password securely
      role: "admin",
      status: "active",
      // Add other required fields
    };

    const newAdmin = new Admin(adminUserData);
    await newAdmin.save();

    console.log("Admin user created successfully:", newAdmin);
  } catch (error) {
    console.error("Error creating admin user:", error);
  }
};

module.exports = { createAdminUser };
