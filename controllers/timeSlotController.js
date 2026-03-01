import TimeSlot from "../models/TimeSlotSchema.js";

// ─────────────────────────────────────────────────────────────
// PUBLIC ENDPOINT
// ─────────────────────────────────────────────────────────────

// GET /api/appointments/:date
// Returns available slots for a given date
export const getAvailableSlots = async (req, res) => {
  try {
    const { date } = req.params;

    const normalizedDate = new Date(date);
    normalizedDate.setUTCHours(0, 0, 0, 0);

    if (isNaN(normalizedDate.getTime())) {
      return res.status(400).json({ message: "Invalid date format." });
    }

    const slots = await TimeSlot.find({
      date: normalizedDate,
      isAvailable: true,
    }).lean();

    const availableSlots = slots
      .filter((slot) => slot.bookedCount < slot.maxCapacity)
      .map((slot) => ({
        time: slot.time,
        remaining: slot.maxCapacity - slot.bookedCount,
      }))
      .sort((a, b) => {
        // Sort by time (convert "9:00 AM" to comparable value)
        const toMinutes = (t) => {
          const [time, period] = t.split(" ");
          let [h, m] = time.split(":").map(Number);
          if (period === "PM" && h !== 12) h += 12;
          if (period === "AM" && h === 12) h = 0;
          return h * 60 + m;
        };
        return toMinutes(a.time) - toMinutes(b.time);
      });

    res.json(availableSlots);
  } catch (error) {
    console.error("Get available slots error:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

// ─────────────────────────────────────────────────────────────
// ADMIN ENDPOINTS
// ─────────────────────────────────────────────────────────────

// GET /api/admin/time-slots?date=YYYY-MM-DD
// Returns ALL slots for a date (including full/disabled ones)
export const getAllSlotsForDate = async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ message: "Date query param is required." });
    }

    const normalizedDate = new Date(date);
    normalizedDate.setUTCHours(0, 0, 0, 0);

    const slots = await TimeSlot.find({ date: normalizedDate })
      .sort({ time: 1 })
      .lean();

    res.json(slots);
  } catch (error) {
    console.error("Get all slots error:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

// POST /api/admin/time-slots
// Create a single slot
export const createSlot = async (req, res) => {
  try {
    const { date, time, maxCapacity } = req.body;

    if (!date || !time) {
      return res.status(400).json({ message: "Date and time are required." });
    }

    const normalizedDate = new Date(date);
    normalizedDate.setUTCHours(0, 0, 0, 0);

    // Check for duplicate
    const existing = await TimeSlot.findOne({ date: normalizedDate, time });
    if (existing) {
      return res
        .status(409)
        .json({ message: "A slot already exists for this date and time." });
    }

    const slot = new TimeSlot({
      date: normalizedDate,
      time,
      maxCapacity: maxCapacity || 5,
      bookedCount: 0,
      isAvailable: true,
    });

    await slot.save();
    res.status(201).json(slot);
  } catch (error) {
    console.error("Create slot error:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

// POST /api/admin/time-slots/bulk
// Create multiple slots for a date at once (e.g. generate a full day)
export const createBulkSlots = async (req, res) => {
  try {
    const { date, times, maxCapacity } = req.body;
    // times: ["9:00 AM", "10:00 AM", "11:00 AM", ...]

    if (!date || !times || !Array.isArray(times) || times.length === 0) {
      return res
        .status(400)
        .json({ message: "Date and times array are required." });
    }

    const normalizedDate = new Date(date);
    normalizedDate.setUTCHours(0, 0, 0, 0);

    const results = { created: [], skipped: [] };

    for (const time of times) {
      const existing = await TimeSlot.findOne({ date: normalizedDate, time });
      if (existing) {
        results.skipped.push(time);
        continue;
      }
      await TimeSlot.create({
        date: normalizedDate,
        time,
        maxCapacity: maxCapacity || 5,
        bookedCount: 0,
        isAvailable: true,
      });
      results.created.push(time);
    }

    res.status(201).json({
      message: `Created ${results.created.length} slot(s), skipped ${results.skipped.length} duplicate(s).`,
      ...results,
    });
  } catch (error) {
    console.error("Bulk create slots error:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

// PATCH /api/admin/time-slots/:id
// Update a slot (maxCapacity or isAvailable)
export const updateSlot = async (req, res) => {
  try {
    const { id } = req.params;
    const { maxCapacity, isAvailable } = req.body;

    const slot = await TimeSlot.findByIdAndUpdate(
      id,
      {
        ...(maxCapacity !== undefined && { maxCapacity }),
        ...(isAvailable !== undefined && { isAvailable }),
      },
      { new: true, runValidators: true },
    );

    if (!slot) {
      return res.status(404).json({ message: "Slot not found." });
    }

    res.json(slot);
  } catch (error) {
    console.error("Update slot error:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

// DELETE /api/admin/time-slots/:id
// Delete a slot (only if no bookings)
export const deleteSlot = async (req, res) => {
  try {
    const { id } = req.params;

    const slot = await TimeSlot.findById(id);
    if (!slot) {
      return res.status(404).json({ message: "Slot not found." });
    }

    if (slot.bookedCount > 0) {
      return res.status(400).json({
        message: `Cannot delete: this slot has ${slot.bookedCount} existing booking(s).`,
      });
    }

    await slot.deleteOne();
    res.json({ message: "Slot deleted successfully." });
  } catch (error) {
    console.error("Delete slot error:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};
