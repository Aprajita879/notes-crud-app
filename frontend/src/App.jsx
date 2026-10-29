
import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://127.0.0.1:8000/notes";

function App() {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchNotes() {
    try {
      setError("");
      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Could not load notes.");
      }

      const data = await response.json();
      setNotes(data);
    } catch (err) {
      setError("Backend se connect nahi ho pa raha. Check karo ki FastAPI chal raha hai.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchNotes();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!title.trim()) {
      alert("Please enter a title.");
      return;
    }

    const noteData = {
      title: title.trim(),
      content: content.trim(),
    };

    try {
      setError("");

      const response = await fetch(
        editingId ? `${API_URL}/${editingId}` : API_URL,
        {
          method: editingId ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(noteData),
        }
      );

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.detail || "Could not save note.");
      }

      setTitle("");
      setContent("");
      setEditingId(null);
      await fetchNotes();
    } catch (err) {
      setError(err.message || "Something went wrong.");
    }
  }

  function startEdit(note) {
    setEditingId(note.id);
    setTitle(note.title);
    setContent(note.content);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditingId(null);
    setTitle("");
    setContent("");
  }

  async function deleteNote(id) {
    if (!window.confirm("Are you sure you want to delete this note?")) {
      return;
    }

    try {
      setError("");
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Could not delete note.");
      }

      await fetchNotes();
    } catch (err) {
      setError(err.message || "Something went wrong.");
    }
  }

  return (
    <main className="app">
      <header className="header">
        <p className="eyebrow">YOUR PERSONAL SPACE</p>
        <h1>My Notes</h1>
        <p>Write your thoughts and keep everything organized.</p>
      </header>

      {error && <p role="alert" className="error-message">{error}</p>}

      <section className="form-card">
        <h2>{editingId ? "Edit your note" : "Create a new note"}</h2>

        <form onSubmit={handleSubmit}>
          <label htmlFor="title">Title</label>
          <input
            id="title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Enter note title"
            required
          />

          <label htmlFor="content">Content</label>
          <textarea
            id="content"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Write your note here..."
            rows="4"
          />

          <button type="submit">
            {editingId ? "Update Note" : "+ Add Note"}
          </button>

          {editingId && (
            <button type="button" onClick={cancelEdit}>
              Cancel
            </button>
          )}
        </form>
      </section>

      <section className="notes-section">
        <h2>All Notes ({notes.length})</h2>

        {loading ? (
          <p>Loading notes...</p>
        ) : notes.length === 0 ? (
          <p className="empty">No notes yet. Create your first note!</p>
        ) : (
          <div className="notes-grid">
            {notes.map((note) => (
              <article className="note-card" key={note.id}>
                <h3>{note.title}</h3>
                <p>{note.content}</p>

                <button onClick={() => startEdit(note)}>
                  Edit
                </button>

                <button
                  className="delete-button"
                  onClick={() => deleteNote(note.id)}
                >
                  Delete
                </button>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default App;
