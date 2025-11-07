import NoteCard from "../components/NoteCard";
import NoteForm from "../components/NoteForm";
import React, { useState, useEffect } from "react";
import { db } from "../../firebaseConfig";
import { useAuth } from "../context/AuthContext";
import { StickyNote, FileWarning } from "lucide-react";
import {
  collection,
  onSnapshot,
  query,
  where,
  doc,
  deleteDoc,
} from "firebase/firestore";

function Dashboard() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState(null); // { type: 'success' | 'error' | 'info', message: string }
  const [selectedNote, setSelectedNote] = useState(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    setLoading(true);
    const notesQuery = query(
      collection(db, "notes"),
      where("userId", "==", currentUser.uid)
    );
    const unsubscribe = onSnapshot(
      notesQuery,
      (querySnapshot) => {
        const notesData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        notesData.sort((a, b) => {
          const timeA = a.createdAt?.toMillis() || 0;
          const timeB = b.createdAt?.toMillis() || 0;
          return timeB - timeA;
        });

        setNotes(notesData);
        setLoading(false);
      },
      (err) => {
        console.error("Error in fetching notes", err);
        setError("Failed to load notes. Please try refreshing the page");
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [currentUser.uid]);

  const handleEdit = (note) => {
    setSelectedNote(note);
  };

  const handleCancel = () => {
    setSelectedNote(null);
  };

  const handleNoteUpdated = (action) => {
    setSelectedNote(null);
    if (action === "create") {
      setNotification({
        type: "success",
        message: "Note created successfully!",
      });
    } else {
      setNotification({
        type: "success",
        message: "Note updated successfully!",
      });
    }
    setTimeout(() => setNotification(null), 3000);
  };

  const handleDelete = async (noteId) => {
    try {
      const noteRef = doc(db, "notes", String(noteId));
      await deleteDoc(noteRef);
      // The notes list will automatically update due to the Firestore listener
      // No success notification for delete; only updates show notifications
    } catch (error) {
      console.error("Error deleting note:", error);
      const permissionDenied =
        error?.code === "permission-denied" ||
        /Missing or insufficient permissions/i.test(error?.message || "");
      const message = permissionDenied
        ? "Deletion failed: You do not have permission to delete this note."
        : "Deletion failed: Please try again.";
      setNotification({ type: "error", message });
      setTimeout(() => setNotification(null), 4000);
    }
  };

  return (
    <>
      <div>
        {notification && (
          <div
            className={`${
              notification.type === "success"
                ? "bg-green-50 text-green-800 border-green-200"
                : notification.type === "error"
                ? "bg-red-50 text-red-800 border-red-200"
                : "bg-blue-50 text-blue-800 border-blue-200"
            } border p-3 rounded-md mb-4 flex items-start justify-between`}
          >
            <div className="pr-4">{notification.message}</div>
            <button
              onClick={() => setNotification(null)}
              className="text-sm opacity-70 hover:opacity-100"
            >
              Dismiss
            </button>
          </div>
        )}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">My Notes</h1>
          <p className="text-gray-600">Create and manage your personal notes</p>
        </div>

        <NoteForm
          noteToEdit={selectedNote}
          onNoteUpdated={handleNoteUpdated}
          onCancel={handleCancel}
        />

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-md mb-6 flex items-center">
            <FileWarning className="h-5 w-5 mr-2" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-pulse text-indigo-600">
              Loading notes...
            </div>
          </div>
        ) : notes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {notes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-100">
            <StickyNote className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              No notes yet
            </h3>
            <p className="text-gray-600 mb-4">
              Create your first note to get started
            </p>
          </div>
        )}
      </div>
    </>
  );
}

export default Dashboard;
