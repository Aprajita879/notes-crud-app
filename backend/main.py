from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import sqlite3
from pathlib import Path

app = FastAPI(title="Notes CRUD App")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
DB_PATH = Path(__file__).resolve().parent / "notes.db"


class NoteCreate(BaseModel):
    title: str
    content: str = ""


class NoteUpdate(BaseModel):
    title: str
    content: str = ""


def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def create_table():
    conn = get_db_connection()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS notes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            content TEXT NOT NULL DEFAULT '',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.commit()
    conn.close()


create_table()


@app.get("/")
def home():
    return {"message": "Notes API is running!"}


@app.get("/notes")
def get_notes():
    conn = get_db_connection()
    rows = conn.execute(
        "SELECT * FROM notes ORDER BY id DESC"
    ).fetchall()
    conn.close()
    return [dict(row) for row in rows]


@app.post("/notes", status_code=201)
def create_note(note: NoteCreate):
    title = note.title.strip()

    if not title:
        raise HTTPException(
            status_code=400,
            detail="Title cannot be empty"
        )

    conn = get_db_connection()
    cursor = conn.execute(
        "INSERT INTO notes (title, content) VALUES (?, ?)",
        (title, note.content)
    )
    conn.commit()

    row = conn.execute(
        "SELECT * FROM notes WHERE id = ?",
        (cursor.lastrowid,)
    ).fetchone()

    conn.close()
    return dict(row)


@app.put("/notes/{note_id}")
def update_note(note_id: int, note: NoteUpdate):
    title = note.title.strip()

    if not title:
        raise HTTPException(
            status_code=400,
            detail="Title cannot be empty"
        )

    conn = get_db_connection()

    existing = conn.execute(
        "SELECT id FROM notes WHERE id = ?",
        (note_id,)
    ).fetchone()

    if existing is None:
        conn.close()
        raise HTTPException(
            status_code=404,
            detail="Note not found"
        )

    conn.execute(
        "UPDATE notes SET title = ?, content = ? WHERE id = ?",
        (title, note.content, note_id)
    )
    conn.commit()

    row = conn.execute(
        "SELECT * FROM notes WHERE id = ?",
        (note_id,)
    ).fetchone()

    conn.close()
    return dict(row)


@app.delete("/notes/{note_id}")
def delete_note(note_id: int):
    conn = get_db_connection()

    cursor = conn.execute(
        "DELETE FROM notes WHERE id = ?",
        (note_id,)
    )
    conn.commit()
    deleted = cursor.rowcount
    conn.close()

    if deleted == 0:
        raise HTTPException(
            status_code=404,
            detail="Note not found"
        )

    return {"message": "Note deleted successfully"}
