"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function EditPost() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!id) return;

    async function fetchPost() {
      setMessage("Loading post...");

      try {
        const res = await fetch(`/api/get-posts?id=${id}`);
        const text = await res.text();

        console.log("RAW GET-POST RESPONSE:", text);

        let data;
        try {
          data = JSON.parse(text);
        } catch (e) {
          setMessage("❌ Invalid server response");
          return;
        }

        if (!res.ok || !data.post) {
          setMessage("❌ Post not found");
          return;
        }

        setPost(data.post);
        setTitle(data.post.title);
        setContent(data.post.content);
        setMessage("");
      } catch (error) {
        console.error("Fetch post error:", error);
        setMessage("⚠️ Could not load post");
      }
    }

    fetchPost();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("Updating...");

    try {
      const res = await fetch("/api/update-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: post.databaseId, // numeric ID
          title,
          content,
        }),
      });

      const text = await res.text();
      console.log("RAW UPDATE RESPONSE:", text);

      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        setMessage("❌ Invalid server JSON");
        return;
      }

      if (!res.ok) {
        setMessage(`❌ Error: ${data.error}`);
        return;
      }

      // SUCCESS → redirect
      window.location.href = "/posts";
    } catch (error) {
      console.error("Update error:", error);
      setMessage("⚠️ Update failed");
    }
  };

  if (!post) return <p className="p-10">Loading...</p>;

  return (
    <main className="p-10">
      <h1 className="text-2xl mb-4">Edit Post</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="block w-full p-2 mb-3 border rounded"
        />

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="block w-full p-2 mb-3 border rounded h-40"
        />

        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Update Post
        </button>
      </form>

      {message && <p className="mt-4">{message}</p>}
    </main>
  );
}
