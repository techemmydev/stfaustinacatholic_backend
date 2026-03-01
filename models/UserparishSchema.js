import mongoose from "mongoose";

const ParishionerSchema = new mongoose.Schema(
  {
    /* ================= PERSONAL INFO ================= */
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    dob: {
      type: Date,
    },

    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      required: true,
    },

    address: {
      type: String,
      trim: true,
    },

    phone: {
      type: String,
      trim: true,
    },

    email: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
      trim: true,
    },

    occupation: {
      type: String,
      trim: true,
    },

    /* ================= FAMILY INFO ================= */
    maritalStatus: {
      type: String,
      enum: ["Single", "Married", "Widowed", "Divorced"],
      default: "Single",
    },

    spouseName: {
      type: String,
      trim: true,
    },

    /* ================= SACRAMENTS ================= */
    sacraments: {
      baptized: {
        type: Boolean,
        default: false,
      },
      baptismDate: {
        type: Date,
      },
      baptismParish: {
        type: String,
        trim: true,
      },

      communion: {
        type: Boolean,
        default: false,
      },
      communionDate: {
        type: Date,
      },

      confirmed: {
        type: Boolean,
        default: false,
      },
      confirmationDate: {
        type: Date,
      },

      married: {
        type: Boolean,
        default: false,
      },
      marriageDate: {
        type: Date,
      },
    },

    /* ================= PARISH LIFE ================= */
    previousParish: {
      type: String,
      trim: true,
    },

    ministries: [
      {
        type: String,
        trim: true,
      },
    ],

    accessibility: {
      type: String,
      trim: true,
    },

    role: {
      type: String,
      enum: ["user"],
      default: "user",
    },
  },
  { timestamps: true },
);

export default mongoose.model("Parishioner", ParishionerSchema);
