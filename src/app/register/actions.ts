 "use server";
 

 import type { Role } from "@prisma/client";
 import { hash } from "bcryptjs";
 import { redirect } from "next/navigation";
 
 import { prisma } from "@/lib/prisma";
 
 export type State = string | null;
 const ALLOWED_ROLES = new Set<Role>(["SCOUT", "RECRUITER", "AGENT"] as Role[]);
 
 export async function register(prev: State, formData: FormData): Promise<State> {
   const firstName = String(formData.get("firstName") ?? "").trim();
   const lastName = String(formData.get("lastName") ?? "").trim();
   const country   = String(formData.get("country") ?? "").trim();
   const email     = String(formData.get("email") ?? "").trim().toLowerCase();
   const password  = String(formData.get("password") ?? "");
   const roleInput = String(formData.get("role") ?? "SCOUT").toUpperCase();
 
   if (!firstName || !lastName || !email || !password) return "Tous les champs obligatoires ne sont pas remplis";
   const normalizedRole = roleInput as Role;
   if (!ALLOWED_ROLES.has(normalizedRole)) return "Rôle invalide";
 
   const role = normalizedRole;
 
   const existing = await prisma.user.findUnique({ where: { email } });
   if (existing) return "Cet email est déjà utilisé";
 
   const hashed = await hash(password, 10);
   await prisma.user.create({
     data: {
       email,
       password: hashed,
       role,
       firstname: firstName,
       lastname: lastName,
       country: country || null,
     },
   });
 
   redirect("/login");
 }
