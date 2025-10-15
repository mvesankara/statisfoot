/**
 * @file Fonctions utilitaires pour l'envoi d'e-mails.
 * @description Ce fichier configure un transporteur Nodemailer et exporte des fonctions pour envoyer des e-mails de réinitialisation de mot de passe et de vérification d'adresse e-mail.
 */
import nodemailer from "nodemailer";

type Transporter = import("nodemailer").Transporter;
type SentMessageInfo = import("nodemailer").SentMessageInfo;

let transporterPromise: Promise<Transporter> | null = null;

async function createTransporter(): Promise<Transporter> {
  const host = process.env.EMAIL_HOST;
  const port = process.env.EMAIL_PORT;
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (host && port && user && pass) {
    const parsedPort = Number(port);
    return nodemailer.createTransport({
      host,
      port: Number.isNaN(parsedPort) ? 587 : parsedPort,
      secure: parsedPort === 465,
      auth: { user, pass },
    });
  }

  if (typeof nodemailer.createTestAccount === "function") {
    const testAccount = await nodemailer.createTestAccount();
    console.warn(
      "[email] Aucune configuration SMTP trouvée. Utilisation d'un compte de test Ethereal (%s).",
      testAccount.user,
    );
    console.warn(
      "[email] Les e-mails envoyés en développement disposent d'un lien d'aperçu dans la console.",
    );

    return nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }

  throw new Error(
    "Configuration SMTP manquante : définissez EMAIL_HOST, EMAIL_PORT, EMAIL_USER et EMAIL_PASS.",
  );
}

async function getTransporter(): Promise<Transporter> {
  if (!transporterPromise) {
    transporterPromise = createTransporter();
  }
  return transporterPromise;
}

function logPreview(info: SentMessageInfo) {
  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) {
    console.log("Preview URL: %s", previewUrl);
  }
}

/**
 * @async
 * @function sendPasswordResetEmail
 * @description Envoie un e-mail de réinitialisation de mot de passe à l'utilisateur.
 * @param {string} to - L'adresse e-mail du destinataire.
 * @param {string} token - Le jeton de réinitialisation de mot de passe.
 */
export async function sendPasswordResetEmail(to: string, token: string) {
  const transporter = await getTransporter();
  const resetLink = `http://localhost:3000/reset-password?token=${token}`;
  const info = await transporter.sendMail({
    from: '"Statisfoot" <noreply@statisfoot.com>',
    to,
    subject: "Réinitialisation de votre mot de passe",
    html: `<p>Cliquez sur le lien suivant pour réinitialiser votre mot de passe: <a href="${resetLink}">${resetLink}</a></p>`,
  });

  console.log("Message sent: %s", info.messageId ?? "");
  logPreview(info);
}

/**
 * @async
 * @function sendVerificationEmail
 * @description Envoie un e-mail de vérification d'adresse e-mail à l'utilisateur.
 * @param {string} to - L'adresse e-mail du destinataire.
 * @param {string} token - Le jeton de vérification.
 */
export async function sendVerificationEmail(to: string, token: string) {
  const transporter = await getTransporter();
  const verificationLink = `http://localhost:3000/api/auth/verify-email?token=${token}`;
  const info = await transporter.sendMail({
    from: '"Statisfoot" <noreply@statisfoot.com>',
    to,
    subject: "Vérifiez votre adresse email",
    html: `<p>Cliquez sur le lien suivant pour vérifier votre adresse email: <a href="${verificationLink}">${verificationLink}</a></p>`,
  });

  console.log("Message sent: %s", info.messageId ?? "");
  logPreview(info);
}
