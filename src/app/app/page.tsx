import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { auth } from "@/lib/auth";

/**
 * This component acts as a server-side gate for logged-in users.
 * It ensures a session exists, and if so, redirects to the main dashboard.
 * The old role-based redirect logic is now obsolete with the new unified dashboard.
 */
export default async function AppGate() {
  const session = await getServerSession(auth);

  if (!session) {
    // Should be caught by middleware, but as a fallback.
    redirect("/login");
  }

  // Redirect all authenticated users to the new dashboard.
  redirect("/dashboard");
}
