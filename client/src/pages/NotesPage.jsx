import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  getNotes,
  createNote,
  updateNote,
  deleteNote,
} from "../services/notesApi";

// ─── Sub-components ────────────────────────────────────────────────────────────

/**
 * Inline spinner shown inside buttons during async operations.
 */
function ButtonSpinner() {
  return (
    <span
      className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
      aria-hidden="true"
    />
  );
}

/**
 * Full-screen centered skeleton shown on initial load.
 */
function SkeletonCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {[1, 2, 3, 4, 5, 6].map((n) => (
        <div
          key={n}
          className="bg-white rounded-2xl border border-slate-100 p-5 flex flex-col gap-3 shadow-sm animate-pulse"
        >
          <div className="h-5 bg-slate-100 rounded-lg w-3/4" />
          <div className="h-3 bg-slate-100 rounded-lg w-full" />
          <div className="h-3 bg-slate-100 rounded-lg w-5/6" />
          <div className="h-3 bg-slate-100 rounded-lg w-2/3" />
          <div className="mt-auto pt-3 border-t border-slate-50 flex gap-2 justify-end">
            <div className="h-8 w-16 bg-slate-100 rounded-lg" />
            <div className="h-8 w-16 bg-slate-100 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Empty-state illustration shown when the user has no notes yet.
 */
function EmptyState({ onAdd }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-5 text-center fade-in">
      <div className="w-24 h-24 rounded-full bg-[#eff4ff] flex items-center justify-center shadow-inner">
        <span
          className="material-symbols-outlined text-[48px] text-[#004ac6]"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          sticky_note_2
        </span>
      </div>
      <div>
        <p className="text-xl font-bold text-[#0b1c30]">No notes yet</p>
        <p className="text-sm text-[#434655] mt-1">
          Create your first note to get started.
        </p>
      </div>
      <button
        onClick={onAdd}
        className="btn-primary flex items-center gap-2 bg-[#004ac6] hover:bg-[#0039a0] text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 shadow-md hover:shadow-lg"
      >
        <span className="material-symbols-outlined text-[18px]">add</span>
        Create Your First Note
      </button>
    </div>
  );
}

/**
 * Single note card with edit / delete actions.
 */
function NoteCard({ note, onEdit, onDelete, deleting }) {
  const dateStr = new Date(note.updatedAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="hover-lift bg-white rounded-2xl border border-slate-100 p-5 flex flex-col gap-3 shadow-[0_1px_3px_rgba(0,0,0,0.05)] group fade-in">
      {/* Title */}
      <h3 className="font-bold text-[#0b1c30] text-base leading-snug line-clamp-2">
        {note.title}
      </h3>

      {/* Content preview */}
      <p className="text-sm text-[#434655] leading-relaxed line-clamp-4 flex-1 whitespace-pre-wrap">
        {note.content}
      </p>

      {/* Footer */}
      <div className="mt-auto pt-3 border-t border-slate-50 flex items-center justify-between">
        <span className="text-[11px] font-medium text-[#737686] flex items-center gap-1">
          <span className="material-symbols-outlined text-[14px]">
            schedule
          </span>
          {dateStr}
        </span>
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          <button
            id={`edit-note-${note.id}`}
            onClick={() => onEdit(note)}
            title="Edit note"
            className="p-1.5 rounded-lg text-[#434655] hover:text-[#004ac6] hover:bg-[#eff4ff] transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">
              edit
            </span>
          </button>
          <button
            id={`delete-note-${note.id}`}
            onClick={() => onDelete(note.id)}
            title="Delete note"
            disabled={deleting === note.id}
            className="p-1.5 rounded-lg text-[#434655] hover:text-[#ba1a1a] hover:bg-red-50 transition-all disabled:opacity-50"
          >
            {deleting === note.id ? (
              <span className="inline-block w-[18px] h-[18px] border-2 border-red-300/40 border-t-[#ba1a1a] rounded-full animate-spin" />
            ) : (
              <span className="material-symbols-outlined text-[18px]">
                delete
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Modal for creating or editing a note.
 */
function NoteModal({ mode, initial, onClose, onSave, saving }) {
  const [title, setTitle] = useState(initial?.title || "");
  const [content, setContent] = useState(initial?.content || "");
  const [fieldError, setFieldError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setFieldError("Both title and content are required.");
      return;
    }
    onSave({ title: title.trim(), content: content.trim() });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#eff4ff] flex items-center justify-center">
              <span
                className="material-symbols-outlined text-[18px] text-[#004ac6]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                {mode === "create" ? "add_notes" : "edit_note"}
              </span>
            </div>
            <h2 className="font-bold text-[#0b1c30] text-lg">
              {mode === "create" ? "New Note" : "Edit Note"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#434655] hover:bg-slate-100 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">
              close
            </span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-6">
          {fieldError && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-[#ba1a1a] font-medium">
              <span className="material-symbols-outlined text-[18px]">
                error
              </span>
              {fieldError}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="note-title"
              className="text-sm font-semibold text-[#0b1c30]"
            >
              Title
            </label>
            <input
              id="note-title"
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (fieldError) setFieldError("");
              }}
              placeholder="Give your note a title..."
              maxLength={150}
              className="w-full px-4 py-2.5 bg-[#f8f9ff] border border-[#e2e2e2] rounded-xl text-sm text-[#0b1c30] placeholder:text-[#737686] focus:outline-none focus:border-[#004ac6] focus:ring-4 focus:ring-[#004ac6]/10 transition-all"
              autoFocus
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="note-content"
              className="text-sm font-semibold text-[#0b1c30]"
            >
              Content
            </label>
            <textarea
              id="note-content"
              rows={6}
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                if (fieldError) setFieldError("");
              }}
              placeholder="Write your note here..."
              className="w-full px-4 py-2.5 bg-[#f8f9ff] border border-[#e2e2e2] rounded-xl text-sm text-[#0b1c30] placeholder:text-[#737686] focus:outline-none focus:border-[#004ac6] focus:ring-4 focus:ring-[#004ac6]/10 transition-all resize-none leading-relaxed"
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-[#e2e2e2] rounded-xl text-sm font-semibold text-[#434655] hover:bg-slate-50 transition-all"
            >
              Cancel
            </button>
            <button
              id={mode === "create" ? "save-note-btn" : "update-note-btn"}
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 bg-[#004ac6] hover:bg-[#0039a0] text-white rounded-xl text-sm font-semibold transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <ButtonSpinner />
                  {mode === "create" ? "Saving..." : "Updating..."}
                </>
              ) : mode === "create" ? (
                "Save Note"
              ) : (
                "Update Note"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Delete Confirmation Modal ─────────────────────────────────────────────────

function DeleteConfirmModal({ onConfirm, onCancel, deleting }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm fade-in">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6 flex flex-col gap-4">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
            <span
              className="material-symbols-outlined text-[32px] text-[#ba1a1a]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              delete_forever
            </span>
          </div>
          <div>
            <h3 className="font-bold text-[#0b1c30] text-lg">Delete Note?</h3>
            <p className="text-sm text-[#434655] mt-1">
              This action cannot be undone. The note will be permanently
              deleted.
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 border border-[#e2e2e2] rounded-xl text-sm font-semibold text-[#434655] hover:bg-slate-50 transition-all"
          >
            Cancel
          </button>
          <button
            id="confirm-delete-btn"
            onClick={onConfirm}
            disabled={deleting}
            className="flex-1 py-2.5 bg-[#ba1a1a] hover:bg-[#9b1414] text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {deleting ? (
              <>
                <ButtonSpinner />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main NotesPage Component ─────────────────────────────────────────────────

export default function NotesPage() {
  const navigate = useNavigate();

  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal state
  const [modalMode, setModalMode] = useState(null); // 'create' | 'edit' | null
  const [editingNote, setEditingNote] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  // Delete state
  const [pendingDeleteId, setPendingDeleteId] = useState(null); // ID queued for confirm dialog
  const [deletingId, setDeletingId] = useState(null); // ID currently being deleted

  // Search
  const [search, setSearch] = useState("");

  // ── Fetch notes ────────────────────────────────────────────────────────────
  const fetchNotes = useCallback(async () => {
    setError("");
    try {
      const data = await getNotes();
      setNotes(data.notes || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load notes. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    // Redirect unauthenticated users immediately
    if (!localStorage.getItem("vh_token")) {
      navigate("/login");
      return;
    }
    fetchNotes();
  }, [fetchNotes, navigate]);

  // ── Create note ────────────────────────────────────────────────────────────
  const handleCreate = async ({ title, content }) => {
    setSaving(true);
    setSaveError("");
    try {
      const data = await createNote({ title, content });
      setNotes((prev) => [data.note, ...prev]); // prepend — newest first
      setModalMode(null);
    } catch (err) {
      setSaveError(
        err.response?.data?.message || "Failed to save note. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  // ── Update note ────────────────────────────────────────────────────────────
  const handleUpdate = async ({ title, content }) => {
    setSaving(true);
    setSaveError("");
    try {
      const data = await updateNote(editingNote.id, { title, content });
      setNotes((prev) =>
        prev.map((n) => (n.id === editingNote.id ? data.note : n))
      );
      setModalMode(null);
      setEditingNote(null);
    } catch (err) {
      setSaveError(
        err.response?.data?.message ||
          "Failed to update note. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  // ── Delete note ────────────────────────────────────────────────────────────
  const handleDeleteConfirm = async () => {
    if (!pendingDeleteId) return;
    setDeletingId(pendingDeleteId);
    try {
      await deleteNote(pendingDeleteId);
      setNotes((prev) => prev.filter((n) => n.id !== pendingDeleteId));
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to delete note. Please try again."
      );
    } finally {
      setDeletingId(null);
      setPendingDeleteId(null);
    }
  };

  // ── Filtered notes ─────────────────────────────────────────────────────────
  const filteredNotes = notes.filter(
    (n) =>
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.content.toLowerCase().includes(search.toLowerCase())
  );

  // ── Sidebar nav items (matching Dashboard style) ───────────────────────────
  const navItems = [
    { icon: "dashboard", label: "Dashboard", path: "/dashboard" },
    { icon: "sticky_note_2", label: "Notes", path: "/notes", active: true },
  ];

  return (
    <div className="h-full min-h-screen bg-[#f8f9ff] font-[Inter,sans-serif] text-[#0b1c30] antialiased flex overflow-hidden">

      {/* ── Sidebar ── */}
      <nav className="h-screen w-64 fixed left-0 top-0 pt-16 bg-white border-r border-[#c3c6d7]/20 flex flex-col gap-2 p-6 z-40 hidden md:flex shadow-[1px_0_0_0_rgba(0,0,0,0.04)]">
        <div className="mb-6 flex items-center gap-2 px-2">
          <span className="material-symbols-outlined text-[#004ac6] text-3xl">
            hub
          </span>
          <div className="flex flex-col">
            <span className="text-xl font-black text-[#004ac6] leading-tight">
              VendorHub
            </span>
            <span className="text-xs text-[#434655] font-medium tracking-wide">
              Premium Merchant
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-1 w-full">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-left w-full transition-all duration-200 ${
                item.active
                  ? "text-[#004ac6] bg-[#004ac6]/10 font-bold"
                  : "text-[#434655] hover:text-[#0b1c30] hover:bg-[#dce9ff]"
              }`}
            >
              <span
                className="material-symbols-outlined text-[20px]"
                style={
                  item.active
                    ? { fontVariationSettings: "'FILL' 1" }
                    : {}
                }
              >
                {item.icon}
              </span>
              <span className="text-sm font-semibold">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* ── Top Bar ── */}
      <header className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-xl border-b border-[#c3c6d7]/30 shadow-sm md:pl-64 transition-all duration-150">
        <div className="flex justify-between items-center h-16 px-6 max-w-[1280px] mx-auto w-full">
          {/* Mobile Brand */}
          <div className="md:hidden text-xl font-bold text-[#004ac6] flex items-center gap-2">
            <span className="material-symbols-outlined text-3xl">hub</span>
            <span>VendorHub</span>
          </div>

          {/* Search bar */}
          <div className="hidden sm:flex items-center flex-1 max-w-md ml-0 relative group">
            <span className="material-symbols-outlined absolute left-3 text-[#434655] group-focus-within:text-[#004ac6] transition-colors text-[20px]">
              search
            </span>
            <input
              id="notes-search-input"
              className="w-full pl-10 pr-4 py-2 bg-[#eff4ff] border border-[#e2e2e2] rounded-lg text-sm focus:outline-none focus:border-[#004ac6] focus:ring-4 focus:ring-[#004ac6]/10 transition-all placeholder:text-[#737686]"
              placeholder="Search notes..."
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-4 ml-auto">
            <button
              id="add-note-header-btn"
              onClick={() => {
                setEditingNote(null);
                setSaveError("");
                setModalMode("create");
              }}
              className="btn-primary hidden sm:flex items-center gap-1.5 bg-[#004ac6] hover:bg-[#0039a0] text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              New Note
            </button>
          </div>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="flex-1 ml-0 md:ml-64 pt-24 px-4 md:px-8 pb-12 overflow-y-auto w-full">
        <div className="max-w-[1280px] mx-auto flex flex-col gap-8">

          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-[32px] md:text-[40px] font-bold text-[#0b1c30] tracking-tight">
                My Notes
              </h1>
              <p className="text-lg text-[#434655] mt-1">
                {loading
                  ? "Loading your notes..."
                  : `${notes.length} note${notes.length !== 1 ? "s" : ""} saved`}
              </p>
            </div>
            <button
              id="add-note-btn"
              onClick={() => {
                setEditingNote(null);
                setSaveError("");
                setModalMode("create");
              }}
              className="btn-primary flex items-center gap-2 bg-[#004ac6] hover:bg-[#0039a0] text-white px-5 py-3 rounded-xl font-semibold text-sm transition-all duration-200 shadow-md hover:shadow-lg self-start sm:self-auto"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              New Note
            </button>
          </div>

          {/* Mobile search */}
          <div className="flex sm:hidden items-center relative group">
            <span className="material-symbols-outlined absolute left-3 text-[#434655] group-focus-within:text-[#004ac6] transition-colors text-[20px]">
              search
            </span>
            <input
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#e2e2e2] rounded-xl text-sm focus:outline-none focus:border-[#004ac6] focus:ring-4 focus:ring-[#004ac6]/10 transition-all placeholder:text-[#737686] shadow-sm"
              placeholder="Search notes..."
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Global error banner */}
          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-[#ba1a1a] font-medium fade-in">
              <span className="material-symbols-outlined text-[20px]">
                error
              </span>
              <span>{error}</span>
              <button
                onClick={() => setError("")}
                className="ml-auto p-1 rounded-lg hover:bg-red-100 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">
                  close
                </span>
              </button>
            </div>
          )}

          {/* ── Content States ── */}
          {loading ? (
            <SkeletonCards />
          ) : filteredNotes.length === 0 && search ? (
            // No search results
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-center fade-in">
              <div className="w-16 h-16 rounded-full bg-[#eff4ff] flex items-center justify-center">
                <span className="material-symbols-outlined text-[32px] text-[#004ac6]">
                  search_off
                </span>
              </div>
              <p className="text-lg font-bold text-[#0b1c30]">No results found</p>
              <p className="text-sm text-[#434655]">
                No notes match &ldquo;{search}&rdquo;. Try a different search.
              </p>
            </div>
          ) : notes.length === 0 ? (
            // Completely empty
            <EmptyState
              onAdd={() => {
                setEditingNote(null);
                setSaveError("");
                setModalMode("create");
              }}
            />
          ) : (
            // Notes grid
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredNotes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  deleting={deletingId}
                  onEdit={(n) => {
                    setEditingNote(n);
                    setSaveError("");
                    setModalMode("edit");
                  }}
                  onDelete={(id) => setPendingDeleteId(id)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* ── Create / Edit Modal ── */}
      {modalMode && (
        <NoteModal
          mode={modalMode}
          initial={editingNote}
          onClose={() => {
            setModalMode(null);
            setEditingNote(null);
            setSaveError("");
          }}
          onSave={modalMode === "create" ? handleCreate : handleUpdate}
          saving={saving}
          serverError={saveError}
        />
      )}

      {/* ── Delete Confirm Modal ── */}
      {pendingDeleteId && (
        <DeleteConfirmModal
          onConfirm={handleDeleteConfirm}
          onCancel={() => setPendingDeleteId(null)}
          deleting={!!deletingId}
        />
      )}
    </div>
  );
}
