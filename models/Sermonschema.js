import mongoose from "mongoose";

const sermonSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    speaker: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    duration: { type: String, required: true, trim: true }, // e.g. "18:32"
    type: { type: String, enum: ["video", "audio"], required: true },
    thumbnail: { type: String, default: "" }, // URL
    mediaUrl: { type: String, default: "" }, // video/audio URL or embed link
    description: { type: String, default: "" },
    scripture: { type: String, default: "" },
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export default mongoose.model("Sermon", sermonSchema);
