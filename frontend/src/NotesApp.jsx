
import { useState } from "react";

function NotesApp() {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  function addNote(event) {
    event.preventDefault();

    if (!title.trim() || !content.trim()) {
      alert("Please enter both title and content.");
      return;
    }

    const newNote = {
      id: Date.now(),
      title: title,
      content: content,
    };

    setNotes((previousNotes) => [...previousNotes, newNote]);
    setTitle("");
    setContent("");
  }

  function deleteNote(id) {
    setNotes((previousNotes) =>
      previousNotes.filter((note) => note.id !== id)
    );
  }

  return (
    <main style={{ maxWidth: "700px", margin: "40px auto", padding: "20px", fontFamily: "Arial" }}>
      <h1>My Notes</h1>
      <p>Create and manage your notes.</p>

      <form onSubmit={addNote}>
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Note title"
          style={{ display: "block", width: "100%", padding: "12px", marginBottom: "12px", boxSizing: "border-box" }}
        />

        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="Write your note..."
          rows="4"
          style={{ display: "block", width: "100%", padding: "12px", marginBottom: "12px", boxSizing: "border-box" }}
        />

        <button type="submit">Add Note</button>
      </form>

      <h2>All Notes ({notes.length})</h2>

      {notes.length === 0 && <p>No notes yet. Add your first note!</p>}

      {notes.map((note) => (
        <article key={note.id} style={{ border: "1px solid #ddd", padding: "16px", marginTop: "12px", borderRadius: "8px" }}>
          <h3>{note.title}</h3>
          <p>{note.content}</p>
          <button onClick={() => deleteNote(note.id)}>Delete</button>
        </article>
      ))}
    </main>
  );
}

export default NotesApp;
