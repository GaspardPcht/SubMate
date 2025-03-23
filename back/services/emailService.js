const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD
  }
});

const sendSupportEmail = async (supportData) => {
  const { type, title, description, user } = supportData;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: 'gaspardpauchet@gmail.com',
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

module.exports = {
  sendSupportEmail
}; 