import Thanksgiving from "../models/ThanksgivingSchema.js";
import Mass from "../models/MassSchema.js"; // registers "MassBooking" schema
import { getWeekKey } from "../utils/weekKey.js";

// ============ PUBLIC ENDPOINTS ============

// Get all masses
export const getMasses = async (req, res) => {
  try {
    const masses = await Mass.find();
    res.json(masses);
  } catch (error) {
    console.error("Get masses error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Create a new thanksgiving booking
export const createThanksgiving = async (req, res) => {
  try {
    const { name, email, intention, massId } = req.body;

    if (!name || !email || !intention || !massId) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const mass = await Mass.findById(massId);
    if (!mass) {
      return res.status(404).json({ message: "Mass not found" });
    }

    const weekKey = getWeekKey();

    // Count thanksgivings for this mass this week
    const count = await Thanksgiving.countDocuments({
      mass: massId,
      weekKey,
    });

    if (count >= mass.maxThanksgivings) {
      return res.status(400).json({
        message: "This Mass is full for the week. Please select another Mass.",
      });
    }

    const thanksgiving = await Thanksgiving.create({
      name,
      email,
      intention,
      mass: massId,
      weekKey,
      status: "pending",
    });

    // Populate mass details before sending response
    await thanksgiving.populate("mass", "name");

    res.status(201).json({
      message: "Thanksgiving submitted successfully",
      thanksgiving,
    });
  } catch (error) {
    console.error("Create thanksgiving error:", error);

    // Handle duplicate submission
    if (error.code === 11000) {
      return res.status(400).json({
        message: "You already submitted for this Mass this week",
      });
    }

    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

// ============ ADMIN ENDPOINTS ============

// Get all thanksgiving bookings (admin)
export const getAllThanksgivingsAdmin = async (req, res) => {
  try {
    const thanksgivings = await Thanksgiving.find()
      .populate("mass", "name time")
      .sort({ createdAt: -1 })
      .lean();

    res.json(thanksgivings);
  } catch (error) {
    console.error("Get all thanksgivings admin error:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

// Approve thanksgiving
export const approveThanksgiving = async (req, res) => {
  try {
    const { id } = req.params;

    const thanksgiving = await Thanksgiving.findById(id).populate(
      "mass",
      "name time",
    );

    if (!thanksgiving) {
      return res.status(404).json({ message: "Thanksgiving not found" });
    }

    thanksgiving.status = "approved";
    await thanksgiving.save();

    res.json(thanksgiving);
  } catch (error) {
    console.error("Approve thanksgiving error:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

// Reject thanksgiving
export const rejectThanksgiving = async (req, res) => {
  try {
    const { id } = req.params;

    const thanksgiving = await Thanksgiving.findById(id).populate(
      "mass",
      "name time",
    );

    if (!thanksgiving) {
      return res.status(404).json({ message: "Thanksgiving not found" });
    }

    thanksgiving.status = "rejected";
    await thanksgiving.save();

    res.json(thanksgiving);
  } catch (error) {
    console.error("Reject thanksgiving error:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

// Delete thanksgiving
export const deleteThanksgiving = async (req, res) => {
  try {
    const { id } = req.params;

    const thanksgiving = await Thanksgiving.findByIdAndDelete(id);

    if (!thanksgiving) {
      return res.status(404).json({ message: "Thanksgiving not found" });
    }

    res.json({ message: "Thanksgiving deleted successfully" });
  } catch (error) {
    console.error("Delete thanksgiving error:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};
