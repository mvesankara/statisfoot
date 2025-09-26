 "use server";
 

 import type { Role } from "@prisma/client";
 import { hash } from "bcryptjs";
 import { redirect } from "next/navigation";
 import { randomBytes } from "crypto";
 import { sendVerificationEmail } from "@/lib/email";
 
 import { prisma } from "@/lib/prisma";
 
 export type State = string | null;
 const ALLOWED_ROLES = new Set<Role>(["SCOUT", "RECRUITER", "AGENT"] as Role[]);
 
 /**
 * @async
 * @function register
 * @description Server Action pour gérer l'inscription d'un nouvel utilisateur.
 * Valide les données du formulaire, crée l'utilisateur en base de données,
 * et envoie un e-mail de vérification.
 * @param {State} prev - L'état précédent (utilisé pour afficher les erreurs).
 * @param {FormData} formData - Les données du formulaire d'inscription.
 * @returns {Promise<State>} Un message d'erreur en cas d'échec, ou redirige en cas de succès.
 */
export async function register(prev: State, formData: FormData): Promise<State> {
   const firstName = String(formData.get("firstName") ?? "").trim();
   const lastName = String(formData.get("lastName") ?? "").trim();
   const country   = String(formData.get("country") ?? "").trim();
   const email     = String(formData.get("email") ?? "").trim().toLowerCase();
   const password  = String(formData.get("password") ?? "");
   const confirmPassword = String(formData.get("confirmPassword") ?? "");
   const roleInput = String(formData.get("role") ?? "SCOUT").toUpperCase();
 
   if (!firstName || !lastName || !email || !password) return "Tous les champs obligatoires ne sont pas remplis";
   if (password !== confirmPassword) return "Les mots de passe ne correspondent pas";
   if (password.length < 8) return "Le mot de passe doit contenir au moins 8 caractères";
   const normalizedRole = roleInput as Role;
   if (!ALLOWED_ROLES.has(normalizedRole)) return "Rôle invalide";
 
   const role = normalizedRole;
 
   const existing = await prisma.user.findUnique({ where: { email } });
   if (existing) return "Cet email est déjà utilisé";
 
   const hashed = await hash(password, 10);
   const verificationToken = randomBytes(32).toString("hex");

   await prisma.user.create({
     data: {
       email,
       password: hashed,
       role,
       firstname: firstName,
       lastname: lastName,
       country: country || null,
       emailVerificationToken: verificationToken,
     },
   });
 
   await sendVerificationEmail(email, verificationToken);

   redirect("/login?verified=false");
 }
