"use client";
import { useState, useEffect } from "react";

export default function PostsPage() {
  const [posts, setPosts] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function fetchPosts() {
      const res = await fetch("/api/get-posts");
      const data = await res.json();
      setPosts(data.posts || []);
    }
    fetchPosts();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this post?")) return;

    setMessage("Deleting...");

    const res = await fetch("/api/delete-post", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    const data = await res.json();

    if (res.ok) {
      setPosts(posts.filter((p) => p.databaseId !== id));
      setMessage("✅ Post deleted successfully");
    } else {
      setMessage(`❌ ${data.error}`);
    }
  };

  return (
    <main className="p-10">
      <h1 className="text-2xl font-semibold mb-4">WordPress Posts</h1>

      {/* ADD BUTTON */}
      <a
        href="/add-post"
        className="bg-green-600 text-white px-4 py-2 rounded mb-6 inline-block"
      >
        ➕ Add New Post
      </a>

      {message && <p className="mb-4 text-blue-500">{message}</p>}

      {posts.length === 0 && <p>No posts found.</p>}

      <ul className="space-y-3">
        {posts.map((post) => (
          <li
            key={post.id}
            className="border p-4 rounded flex justify-between items-center"
          >
            <div>
              <h2
                dangerouslySetInnerHTML={{ __html: post.title }}
                className="font-medium"
              />
            </div>

            <div className="space-x-2">
              <a
                href={`/edit-post/${encodeURIComponent(post.id)}`}
                className="bg-blue-600 text-white px-3 py-1 rounded"
              >
                Edit
              </a>

              <button
                onClick={() => handleDelete(post.databaseId)}
                className="bg-red-600 text-white px-3 py-1 rounded"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
