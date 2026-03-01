import MassSchedule from "../models/Massscheduleschema.js";

// ============ PUBLIC ENDPOINTS ============

// Get all published mass schedules
export const getPublishedMassSchedules = async (req, res) => {
  try {
    const dayOrder = {
      Sunday: 1,
      "Monday - Friday": 2,
      Monday: 3,
      Tuesday: 4,
      Wednesday: 5,
      Thursday: 6,
      Friday: 7,
      Saturday: 8,
      "First Friday": 9,
      "Holy Days": 10,
    };

    const schedules = await MassSchedule.find({ isPublished: true }).lean();

    const sortedSchedules = schedules.sort((a, b) => {
      const dayComparison = dayOrder[a.day] - dayOrder[b.day];
      if (dayComparison !== 0) return dayComparison;
      return a.time.localeCompare(b.time);
    });

    res.json(sortedSchedules);
  } catch (error) {
    console.error("Get published mass schedules error:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

// ============ ADMIN ENDPOINTS ============

// Get all mass schedules (admin - includes unpublished)
export const getAllMassSchedulesAdmin = async (req, res) => {
  try {
    const schedules = await MassSchedule.find().sort({ createdAt: -1 }).lean();
    res.json(schedules);
  } catch (error) {
    console.error("Get all mass schedules admin error:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

// Create a new mass schedule
export const createMassSchedule = async (req, res) => {
  try {
    const { day, time, type, language, location, notes } = req.body;

    if (!day || !time || !type) {
      return res
        .status(400)
        .json({ message: "Day, time, and type are required" });
    }

    const schedule = new MassSchedule({
      day,
      time,
      type,
      language: language || "English",
      location: location || "Main Church",
      notes: notes || "",
      isPublished: false,
    });

    await schedule.save();
    res.status(201).json(schedule);
  } catch (error) {
    console.error("Create mass schedule error:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

// Update a mass schedule
export const updateMassSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const schedule = await MassSchedule.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!schedule) {
      return res.status(404).json({ message: "Mass schedule not found" });
    }

    res.json(schedule);
  } catch (error) {
    console.error("Update mass schedule error:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

// Toggle publish status
export const toggleMassSchedulePublish = async (req, res) => {
  try {
    const { id } = req.params;

    const schedule = await MassSchedule.findById(id);
    if (!schedule) {
      return res.status(404).json({ message: "Mass schedule not found" });
    }

    schedule.isPublished = !schedule.isPublished;
    await schedule.save();

    res.json(schedule);
  } catch (error) {
    console.error("Toggle mass schedule publish error:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

// Delete a mass schedule
export const deleteMassSchedule = async (req, res) => {
  try {
    const { id } = req.params;

    const schedule = await MassSchedule.findByIdAndDelete(id);
    if (!schedule) {
      return res.status(404).json({ message: "Mass schedule not found" });
    }

    res.json({ message: "Mass schedule deleted successfully" });
  } catch (error) {
    console.error("Delete mass schedule error:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};
