"use client";

import { useEffect, useState } from "react";

export default function Home() {

  const [books, setBooks] = useState([]);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [dbError, setDbError] = useState<string>("");
  const [apiError, setApiError] = useState<string>("");

  async function fetchBooks() {
    setApiError("");
    const res = await fetch("/api/books");

    if (!res.ok) {
      setApiError(`API error (${res.status})`);
      return;
    }

    const data = await res.json().catch(() => null);
    if (!data) {
      setApiError("API error (invalid JSON)");
      return;
    }

    setBooks(data.books || []);
    setDbError(data.dbError || "");
  }

  async function addBook() {
    setApiError("");
    const res = await fetch("/api/books", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        author,
        genre: "General",
        condition: "Good",
        ownerId: "demoUser"
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      setApiError(text || `Failed to add book (${res.status})`);
      return;
    }

    setTitle("");
    setAuthor("");

    fetchBooks();
  }

  useEffect(() => {
    fetchBooks();
  }, []);
  async function requestBook(id: string) {
    const res = await fetch("/api/request", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        bookId: id,
        user: "demoUser",
      }),
    });
  
    const data = await res.json().catch(() => null);
  
    if (!res.ok) {
      alert(data?.error || "Request failed");
      return;
    }
  
    alert("Book requested!");
    fetchBooks(); // refresh UI
  }

  return (
    <div style={{padding:"40px"}}>

      <h1>ShelfShare 📚</h1>

      {!!apiError && (
        <div style={{ margin: "12px 0", color: "crimson" }}>
          {apiError}
        </div>
      )}

      {!!dbError && (
        <div style={{ margin: "12px 0", color: "#b45309" }}>
          Database connection issue: {dbError}
        </div>
      )}

      <h2>Add Book</h2>

      <input
        placeholder="Book title"
        value={title}
        onChange={(e)=>setTitle(e.target.value)}
      />

      <input
        placeholder="Author"
        value={author}
        onChange={(e)=>setAuthor(e.target.value)}
      />

      <button onClick={addBook}>Add Book</button>

      <h2>Books in Database</h2>

      {books.map((b: any) => (
  <div
    key={b._id}
    style={{
      border: "1px solid black",
      padding: "10px",
      margin: "10px 0",
    }}
  >
    <h3>{b.title}</h3>
    <p>Author: {b.author}</p>
    <p>Status: {(b.available ?? true) ? "Available" : "Requested"}</p>

    {(b.available ?? true) && (
      <button onClick={() => requestBook(b._id)}>
        Request Book
      </button>
    )}
  </div>
))}

    </div>
  );
}