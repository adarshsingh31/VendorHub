/**
 * notesApi.js — Notes API service using the shared Axios instance.
 *
 * All requests are sent through `api` (axiosInstance), which automatically
 * attaches the Authorization: Bearer <jwt> header via a request interceptor.
 * No manual header passing needed here.
 */

import api from "./axiosInstance";

// ─── Notes API Functions ───────────────────────────────────────────────────────

/**
 * Fetch all notes for the logged-in user.
 * GET /api/notes
 */
export const getNotes = async () => {
  const { data } = await api.get("/api/notes");
  return data; // { success, count, notes }
};

/**
 * Fetch a single note by its ID.
 * GET /api/notes/:id
 */
export const getNoteById = async (id) => {
  const { data } = await api.get(`/api/notes/${id}`);
  return data; // { success, note }
};

/**
 * Create a new note.
 * POST /api/notes
 * @param {{ title: string, content: string }} noteData
 */
export const createNote = async (noteData) => {
  const { data } = await api.post("/api/notes", noteData);
  return data; // { success, message, note }
};

/**
 * Update an existing note by ID.
 * PUT /api/notes/:id
 * @param {string} id
 * @param {{ title?: string, content?: string }} updates
 */
export const updateNote = async (id, updates) => {
  const { data } = await api.put(`/api/notes/${id}`, updates);
  return data; // { success, message, note }
};

/**
 * Delete a note by ID.
 * DELETE /api/notes/:id
 * @param {string} id
 */
export const deleteNote = async (id) => {
  const { data } = await api.delete(`/api/notes/${id}`);
  return data; // { success, message }
};
