import React, { useState } from "react";
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

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
      return;
    }
    try {
      setDeleting(true);
      setError("");
      await onDelete(note.id);
    } catch (error) {
      console.error("Error deleting note:", error);
      setError("Failed to delete note. Please try again.");
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(note);
    }
  };

  if (!note) {
    return <div>No note data available</div>;
  }

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
                  ? "bg-red-400 text-red-600"
                  : "text-gray-400 hover:text-red-500 hover:bg-red-50"
              }`}
              disabled={deleting}
              onClick={handleDelete}
              title="Delete note"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="mb-2">
          {note.content || <span className="text-gray-400">No content</span>}
        </div>
        <div className="text-sm text-gray-500">{formDate(note.createdAt)}</div>
        {error && <div className="mt-2 text-sm text-red-600">{error}</div>}
      </div>
    </div>
  );
}

export default NoteCard;
