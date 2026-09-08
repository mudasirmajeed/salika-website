import React, { useState, useEffect } from "react";
import { auth, db } from "./firebase";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";

export default function Admin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);

  const [section, setSection] = useState("quotes");
  const [subscribers, setSubscribers] = useState([]);

  // -------------------------
  // QUOTES
  // -------------------------

  const [quotes, setQuotes] = useState([]);
  const [newQuote, setNewQuote] = useState("");
  const [newDate, setNewDate] = useState("2026");

  // -------------------------
  // BOOKS
  // -------------------------

  const [books, setBooks] = useState([]);

  const [newBook, setNewBook] = useState({
    title: "",
    description: "",
    year: "",
    coverUrl: "",
    link: "",
  });

  // -------------------------
  // LOAD DATA
  // -------------------------

  useEffect(() => {
    if (!loggedIn) return;

    const loadData = async () => {
      try {
        // Load quotes
        const quoteSnapshot = await getDocs(collection(db, "quotes"));

        const loadedQuotes = quoteSnapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        }));

        setQuotes(loadedQuotes);

        // Load books
        const bookSnapshot = await getDocs(collection(db, "books"));

        const loadedBooks = bookSnapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        }));

        setBooks(loadedBooks);

const subscriberSnapshot = await getDocs(collection(db, "subscribers"));

const loadedSubscribers = subscriberSnapshot.docs.map((item) => ({
  id: item.id,
  ...item.data(),
}));

setSubscribers(loadedSubscribers);

} catch (err) {
        console.error("Could not load data:", err);
        setError("Could not load data.");
      }
    };

    loadData();
  }, [loggedIn]);

  // -------------------------
  // LOGIN
  // -------------------------

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      setLoggedIn(true);
    } catch (err) {
      console.error("Firebase login error:", err);
      setError(err.code || err.message || "Login failed.");
    }

    setLoading(false);
  };

  // -------------------------
  // LOGOUT
  // -------------------------

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setLoggedIn(false);
    } catch (err) {
      console.error("Logout error:", err);
      setError("Could not log out.");
    }
  };

  // -------------------------
  // ADD QUOTE
  // -------------------------

  const handleAddQuote = async (e) => {
    e.preventDefault();

    if (!newQuote.trim()) return;

    try {
      const newDoc = await addDoc(collection(db, "quotes"), {
        text: newQuote.trim(),
        date: newDate.trim(),
        createdAt: serverTimestamp(),
      });

      setQuotes((prev) => [
        ...prev,
        {
          id: newDoc.id,
          text: newQuote.trim(),
          date: newDate.trim(),
        },
      ]);

      setNewQuote("");
      setNewDate("2026");
    } catch (err) {
      console.error("Could not add quote:", err);
      setError("Could not add quote.");
    }
  };

  // -------------------------
  // EDIT QUOTE
  // -------------------------

  const handleEditQuote = async (id, currentText, currentDate) => {
    const newText = window.prompt("Edit quote:", currentText);

    if (newText === null || !newText.trim()) return;

    const newYear = window.prompt("Edit year:", currentDate);

    if (newYear === null || !newYear.trim()) return;

    try {
      await updateDoc(doc(db, "quotes", id), {
        text: newText.trim(),
        date: newYear.trim(),
      });

      setQuotes((prev) =>
        prev.map((quote) =>
          quote.id === id
            ? {
                ...quote,
                text: newText.trim(),
                date: newYear.trim(),
              }
            : quote
        )
      );
    } catch (err) {
      console.error("Could not edit quote:", err);
      setError("Could not edit quote.");
    }
  };

  // -------------------------
  // DELETE QUOTE
  // -------------------------

  const handleDeleteQuote = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this quote?"
    );

    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "quotes", id));

      setQuotes((prev) =>
        prev.filter((quote) => quote.id !== id)
      );
    } catch (err) {
      console.error("Could not delete quote:", err);
      setError("Could not delete quote.");
    }
  };

  // -------------------------
  // ADD BOOK
  // -------------------------

  const handleAddBook = async (e) => {
    e.preventDefault();

    if (!newBook.title.trim()) {
      setError("Please enter a book title.");
      return;
    }

    try {
      const bookData = {
        title: newBook.title.trim(),
        description: newBook.description.trim(),
        year: newBook.year.trim(),
        coverUrl: newBook.coverUrl.trim(),
        link: newBook.link.trim(),
        createdAt: serverTimestamp(),
      };

      const newDoc = await addDoc(
        collection(db, "books"),
        bookData
      );

      setBooks((prev) => [
        ...prev,
        {
          id: newDoc.id,
          ...bookData,
        },
      ]);

      setNewBook({
        title: "",
        description: "",
        year: "",
        coverUrl: "",
        link: "",
      });

      setError("");
    } catch (err) {
      console.error("Could not add book:", err);
      setError("Could not add book.");
    }
  };

  // -------------------------
  // EDIT BOOK
  // -------------------------

  const handleEditBook = async (book) => {
    const title = window.prompt(
      "Book title:",
      book.title || ""
    );

    if (title === null || !title.trim()) return;

    const description = window.prompt(
      "Description:",
      book.description || ""
    );

    if (description === null) return;

    const year = window.prompt(
      "Publication year:",
      book.year || ""
    );

    if (year === null) return;

    const coverUrl = window.prompt(
      "Cover image URL:",
      book.coverUrl || ""
    );

    if (coverUrl === null) return;

    const link = window.prompt(
      "Book/read/purchase link:",
      book.link || ""
    );

    if (link === null) return;

    try {
      await updateDoc(doc(db, "books", book.id), {
        title: title.trim(),
        description: description.trim(),
        year: year.trim(),
        coverUrl: coverUrl.trim(),
        link: link.trim(),
      });

      setBooks((prev) =>
        prev.map((item) =>
          item.id === book.id
            ? {
                ...item,
                title: title.trim(),
                description: description.trim(),
                year: year.trim(),
                coverUrl: coverUrl.trim(),
                link: link.trim(),
              }
            : item
        )
      );
    } catch (err) {
      console.error("Could not edit book:", err);
      setError("Could not edit book.");
    }
  };

  // -------------------------
  // DELETE BOOK
  // -------------------------

  const handleDeleteBook = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this book?"
    );

    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "books", id));

      setBooks((prev) =>
        prev.filter((book) => book.id !== id)
      );
    } catch (err) {
      console.error("Could not delete book:", err);
      setError("Could not delete book.");
    }
  };

  // -------------------------
  // LOGGED-IN ADMIN
  // -------------------------

  if (loggedIn) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#080d19",
          color: "#c9a96e",
          padding: "30px",
          fontFamily: "Georgia, serif",
        }}
      >
        <div
          style={{
            maxWidth: "1000px",
            margin: "0 auto",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "15px",
            }}
          >
            <div>
              <h1 style={{ marginBottom: "5px" }}>
                Author's Desk
              </h1>

              <p style={{ color: "#aaa" }}>
                Private administrator area
              </p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              style={{
                padding: "10px 20px",
                background: "transparent",
                color: "#c9a96e",
                border: "1px solid #c9a96e",
                borderRadius: "5px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              LOGOUT
            </button>
          </div>

          {/* NAVIGATION */}

          <div
            style={{
              display: "flex",
              gap: "10px",
              marginTop: "30px",
              flexWrap: "wrap",
            }}
          >
            <button
              type="button"
              onClick={() => setSection("quotes")}
              style={navButtonStyle(section === "quotes")}
            >
              💬 QUOTES
            </button>

            <button
              type="button"
              onClick={() => setSection("books")}
              style={navButtonStyle(section === "books")}
            >
              📚 BOOKS
            </button>
          </div>

          {error && (
            <p
              style={{
                color: "#d88",
                marginTop: "20px",
              }}
            >
              {error}
            </p>
          )}

          {/* ================= QUOTES ================= */}

          {section === "quotes" && (
            <div style={{ marginTop: "30px" }}>
              <h2>Add New Quote</h2>

              <form onSubmit={handleAddQuote}>
                <textarea
                  value={newQuote}
                  onChange={(e) =>
                    setNewQuote(e.target.value)
                  }
                  placeholder="Write a new quote..."
                  rows="5"
                  style={inputStyle}
                />

                <input
                  value={newDate}
                  onChange={(e) =>
                    setNewDate(e.target.value)
                  }
                  placeholder="Year"
                  style={inputStyle}
                />

                <button
                  type="submit"
                  style={goldButtonStyle}
                >
                  ADD QUOTE
                </button>
              </form>

              <h2 style={{ marginTop: "45px" }}>
                Saved Quotes
              </h2>

              {quotes.length === 0 ? (
                <p style={{ color: "#aaa" }}>
                  No quotes added yet.
                </p>
              ) : (
                quotes.map((quote) => (
                  <div key={quote.id} style={cardStyle}>
                    <p
                      style={{
                        fontSize: "18px",
                        lineHeight: "1.6",
                      }}
                    >
                      {quote.text}
                    </p>

                    <small>{quote.date}</small>

                    <div style={{ marginTop: "15px" }}>
                      <button
                        type="button"
                        onClick={() =>
                          handleEditQuote(
                            quote.id,
                            quote.text,
                            quote.date
                          )
                        }
                        style={editButtonStyle}
                      >
                        EDIT
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleDeleteQuote(quote.id)
                        }
                        style={deleteButtonStyle}
                      >
                        DELETE
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ================= BOOKS ================= */}

          {section === "books" && (
            <div style={{ marginTop: "30px" }}>
              <h2>Add New Book</h2>

              <form onSubmit={handleAddBook}>
                <input
                  value={newBook.title}
                  onChange={(e) =>
                    setNewBook({
                      ...newBook,
                      title: e.target.value,
                    })
                  }
                  placeholder="Book title"
                  style={inputStyle}
                />

                <textarea
                  value={newBook.description}
                  onChange={(e) =>
                    setNewBook({
                      ...newBook,
                      description: e.target.value,
                    })
                  }
                  placeholder="Book description"
                  rows="5"
                  style={inputStyle}
                />

                <input
                  value={newBook.year}
                  onChange={(e) =>
                    setNewBook({
                      ...newBook,
                      year: e.target.value,
                    })
                  }
                  placeholder="Publication year"
                  style={inputStyle}
                />

                <input
                  value={newBook.coverUrl}
                  onChange={(e) =>
                    setNewBook({
                      ...newBook,
                      coverUrl: e.target.value,
                    })
                  }
                  placeholder="Cover image URL"
                  style={inputStyle}
                />

                <input
                  value={newBook.link}
                  onChange={(e) =>
                    setNewBook({
                      ...newBook,
                      link: e.target.value,
                    })
                  }
                  placeholder="Book / read / purchase link"
                  style={inputStyle}
                />

                <button
                  type="submit"
                  style={goldButtonStyle}
                >
                  ADD BOOK
                </button>
              </form>

              <h2 style={{ marginTop: "45px" }}>
                Published Books
              </h2>

              {books.length === 0 ? (
                <p style={{ color: "#aaa" }}>
                  No books added yet.
                </p>
              ) : (
                books.map((book) => (
                  <div key={book.id} style={cardStyle}>
                    {book.coverUrl && (
                      <img
                        src={book.coverUrl}
                        alt={book.title}
                        style={{
                          width: "120px",
                          height: "170px",
                          objectFit: "cover",
                          borderRadius: "4px",
                          marginBottom: "15px",
                        }}
                      />
                    )}

                    <h3>{book.title}</h3>

                    {book.year && (
                      <small>{book.year}</small>
                    )}

                    {book.description && (
                      <p
                        style={{
                          color: "#ccc",
                          lineHeight: "1.6",
                        }}
                      >
                        {book.description}
                      </p>
                    )}

                    {book.link && (
                      <p>
                        <a
                          href={book.link}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            color: "#c9a96e",
                          }}
                        >
                          View Book Link →
                        </a>
                      </p>
                    )}

                    <div style={{ marginTop: "15px" }}>
                      <button
                        type="button"
                        onClick={() =>
                          handleEditBook(book)
                        }
                        style={editButtonStyle}
                      >
                        EDIT
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleDeleteBook(book.id)
                        }
                        style={deleteButtonStyle}
                      >
                        DELETE
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // -------------------------
  // LOGIN SCREEN
  // -------------------------

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#080d19",
        color: "#c9a96e",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "30px",
        fontFamily: "Georgia, serif",
      }}
    >
      <form
        onSubmit={handleLogin}
        style={{
          width: "100%",
          maxWidth: "420px",
          padding: "40px",
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(201,169,110,0.25)",
          borderRadius: "8px",
        }}
      >
        <div
          style={{
            textAlign: "center",
            marginBottom: "30px",
          }}
        >
          <div
            style={{
              fontSize: "42px",
              marginBottom: "10px",
            }}
          >
            🔐
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: "28px",
              fontWeight: "normal",
            }}
          >
            Author's Desk
          </h1>

          <p
            style={{
              color: "#a89a7a",
              lineHeight: 1.6,
            }}
          >
            Private administrator access
          </p>
        </div>

        <input
          type="email"
          placeholder="Admin Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
          style={inputStyle}
        />

        {error && (
          <p
            style={{
              color: "#d88",
              fontSize: "14px",
            }}
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          style={goldButtonStyle}
        >
          {loading
            ? "SIGNING IN..."
            : "ENTER AUTHOR'S DESK"}
        </button>
      </form>
    </div>
  );
}

// -------------------------
// STYLES
// -------------------------

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "14px",
  marginTop: "10px",
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(201,169,110,0.25)",
  borderRadius: "4px",
  color: "#fff",
  fontSize: "15px",
};

const goldButtonStyle = {
  width: "100%",
  padding: "15px",
  marginTop: "15px",
  border: "none",
  borderRadius: "4px",
  background: "#c9a96e",
  color: "#080d19",
  fontWeight: "bold",
  letterSpacing: "1px",
  cursor: "pointer",
};

const editButtonStyle = {
  padding: "8px 16px",
  background: "#c9a96e",
  color: "#080d19",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
  fontWeight: "bold",
  marginRight: "8px",
};

const deleteButtonStyle = {
  padding: "8px 16px",
  background: "#8b3a3a",
  color: "#fff",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
  fontWeight: "bold",
};

const cardStyle = {
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(201,169,110,0.25)",
  padding: "20px",
  marginTop: "15px",
  borderRadius: "5px",
  color: "#eee",
};

function navButtonStyle(active) {
  return {
    padding: "12px 20px",
    background: active
      ? "#c9a96e"
      : "transparent",
    color: active ? "#080d19" : "#c9a96e",
    border: "1px solid #c9a96e",
    borderRadius: "5px",
    cursor: "pointer",
    fontWeight: "bold",
  };
}