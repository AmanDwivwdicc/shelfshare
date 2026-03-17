import mongoose, { Schema } from "mongoose";

const BookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    author: { type: String, required: true, trim: true },

    // Support both names to avoid breaking older documents/routes.
    ownerId: { type: String, trim: true },
    owner: { type: String, trim: true },

    genre: { type: String, trim: true, default: "General" },
    location: { type: String, trim: true },
    condition: { type: String, trim: true, default: "Good" },

    available: { type: Boolean, default: true },
    requestedBy: { type: String, default: null },
  },
  { timestamps: true }
);

export default mongoose.models.Book || mongoose.model("Book", BookSchema);