import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const adminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["Super Admin", "Admin", "Staff"],
      default: "Staff",
    },
    emergencyAccess: {
      type: Boolean,
      default: false,
    },
    emergencyAccessGrantedAt: {
      type: Date,
    },
    emergencyAccessExpiresAt: {
      type: Date, // auto-expire after X hours
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
    lastLogin: {
      type: Date,
    },

    // ── Notification preferences ─────────────────────────────
    notifications: {
      emailNotifications: { type: Boolean, default: true },
      appointmentReminders: { type: Boolean, default: true },
      weeklyReports: { type: Boolean, default: false },
    },

    // ── System configuration ─────────────────────────────────
    systemConfig: {
      autoApproveConfessions: { type: Boolean, default: false },
      requireEmailVerification: { type: Boolean, default: true },
      maxDailyAppointments: { type: Number, default: 20 },
    },
  },
  { timestamps: true },
);

// Hash password before saving
adminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password method
adminSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model("Admin", adminSchema);
