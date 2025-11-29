import { Hall } from "../models/HallSchema.js";

// GET /api/halls - Fetch all available halls
export const getAllHalls = async (req, res) => {
  try {
    const halls = await Hall.find({ available: true }); // Fetch only available halls
    res.status(200).json({ success: true, data: halls });
  } catch (error) {
    console.error("Error fetching halls:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const postHall = async (req, res) => {
  try {
    const { hallName, location, capacity, price, description, available } =
      req.body;

    // Validate required fields
    if (!hallName || !location || !capacity || !price) {
      return res.status(400).json({
        success: false,
        message: "hallName, location, capacity, and price are required",
      });
    }

    // Create a new hall
    const newHall = new Hall({
      hallName,
      location,
      capacity,
      price,
      description,
      available: available ?? true, // Default to true if not provided
    });

    // Save to database
    await newHall.save();

    res.status(201).json({
      success: true,
      message: "Hall added successfully",
      hall: newHall,
    });
  } catch (error) {
    console.error("Error adding hall:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
