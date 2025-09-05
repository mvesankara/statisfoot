import { PrismaClient } from "@prisma/client";
import Editor from "./Editor";

 const prisma = new PrismaClient();
 
 export default async function ReportPage({ params }: { params: { id: string } }) {
   const report = await prisma.report.findUnique({
     where: { id: params.id },
     include: { author: true, player: true },
   });
 
   if (!report) return <p>Report not found</p>;
 
   return (
     <div className="p-8">
       <h1 className="text-2xl font-bold">{report.title}</h1>
       <p>{report.content}</p>
       <p>Status: {report.status}</p>
       <p>Player: {report.player.firstName} {report.player.lastName}</p>
       <p>Author: {report.author.name}</p>
      <Editor
        id={report.id}
        initialTitle={report.title}
        initialContent={report.content}
      />
     </div>
   );
 }
