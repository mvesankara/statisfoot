import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";


export default async function AppRedirect() {
const session = await getServerSession(authOptions);
if (!session) redirect("/login");
const role = (session as any).role ?? "SCOUT";
const map: Record<string, string> = {
SCOUT: "/scout",
RECRUITER: "/recruiter",
AGENT: "/agent",
ADMIN: "/admin",
};
redirect(map[role] || "/");
}