import mongoose from "mongoose";

const galleryPhotoSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    image: { type: String, required: true }, // URL
    caption: { type: String, default: "" },
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export default mongoose.model("GalleryPhoto", galleryPhotoSchema);
