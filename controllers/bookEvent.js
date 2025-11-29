import { Booking } from "../models/BookingSchema.js";
import { generateToken } from "../utils/generateToken.js";
import Validator from "email-validator";

export const BookForAnEvent = async (req, res) => {
  const {
    clientFirstName,
    clientLastName,
    clientEmail,
    clientPhone,
    eventType,
    eventDate,
    eventMessage,
  } = req.body;

  // Log the request body for debugging
  console.log(req.body);

  try {
    // Validate required fields
    if (
      !clientFirstName ||
      !clientLastName ||
      !clientEmail ||
      !clientPhone ||
      !eventType ||
      !eventDate ||
      !eventMessage
    ) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    // Validate email format
    if (!Validator.validate(clientEmail)) {
      return res.status(400).json({ success: false, message: "Invalid email" });
    }

    // Check if booking already exists for the same date and Email
    const existingBooking = await Booking.findOne({
      eventDate,
    });
    if (existingBooking) {
      return res.status(400).json({
        success: false,
        message: "Booking already exists for this date ",
      });
    }

    // Create new booking instance
    const newBooking = new Booking({
      clientName: `${clientFirstName} ${clientLastName}`, // Combine first & last name
      clientEmail,
      clientPhone,
      eventType,
      eventDate,
      eventMessage,
    });

    // Save to database
    await newBooking.save();

    // Generate token (if necessary)
    generateToken(res, newBooking._id);

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      bookingDetails: newBooking,
    });
  } catch (error) {
    console.error("Error booking event:", error);

    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "This email is already associated with a booking.",
      });
    }

    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
