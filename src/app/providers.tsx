// src/app/providers.tsx
"use client";
import { SessionProvider } from "next-auth/react";

/**
 * @component Providers
 * @description Un composant wrapper qui fournit le contexte de session de NextAuth à l'application.
 * Doit être utilisé dans le layout racine pour que `useSession` soit disponible dans les composants clients.
 * @param {object} props - Les props du composant.
 * @param {React.ReactNode} props.children - Les composants enfants à envelopper.
 * @returns {JSX.Element} Le composant `SessionProvider`.
 */
export default function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
