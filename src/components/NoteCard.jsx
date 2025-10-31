import React, { useState, useMemo } from "react";
import { Trash2, Pencil } from "lucide-react";

function NoteCard({ note, onEdit, onDelete }) {
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState("");

  const formDate = (timestamp) => {
    if (!timestamp) return "Just Now";

    try {
      const date = timestamp.toDate();
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "numeric",
      }).format(date);
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid date";
    }
  };

  const handleDeleteClick = () => {
    setConfirmDelete(true);
  };

  const confirmDeletion = async () => {
    try {
      setDeleting(true);
      setError("");
      await onDelete(note.id);
      setDeleting(false);
      setConfirmDelete(false);
    } catch (error) {
      console.error("Error deleting note:", error);
      setError("Failed to delete note. Please try again.");
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  const cancelDeletion = () => {
    setConfirmDelete(false);
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(note);
    }
  };

  if (!note) {
    return <div>No note data available</div>;
  }

  const contentItems = useMemo(() => {
    const raw = (note.content || "").trim();
    if (!raw) return [];
    // Split by newlines and filter out empty lines
    // Remove any leading numbering patterns (e.g., "1. ", "2. ", etc.)
    return raw
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => s.replace(/^\d+\.\s*/, "")); // Remove leading number pattern like "1. "
  }, [note.content]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-200">
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-medium text-gray-900 line-clamp-1">
            {note.title}
          </h3>
          <div className="flex items-center gap-2">
            <button
              className="text-sm flex items-center justify-center p-1 rounded-full transition-colors text-gray-400 hover:text-blue-500 hover:bg-blue-50"
              onClick={handleEdit}
              title="Edit note"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              className={`text-sm flex items-center justify-center p-1 rounded-full transition-colors ${
                confirmDelete
                  ? "text-red-600 bg-red-50"
                  : "text-gray-400 hover:text-red-500 hover:bg-red-50"
              }`}
              disabled={deleting}
              onClick={handleDeleteClick}
              title="Delete note"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="mb-2">
          {contentItems.length > 0 ? (
            <ol className="list-decimal pl-6 space-y-1.5 text-gray-700">
              {contentItems.map((item, idx) => (
                <li key={idx} className="leading-relaxed">
                  {item}
                </li>
              ))}
            </ol>
          ) : (
            <span className="text-gray-400">No content</span>
          )}
        </div>
        {confirmDelete && (
          <div className="mt-3 border border-red-200 bg-red-50 text-red-800 rounded-md p-3">
            <div className="text-sm mb-2">
              Are you sure you want to delete "{note.title || "this note"}"?
              This action cannot be undone.
            </div>
            <div className="flex gap-2">
              <button
                onClick={confirmDeletion}
                disabled={deleting}
                className="px-3 py-1.5 rounded-md bg-red-600 text-white text-sm hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Yes, delete"}
              </button>
              <button
                onClick={cancelDeletion}
                disabled={deleting}
                className="px-3 py-1.5 rounded-md border text-sm text-gray-700 hover:bg-gray-50"
              >
                No, keep it
              </button>
            </div>
          </div>
        )}
        <div className="text-sm text-gray-500">{formDate(note.createdAt)}</div>
        {/* Inline error hidden to avoid duplicate notifications; errors are shown globally */}
      </div>
    </div>
  );
}

export default NoteCard;
