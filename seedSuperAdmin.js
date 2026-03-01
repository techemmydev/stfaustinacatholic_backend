import mongoose from "mongoose";
import dotenv from "dotenv";
import Admin from "./models/AdminSchema.js";

dotenv.config();

const seedSuperAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Connected to MongoDB");

    // Check if Super Admin already exists
    const existingAdmin = await Admin.findOne({ role: "Super Admin" });
    if (existingAdmin) {
      console.log("Super Admin already exists");
      process.exit();
    }

    // Create Super Admin
    const superAdmin = new Admin({
      name: "Super Admin",
      email: "admin@church.com",
      password: "Admin@123", // Change this in production
      role: "Super Admin",
      status: "Active",
    });

    await superAdmin.save();
    console.log("✅ Super Admin created successfully");
    console.log("Email: admin@church.com");
    console.log("Password: Admin@123");
    console.log("⚠️ Please change the password after first login");

    process.exit();
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

seedSuperAdmin();
