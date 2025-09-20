import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Navbar } from "@/components/Navbar";

const ROLE_REDIRECT: Record<string, string> = {
  SCOUT: "/scout",
  RECRUITER: "/recruiter",
  AGENT: "/agent",
  ADMIN: "/admin",
};

export default async function App() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const user = session.user;
  const redirectPath = ROLE_REDIRECT[user.role ?? "SCOUT"] ?? "/";

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl md:text-4xl font-bold text-primary">
          Bienvenue, {user.firstname || "Matelot"} !
        </h1>
        <div className="mt-6 bg-slate-50 rounded-2xl p-6">
          <p className="text-slate-600">
            Vous êtes connecté en tant que {user.role}.
          </p>
          <div className="mt-8">
            <a
              href={redirectPath}
              className="inline-flex items-center rounded-xl bg-primary text-white px-5 py-3 font-semibold"
            >
              Accéder à mon tableau de bord
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
