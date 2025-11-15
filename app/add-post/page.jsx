"use client";
import { useState } from "react";

export default function AddPost() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("Publishing...");

    try {
      const res = await fetch("/api/create-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }),
      });

      const text = await res.text();
      console.log("RAW RESPONSE:", text);

      let data;
      try {
        data = JSON.parse(text);
      } catch (err) {
        setMessage("❌ Server returned invalid JSON");
        return;
      }

      if (!res.ok) {
        setMessage(`❌ Error: ${data.error}`);
        return;
      }

      // ✅ SUCCESS → redirect to posts page
      window.location.href = "/posts";
    } catch (error) {
      setMessage("❌ Network Error: " + error.message);
    }
  };

  return (
    <main className="p-10">
      <h1 className="text-2xl mb-4">Add Post (via GraphQL)</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Post title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="block mb-3 p-2 border rounded w-full"
        />

        <textarea
          placeholder="Post content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="block mb-3 p-2 border rounded w-full h-40"
        />

        <button
          type="submit"
          className="bg-blue-600 text-white py-2 px-4 rounded"
        >
          Publish
        </button>
      </form>

      {message && <p className="mt-4">{message}</p>}
    </main>
  );
}
