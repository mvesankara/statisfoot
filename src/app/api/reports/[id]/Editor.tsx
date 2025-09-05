"use client";

import { useState } from "react";

interface Props {
  id: string;
  initialTitle: string;
  initialContent: string;
}

export default function Editor({ id, initialTitle, initialContent }: Props) {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);

  async function save() {
    await fetch(`/api/reports/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content }),
    });
  }

  async function submit() {
    await fetch(`/api/reports/${id}/submit`, {
      method: "POST",
    });
  }

  return (
    <div className="mt-6 space-y-2">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="input"
      />
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="textarea"
      />
      <div className="space-x-2">
        <button onClick={save} className="btn-primary">Save</button>
        <button onClick={submit} className="btn-secondary">Submit</button>
      </div>
    </div>
  );
}
