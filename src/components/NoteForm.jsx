import React, { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { useAuth } from "../context/AuthContext";
import { PenLine } from "lucide-react";

function NoteForm({ noteToEdit, onNoteUpdated, onCancel }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const { currentUser } = useAuth();

  useEffect(() => {
    if (noteToEdit) {
      setTitle(noteToEdit.title || "");
      setContent(noteToEdit.content || "");
    } else {
      setTitle("");
      setContent("");
    }
  }, [noteToEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    try {
      setLoading(true);

      if (noteToEdit) {
        // Update existing note
        const noteRef = doc(db, "notes", noteToEdit.id);
        await updateDoc(noteRef, {
          title: title.trim(),
          content: content.trim(),
          updatedAt: serverTimestamp(),
        });
        setSuccess(true);
        setSuccessMessage("Note updated successfully!");
        if (onNoteUpdated) {
          onNoteUpdated("update"); // 👈 Pass the update action
        }
      } else {
        // Create new note
        await addDoc(collection(db, "notes"), {
          title: title.trim(),
          content: content.trim(),
          userId: currentUser.uid,
          createdAt: serverTimestamp(),
        });
        setTitle("");
        setContent("");
        setSuccess(true);
        setSuccessMessage("Note created successfully!");
        if (onNoteUpdated) {
          onNoteUpdated("create"); // 👈 Pass the create action
        }
        if (onCancel) onCancel();
      }

      setTimeout(() => {
        setSuccess(false);
        setSuccessMessage("");
        if (!noteToEdit && onNoteUpdated) {
          onNoteUpdated();
        }
      }, 3000);
    } catch (error) {
      setError(
        "Failed to " +
          (noteToEdit ? "update" : "create") +
          " note: " +
          error.message
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <PenLine className="h-5 w-5 text-indigo-600 mr-2" />
          <h2 className="text-xl font-semibold text-gray-800">
            {noteToEdit ? "Edit Note" : "Add a new note"}
          </h2>
        </div>
        {noteToEdit && onCancel && (
          <button
            onClick={onCancel}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Cancel
          </button>
        )}
      </div>
      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4 text-sm">
          {error}
        </div>
      )}
      {/* success banner removed to avoid duplicate notifications; updates handled in Dashboard */}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            placeholder="Note title"
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            maxLength={100}
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="content"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Content
          </label>
          <textarea
            id="content"
            value={content}
            placeholder="Write your notes here"
            onChange={(e) => setContent(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            rows={4}
          />
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? noteToEdit
                ? "Updating..."
                : "Creating..."
              : noteToEdit
              ? "Update Note"
              : "Create Note"}
          </button>
          {noteToEdit && onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default NoteForm;
