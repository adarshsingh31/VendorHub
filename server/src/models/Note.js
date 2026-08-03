import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Note title is required"],
      trim: true,
      maxlength: [150, "Title must be 150 characters or fewer"],
    },
    content: {
      type: String,
      required: [true, "Note content is required"],
      trim: true,
    },
    // Reference to the owner — every note belongs to exactly one user
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
  }
);

const Note = mongoose.model("Note", noteSchema);

export default Note;
