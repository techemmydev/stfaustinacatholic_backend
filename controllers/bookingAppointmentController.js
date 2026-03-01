import Appointment from "../models/BookingAppointControllerSschema.js";
import TimeSlot from "../models/TimeSlotSchema.js";

// ─────────────────────────────────────────────────────────────
// PUBLIC ENDPOINTS
// ─────────────────────────────────────────────────────────────

// Book Appointment
export const bookAppointment = async (req, res) => {
  try {
    const { name, email, phone, appointmentType, date, time, notes } = req.body;

    if (!name || !email || !phone || !appointmentType || !date || !time) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const normalizedDate = new Date(date);
    normalizedDate.setUTCHours(0, 0, 0, 0);

    const slot = await TimeSlot.findOne({ date: normalizedDate, time });
    if (!slot) {
      return res.status(404).json({ message: "Time slot not found." });
    }

    if (slot.bookedCount >= slot.maxCapacity) {
      return res.status(409).json({ message: "This time slot is full." });
    }

    const appointment = new Appointment({
      name,
      email,
      phone,
      appointmentType,
      date: normalizedDate,
      time,
      notes,
    });
    await appointment.save();

    slot.bookedCount += 1;
    await slot.save();

    res.status(201).json({ message: "Appointment booked successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

// Get available slots for a date
export const getAvailableSlots = async (req, res) => {
  try {
    const { date } = req.params;

    const normalizedDate = new Date(date);
    normalizedDate.setUTCHours(0, 0, 0, 0);

    const slots = await TimeSlot.find({ date: normalizedDate }).lean();

    const availableSlots = slots
      .filter((slot) => slot.bookedCount < slot.maxCapacity)
      .map((slot) => ({
        time: slot.time,
        remaining: slot.maxCapacity - slot.bookedCount,
      }));

    res.json(availableSlots);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

// ─────────────────────────────────────────────────────────────
// ADMIN ENDPOINTS
// ─────────────────────────────────────────────────────────────

// Get all appointments (admin)
export const getAllAppointmentsAdmin = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .sort({ createdAt: -1 })
      .lean();
    res.json(appointments);
  } catch (error) {
    console.error("Get all appointments error:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

// Approve an appointment
export const approveAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findByIdAndUpdate(
      id,
      { status: "approved" },
      { new: true },
    );

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found." });
    }

    res.json(appointment);
  } catch (error) {
    console.error("Approve appointment error:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

// Reject an appointment
export const rejectAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findByIdAndUpdate(
      id,
      { status: "rejected" },
      { new: true },
    );

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found." });
    }

    res.json(appointment);
  } catch (error) {
    console.error("Reject appointment error:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

// Delete an appointment
export const deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findByIdAndDelete(id);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found." });
    }

    res.json({ message: "Appointment deleted successfully." });
  } catch (error) {
    console.error("Delete appointment error:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};
