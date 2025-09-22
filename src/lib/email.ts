/**
 * @file Fonctions utilitaires pour l'envoi d'e-mails.
 * @description Ce fichier configure un transporteur Nodemailer et exporte des fonctions pour envoyer des e-mails de réinitialisation de mot de passe et de vérification d'adresse e-mail.
 */
import nodemailer from "nodemailer";

/**
 * @const {nodemailer.Transporter} transporter
 * @description Instance du transporteur Nodemailer, configurée avec les variables d'environnement.
 */
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * @async
 * @function sendPasswordResetEmail
 * @description Envoie un e-mail de réinitialisation de mot de passe à l'utilisateur.
 * @param {string} to - L'adresse e-mail du destinataire.
 * @param {string} token - Le jeton de réinitialisation de mot de passe.
 */
export async function sendPasswordResetEmail(to: string, token: string) {
  const resetLink = `http://localhost:3000/reset-password?token=${token}`;
  const info = await transporter.sendMail({
    from: '"Statisfoot" <noreply@statisfoot.com>',
    to,
    subject: "Réinitialisation de votre mot de passe",
    html: `<p>Cliquez sur le lien suivant pour réinitialiser votre mot de passe: <a href="${resetLink}">${resetLink}</a></p>`,
  });

  console.log("Message sent: %s", info.messageId);
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
}

/**
 * @async
 * @function sendVerificationEmail
 * @description Envoie un e-mail de vérification d'adresse e-mail à l'utilisateur.
 * @param {string} to - L'adresse e-mail du destinataire.
 * @param {string} token - Le jeton de vérification.
 */
export async function sendVerificationEmail(to: string, token: string) {
  const verificationLink = `http://localhost:3000/api/auth/verify-email?token=${token}`;
  const info = await transporter.sendMail({
    from: '"Statisfoot" <noreply@statisfoot.com>',
    to,
    subject: "Vérifiez votre adresse email",
    html: `<p>Cliquez sur le lien suivant pour vérifier votre adresse email: <a href="${verificationLink}">${verificationLink}</a></p>`,
  });

  console.log("Message sent: %s", info.messageId);
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
}
