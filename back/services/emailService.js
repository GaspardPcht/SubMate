const nodemailer = require('nodemailer');

// Vérification des variables d'environnement
console.log('Vérification des variables d\'environnement email...');
console.log('EMAIL_USER:', process.env.EMAIL_USER ? 'présent' : 'manquant');
console.log('EMAIL_APP_PASSWORD:', process.env.EMAIL_APP_PASSWORD ? 'présent' : 'manquant');
console.log('FRONTEND_URL:', process.env.FRONTEND_URL ? 'présent' : 'manquant');

if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
  console.error('ERREUR: Variables d\'environnement manquantes pour l\'email');
  console.error('EMAIL_USER:', process.env.EMAIL_USER ? 'présent' : 'manquant');
  console.error('EMAIL_APP_PASSWORD:', process.env.EMAIL_APP_PASSWORD ? 'présent' : 'manquant');
}

// Log détaillé de la configuration
console.log('Configuration email détaillée:', {
  user: process.env.EMAIL_USER,
  hasPassword: !!process.env.EMAIL_APP_PASSWORD,
  frontendUrl: process.env.FRONTEND_URL,
  nodeEnv: process.env.NODE_ENV
});

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true for 465, false for other ports like 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD
  }
});

// Vérifier la configuration du transporteur
console.log('Vérification de la configuration du transporteur email...');
transporter.verify(function(error, success) {
  if (error) {
    console.error('Erreur de configuration du transporteur email:', error);
    console.error('Détails de l\'erreur:', {
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode
    });
  } else {
    console.log('Serveur email prêt à envoyer des messages');
  }
});

const sendSupportEmail = async (supportData) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
    throw new Error('Configuration email manquante');
  }

  const { type, title, description, user } = supportData;
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_TO || 'gaspardpauchet@gmail.com',
    subject: `SubMate - Nouvelle demande de support: ${type}`,
    html: `
      <h2>Nouvelle demande de support</h2>
      <p><strong>Type:</strong> ${type}</p>
      <p><strong>Titre:</strong> ${title}</p>
      <p><strong>Description:</strong> ${description}</p>
      <hr>
      <p><strong>Utilisateur:</strong></p>
      <p>Nom: ${user.firstname} ${user.lastname}</p>
      <p>Email: ${user.email}</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
    throw new Error('Erreur lors de l\'envoi de l\'email');
  }
};

const sendPasswordResetEmail = async (email, newPassword) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
    throw new Error('Configuration email manquante');
  }

  console.log('Tentative d\'envoi d\'email à:', email);
  
  const mailOptions = {
    from: `"SubMate" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Votre nouveau mot de passe SubMate',
    html: `
      <h1>Réinitialisation de votre mot de passe</h1>
      <p>Vous avez demandé à réinitialiser votre mot de passe sur SubMate.</p>
      <p>Voici votre nouveau mot de passe :</p>
      <p style="font-size: 20px; font-weight: bold; color: #377AF2; padding: 10px; background-color: #f5f5f5; border-radius: 5px;">${newPassword}</p>
      <p>Pour des raisons de sécurité, nous vous recommandons de changer ce mot de passe lors de votre prochaine connexion.</p>
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
    console.error('Détails de l\'erreur:', {
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode
    });
    throw error;
  }
};

module.exports = {
  sendPasswordResetEmail,
  sendSupportEmail
}; 