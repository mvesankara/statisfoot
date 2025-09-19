 import { redirect } from "next/navigation";
 import { getServerSession } from "next-auth";
 import { authOptions } from "@/lib/auth";

 
 const ROLE_REDIRECT: Record<string, string> = {
   SCOUT: "/scout",
   RECRUITER: "/recruiter",
   AGENT: "/agent",
   ADMIN: "/admin",
 };
 
 export default async function AppRedirect() {
   const session = await getServerSession(authOptions);
 
  if (!session) {
     redirect("/login");
   }

   const role = session.user?.role ?? "SCOUT";

   redirect(ROLE_REDIRECT[role] ?? "/");
 }
