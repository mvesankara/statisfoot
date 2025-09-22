 import type { Metadata } from "next";
 import { Inter } from "next/font/google";
 import "./globals.css";
 import  Providers  from "./providers";
 import { getServerSession } from "next-auth";
 import { authOptions } from "@/lib/auth";
 import { EmailVerificationBanner } from "@/components/EmailVerificationBanner";
 
 const inter = Inter({ subsets: ["latin"] });
 
 export const metadata: Metadata = {
   title: "Statisfoot",
   description: "Statisfoot - The future of football scouting.",
 };
 
 export default async function RootLayout({
   children,
 }: Readonly<{
   children: React.ReactNode;
 }>) {
   const session = await getServerSession(authOptions);

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
