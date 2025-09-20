import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

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
