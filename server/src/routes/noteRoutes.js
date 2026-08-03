import express from "express";
import {
  createNote,
  getUserNotes,
  getNoteById,
  updateNote,
  deleteNote,
} from "../controllers/noteController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

// All note routes are protected — JWT required on every request
router.use(protect);

// ─── Note Routes ──────────────────────────────────────────────────────────────

// POST   /api/notes          → Create a new note
// GET    /api/notes          → Get all notes for the logged-in user
router.route("/").post(createNote).get(getUserNotes);

// GET    /api/notes/:id      → Get a single note by ID
// PUT    /api/notes/:id      → Update a note by ID
// DELETE /api/notes/:id      → Delete a note by ID
router.route("/:id").get(getNoteById).put(updateNote).delete(deleteNote);

export default router;
