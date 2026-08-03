import Note from "../models/Note.js";

// ─── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Format a Note document into a clean response object.
 * Avoids exposing internal Mongoose fields.
 */
const formatNote = (note) => ({
  id: note._id,
  title: note.title,
  content: note.content,
  createdAt: note.createdAt,
  updatedAt: note.updatedAt,
});

// ─── Controllers ──────────────────────────────────────────────────────────────

/**
 * POST /api/notes
 * Create a new note for the logged-in user.
 */
export const createNote = async (req, res) => {
  try {
    const { title, content } = req.body;

    // Validate required fields
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: "Please provide both a title and content",
      });
    }

    if (title.trim().length === 0 || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Title and content cannot be empty",
      });
    }

    const note = await Note.create({
      title: title.trim(),
      content: content.trim(),
      user: req.user.id, // injected by protect middleware
    });

    return res.status(201).json({
      success: true,
      message: "Note created successfully",
      note: formatNote(note),
    });
  } catch (error) {
    console.error("Create Note Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * GET /api/notes
 * Fetch all notes belonging to the logged-in user, newest first.
 */
export const getUserNotes = async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user.id })
      .sort({ createdAt: -1 }) // newest first
      .lean();

    return res.status(200).json({
      success: true,
      count: notes.length,
      notes: notes.map(formatNote),
    });
  } catch (error) {
    console.error("Get Notes Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * GET /api/notes/:id
 * Fetch a single note by ID — only if it belongs to the logged-in user.
 */
export const getNoteById = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id).lean();

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found",
      });
    }

    // Ownership check
    if (note.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Access denied. This note does not belong to you.",
      });
    }

    return res.status(200).json({
      success: true,
      note: formatNote(note),
    });
  } catch (error) {
    console.error("Get Note By ID Error:", error);
    // Handle invalid ObjectId format
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid note ID format",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * PUT /api/notes/:id
 * Update a note — only if it belongs to the logged-in user.
 */
export const updateNote = async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title && !content) {
      return res.status(400).json({
        success: false,
        message: "Please provide at least a title or content to update",
      });
    }

    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found",
      });
    }

    // Ownership check
    if (note.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You can only edit your own notes.",
      });
    }

    // Apply updates only for fields that were provided
    if (title !== undefined) note.title = title.trim();
    if (content !== undefined) note.content = content.trim();

    const updatedNote = await note.save();

    return res.status(200).json({
      success: true,
      message: "Note updated successfully",
      note: formatNote(updatedNote),
    });
  } catch (error) {
    console.error("Update Note Error:", error);
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid note ID format",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * DELETE /api/notes/:id
 * Delete a note — only if it belongs to the logged-in user.
 */
export const deleteNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found",
      });
    }

    // Ownership check
    if (note.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You can only delete your own notes.",
      });
    }

    await note.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Note deleted successfully",
    });
  } catch (error) {
    console.error("Delete Note Error:", error);
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid note ID format",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
