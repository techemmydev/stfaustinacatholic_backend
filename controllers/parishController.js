import Parishioner from "../models/UserparishSchema.js";
// GET /api/parishioners?search=&page=&limit=

// POST /api/parishioners
export const registerParishioner = async (req, res) => {
  try {
    const {
      fullName,
      dob,
      gender,
      address,
      phone,
      email,
      occupation,
      maritalStatus,
      spouseName,
      sacraments,
      previousParish,
      ministries,
      accessibility,
      status,
    } = req.body;

    // Check if email already exists
    const existing = await Parishioner.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const newParishioner = new Parishioner({
      fullName,
      dob,
      gender,
      address,
      phone,
      email,
      occupation,
      maritalStatus,
      spouseName,
      sacraments,
      previousParish,
      ministries,
      accessibility,
      status: status || "Active",
      registeredDate: new Date(),
    });

    const saved = await newParishioner.save();
    res.status(201).json(saved);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const getParishioners = async (req, res) => {
  try {
    const { search = "", page = 1, limit = 10 } = req.query;

    const query = {
      $or: [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ],
    };

    const total = await Parishioner.countDocuments(query);
    const parishioners = await Parishioner.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.status(200).json({
      parishioners,
      total,
      page: Number(page),
      limit: Number(limit),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// PATCH /api/parishioners/:id
export const updateParishioner = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updated = await Parishioner.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    res.status(200).json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// DELETE /api/parishioners/:id
export const deleteParishioner = async (req, res) => {
  try {
    const { id } = req.params;
    await Parishioner.findByIdAndDelete(id);
    res.status(200).json({ message: "Parishioner deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// DELETE ALL /api/parishioners
export const deleteAllParishioners = async (req, res) => {
  try {
    await Parishioner.deleteMany({});
    res.status(200).json({ message: "All parishioners deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};
