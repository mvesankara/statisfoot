 import { useState } from "react";

 export default function NewReportPage() {
   const [playerId, setPlayerId] = useState("");
   const [authorId, setAuthorId] = useState("");
   const [content, setContent] = useState("");

   async function handleSubmit(e: React.FormEvent) {
     e.preventDefault();
     await fetch("/api/reports", {
       method: "POST",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify({ playerId, authorId, content }),
     });
     setPlayerId("");
     setAuthorId("");
     setContent("");
   }

   return (
     < form onSubmit={handleSubmit} className="p-8 space-y-4 max-w-lg mx-auto">
       <input
         className="border p-2 w-full"
         placeholder="Player ID"
         value={playerId}
         onChange={(e) => setPlayerId(e.target.value)}
       />
       <input
         className="border p-2 w-full"
         placeholder="Author ID"
         value={authorId}
         onChange={(e) => setAuthorId(e.target.value)}
       />
       <textarea
         className="border p-2 w-full"
         placeholder="Report content"
         value={content}
         onChange={(e) => setContent(e.target.value)}
       />
       <button type="submit" className="bg-primary text-white px-4 py-2 rounded">
         Save report
       </button>
     </form>
   );
 }
