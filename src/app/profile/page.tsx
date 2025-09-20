import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/Navbar";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <>
      <Navbar />
      <main className="p-8">
        <h1 className="text-2xl font-semibold">Mon profil</h1>
        <div className="mt-4 card">
          <p><strong>Nom:</strong> {session.user?.name}</p>
          <p><strong>Email:</strong> {session.user?.email}</p>
          <p><strong>Rôle:</strong> {session.user?.role}</p>
        </div>
      </main>
    </>
  );
}
