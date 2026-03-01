import Event from "../models/Eventschema.js";

// ============ PUBLIC ENDPOINTS ============

// Get all published events
export const getPublishedEvents = async (req, res) => {
  try {
    const events = await Event.find({ isPublished: true })
      .sort({ date: 1 }) // Sort by date ascending (upcoming first)
      .lean();

    res.json(events);
  } catch (error) {
    console.error("Get published events error:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

// ============ ADMIN ENDPOINTS ============

// Get all events (admin - includes unpublished)
export const getAllEventsAdmin = async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 }).lean();
    res.json(events);
  } catch (error) {
    console.error("Get all events admin error:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

// Create a new event
export const createEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      date,
      time,
      location,
      category,
      maxAttendees,
      imageUrl,
    } = req.body;

    if (!title || !description || !date || !time || !location) {
      return res
        .status(400)
        .json({ message: "All required fields must be filled" });
    }

    const event = new Event({
      title,
      description,
      date,
      time,
      location,
      category: category || "Event",
      maxAttendees: maxAttendees || 50,
      imageUrl: imageUrl || null,
      attendees: 0,
      isPublished: false,
    });

    await event.save();
    res.status(201).json(event);
  } catch (error) {
    console.error("Create event error:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

// Update an event
export const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const event = await Event.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json(event);
  } catch (error) {
    console.error("Update event error:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

// Toggle publish status
export const toggleEventPublish = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    event.isPublished = !event.isPublished;
    await event.save();

    res.json(event);
  } catch (error) {
    console.error("Toggle event publish error:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

// Delete an event
export const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findByIdAndDelete(id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("Delete event error:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};
