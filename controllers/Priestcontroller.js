import Priest from "../models/Priestschema.js";

// ── Public ───────────────────────────────────────────────────────────────────

/** GET /priests  — all active priests */
export const getAllPriests = async (req, res) => {
  try {
    const priests = await Priest.find({ isActive: true }).sort({
      createdAt: 1,
    });
    res.status(200).json(priests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
};

// ── Admin ────────────────────────────────────────────────────────────────────

/** GET /admin/priests  — all priests including inactive */
export const getAllPriestsAdmin = async (req, res) => {
  try {
    const priests = await Priest.find().sort({ createdAt: 1 });
    res.status(200).json(priests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
};

/** POST /admin/priests  — create a priest */
export const createPriest = async (req, res) => {
  try {
    const { name, email, phone, photo, bio, specializations, status } =
      req.body;

    if (!name || !email) {
      return res.status(400).json({ message: "Name and email are required." });
    }

    const priest = new Priest({
      name,
      email,
      phone,
      photo,
      bio,
      specializations,
      status,
    });
    await priest.save();
    res.status(201).json(priest);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
};

/** PUT /admin/priests/:id  — update a priest */
export const updatePriest = async (req, res) => {
  try {
    const priest = await Priest.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!priest) return res.status(404).json({ message: "Priest not found." });
    res.status(200).json(priest);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
};

/** PATCH /admin/priests/:id/toggle  — toggle isActive */
export const togglePriestActive = async (req, res) => {
  try {
    const priest = await Priest.findById(req.params.id);
    if (!priest) return res.status(404).json({ message: "Priest not found." });
    priest.isActive = !priest.isActive;
    await priest.save();
    res.status(200).json(priest);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
};

/** DELETE /admin/priests/:id  — delete a priest */
export const deletePriest = async (req, res) => {
  try {
    const priest = await Priest.findByIdAndDelete(req.params.id);
    if (!priest) return res.status(404).json({ message: "Priest not found." });
    res.status(200).json({ message: "Priest deleted successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
};
