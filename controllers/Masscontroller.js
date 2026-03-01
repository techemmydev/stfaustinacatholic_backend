import Mass from "../models/MassSchema.js";

// ============ PUBLIC ENDPOINTS ============

// Get all active masses
export const getMasses = async (req, res) => {
  try {
    const masses = await Mass.find({ isActive: true }).sort({
      day: 1,
      time: 1,
    });
    res.json(masses);
  } catch (error) {
    console.error("Get masses error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ============ ADMIN ENDPOINTS ============

// Get all masses (admin - includes inactive)
export const getAllMassesAdmin = async (req, res) => {
  try {
    const masses = await Mass.find().sort({ day: 1, time: 1 });
    res.json(masses);
  } catch (error) {
    console.error("Get all masses admin error:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

// Create a single mass
export const createMass = async (req, res) => {
  try {
    const { name, time, day, maxThanksgivings, description } = req.body;

    if (!name || !time || !day) {
      return res
        .status(400)
        .json({ message: "Name, time, and day are required." });
    }

    // Check for duplicate
    const existing = await Mass.findOne({ day, time });
    if (existing) {
      return res.status(409).json({
        message: "A mass already exists for this day and time.",
      });
    }

    const mass = new Mass({
      name,
      time,
      day,
      maxThanksgivings: maxThanksgivings || 5,
      description: description || "",
      currentThanksgivings: 0,
      isActive: true,
    });

    await mass.save();
    res.status(201).json(mass);
  } catch (error) {
    console.error("Create mass error:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

// Create multiple masses at once (bulk create)
export const createBulkMasses = async (req, res) => {
  try {
    const { masses } = req.body;
    // masses: [{ name, time, day, maxThanksgivings }, ...]

    if (!masses || !Array.isArray(masses) || masses.length === 0) {
      return res.status(400).json({ message: "Masses array is required." });
    }

    const results = { created: [], skipped: [] };

    for (const massData of masses) {
      const { name, time, day, maxThanksgivings } = massData;

      if (!name || !time || !day) {
        results.skipped.push({
          ...massData,
          reason: "Missing required fields",
        });
        continue;
      }

      const existing = await Mass.findOne({ day, time });
      if (existing) {
        results.skipped.push({ ...massData, reason: "Duplicate" });
        continue;
      }

      await Mass.create({
        name,
        time,
        day,
        maxThanksgivings: maxThanksgivings || 5,
        currentThanksgivings: 0,
        isActive: true,
      });

      results.created.push(massData);
    }

    res.status(201).json({
      message: `Created ${results.created.length} mass(es), skipped ${results.skipped.length}.`,
      ...results,
    });
  } catch (error) {
    console.error("Bulk create masses error:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

// Update a mass
export const updateMass = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, time, day, maxThanksgivings, isActive, description } =
      req.body;

    const mass = await Mass.findByIdAndUpdate(
      id,
      {
        ...(name && { name }),
        ...(time && { time }),
        ...(day && { day }),
        ...(maxThanksgivings !== undefined && { maxThanksgivings }),
        ...(isActive !== undefined && { isActive }),
        ...(description !== undefined && { description }),
      },
      { new: true, runValidators: true },
    );

    if (!mass) {
      return res.status(404).json({ message: "Mass not found." });
    }

    res.json(mass);
  } catch (error) {
    console.error("Update mass error:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

// Toggle mass active status
export const toggleMassStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const mass = await Mass.findById(id);
    if (!mass) {
      return res.status(404).json({ message: "Mass not found." });
    }

    mass.isActive = !mass.isActive;
    await mass.save();

    res.json(mass);
  } catch (error) {
    console.error("Toggle mass status error:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

// Delete a mass
export const deleteMass = async (req, res) => {
  try {
    const { id } = req.params;

    const mass = await Mass.findById(id);
    if (!mass) {
      return res.status(404).json({ message: "Mass not found." });
    }

    if (mass.currentThanksgivings > 0) {
      return res.status(400).json({
        message: `Cannot delete: this mass has ${mass.currentThanksgivings} existing thanksgiving booking(s).`,
      });
    }

    await mass.deleteOne();
    res.json({ message: "Mass deleted successfully." });
  } catch (error) {
    console.error("Delete mass error:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};
