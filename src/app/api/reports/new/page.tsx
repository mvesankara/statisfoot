"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewReport() {
  const router = useRouter();
  const [playerId, setPlayerId] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ playerId, title, content }),
    });
    router.push("/reports");
  }

  return (
    <form onSubmit={handleSubmit} className="p-8 max-w-xl mx-auto space-y-4">
      <input value={playerId} onChange={e => setPlayerId(e.target.value)} placeholder="Player ID" className="input" />
      <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" className="input" />
      <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Report details" className="textarea" />
      <button type="submit" className="btn-primary">Save Draft</button>
    </form>
  );
}
