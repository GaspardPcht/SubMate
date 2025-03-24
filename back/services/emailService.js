const nodemailer = require('nodemailer');

console.log('Configuration email:', {
  user: process.env.EMAIL_USER,
  hasPassword: !!process.env.EMAIL_PASSWORD,
  frontendUrl: process.env.FRONTEND_URL
});

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Vérifier la configuration du transporteur
transporter.verify(function(error, success) {
  if (error) {
    console.error('Erreur de configuration du transporteur email:', error);
  } else {
    console.log('Serveur email prêt à envoyer des messages');
  }
});

const sendPasswordResetEmail = async (email, resetToken) => {
  console.log('Tentative d\'envoi d\'email à:', email);
  
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  console.log('URL de réinitialisation:', resetUrl);
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Réinitialisation de votre mot de passe SubMate',
    html: `
      <h1>Réinitialisation de votre mot de passe</h1>
      <p>Vous avez demandé à réinitialiser votre mot de passe sur SubMate.</p>
      <p>Cliquez sur le lien ci-dessous pour définir un nouveau mot de passe :</p>
      <a href="${resetUrl}">Réinitialiser mon mot de passe</a>
      <p>Ce lien expirera dans 1 heure.</p>
      <p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
    `
  };

  try {
    console.log('Envoi de l\'email...');
    const info = await transporter.sendMail(mailOptions);
    console.log('Email envoyé avec succès:', info.messageId);
    return true;
  } catch (error) {
    console.error('Erreur détaillée lors de l\'envoi de l\'email:', error);
    throw error;
  }
};

module.exports = {
  sendPasswordResetEmail
}; 