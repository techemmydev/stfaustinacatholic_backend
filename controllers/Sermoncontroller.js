import Sermon from "../models/Sermonschema.js";
import GalleryPhoto from "../models/Galleryphotoschema .js";

// ═══════════════════════════════════════════════════════
//  SERMONS
// ══════════════════════════════════════

// ── Public ──────────────────────────────────────────────

/** GET /sermons  — all published sermons, newest first */
export const getAllSermons = async (req, res) => {
  try {
    const sermons = await Sermon.find({ isPublished: true }).sort({
      date: -1,
    });
    res.status(200).json(sermons);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
};

// ── Admin ────────────────────────────────────────────────

/** GET /admin/sermons  — all sermons (published + unpublished) */
export const getAllSermonsAdmin = async (req, res) => {
  try {
    const sermons = await Sermon.find().sort({ date: -1 });
    res.status(200).json(sermons);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
};

/** POST /admin/sermons  — create a sermon */
export const createSermon = async (req, res) => {
  try {
    const {
      title,
      speaker,
      date,
      duration,
      type,
      thumbnail,
      mediaUrl,
      description,
      scripture,
      isPublished,
    } = req.body;

    if (!title || !speaker || !date || !duration || !type) {
      return res.status(400).json({ message: "Required fields missing." });
    }

    const sermon = new Sermon({
      title,
      speaker,
      date,
      duration,
      type,
      thumbnail,
      mediaUrl,
      description,
      scripture,
      isPublished: isPublished !== undefined ? isPublished : true,
    });

    await sermon.save();
    res.status(201).json(sermon);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
};

/** PUT /admin/sermons/:id  — update a sermon */
export const updateSermon = async (req, res) => {
  try {
    const sermon = await Sermon.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!sermon) return res.status(404).json({ message: "Sermon not found." });
    res.status(200).json(sermon);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
};

/** PATCH /admin/sermons/:id/toggle  — toggle published status */
export const toggleSermonPublished = async (req, res) => {
  try {
    const sermon = await Sermon.findById(req.params.id);
    if (!sermon) return res.status(404).json({ message: "Sermon not found." });
    sermon.isPublished = !sermon.isPublished;
    await sermon.save();
    res.status(200).json(sermon);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
};

/** DELETE /admin/sermons/:id  — delete a sermon */
export const deleteSermon = async (req, res) => {
  try {
    const sermon = await Sermon.findByIdAndDelete(req.params.id);
    if (!sermon) return res.status(404).json({ message: "Sermon not found." });
    res.status(200).json({ message: "Sermon deleted successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
};

// ═══════════════════════════════════════════════════════
//  GALLERY
// ═══════════════════════════════════════════════════════

// ── Public ──────────────────────────────────────────────

/** GET /gallery  — all published photos, newest first */
export const getAllPhotos = async (req, res) => {
  try {
    const photos = await GalleryPhoto.find({ isPublished: true }).sort({
      date: -1,
    });
    res.status(200).json(photos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
};

// ── Admin ────────────────────────────────────────────────

/** GET /admin/gallery  — all photos */
export const getAllPhotosAdmin = async (req, res) => {
  try {
    const photos = await GalleryPhoto.find().sort({ date: -1 });
    res.status(200).json(photos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
};

/** POST /admin/gallery  — add a photo */
export const createPhoto = async (req, res) => {
  try {
    const { title, date, image, caption, isPublished } = req.body;
    if (!title || !date || !image) {
      return res
        .status(400)
        .json({ message: "title, date and image are required." });
    }
    const photo = new GalleryPhoto({
      title,
      date,
      image,
      caption,
      isPublished,
    });
    await photo.save();
    res.status(201).json(photo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
};

/** PUT /admin/gallery/:id  — update a photo */
export const updatePhoto = async (req, res) => {
  try {
    const photo = await GalleryPhoto.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      },
    );
    if (!photo) return res.status(404).json({ message: "Photo not found." });
    res.status(200).json(photo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
};

/** PATCH /admin/gallery/:id/toggle  — toggle published */
export const togglePhotoPublished = async (req, res) => {
  try {
    const photo = await GalleryPhoto.findById(req.params.id);
    if (!photo) return res.status(404).json({ message: "Photo not found." });
    photo.isPublished = !photo.isPublished;
    await photo.save();
    res.status(200).json(photo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
};

/** DELETE /admin/gallery/:id  — delete a photo */
export const deletePhoto = async (req, res) => {
  try {
    const photo = await GalleryPhoto.findByIdAndDelete(req.params.id);
    if (!photo) return res.status(404).json({ message: "Photo not found." });
    res.status(200).json({ message: "Photo deleted successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
};
