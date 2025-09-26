 import type { Metadata } from "next";
 import { Inter } from "next/font/google";
 import "./globals.css";
 import  Providers  from "./providers";
 import { auth } from "@/lib/auth";
 import { EmailVerificationBanner } from "@/components/EmailVerificationBanner";
 
 const inter = Inter({ subsets: ["latin"] });
 
 export const metadata: Metadata = {
   title: "Statisfoot",
   description: "Statisfoot - The future of football scouting.",
 };
 
 /**
 * @component RootLayout
 * @description Layout racine de l'application. Il enveloppe toutes les pages.
 * Il configure la langue, la police, et inclut le `Providers` pour le contexte (comme NextAuth).
 * Affiche également une bannière de vérification d'e-mail si nécessaire.
 * @param {object} props - Les props du composant.
 * @param {React.ReactNode} props.children - Les pages enfants rendues par Next.js.
 * @returns {Promise<JSX.Element>} Le layout racine de l'application.
 */
export default async function RootLayout({
   children,
 }: Readonly<{
   children: React.ReactNode;
 }>) {
   const session = await auth();

   return (
     <html lang="fr">
       <body className={`${inter.className} antialiased`}>
         <Providers>
           {session && !session.user?.emailVerified && <EmailVerificationBanner />}
           {children}
         </Providers>
       </body>
     </html>
   );
 }
