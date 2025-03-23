const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    // Vérifier si le header Authorization existe
    if (!req.headers.authorization) {
      return res.status(401).json({
        success: false,
        message: 'Token d\'authentification manquant'
      });
    }

    // Extraire le token du header Authorization
    const authHeader = req.headers.authorization;
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Format de token invalide'
      });
    }

    const token = authHeader.split(' ')[1];
    console.log('Token reçu:', token); // Log du token reçu

    // Vérifier et décoder le token
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token décodé:', decodedToken); // Log du token décodé

    // Ajouter les données utilisateur à la requête
    req.userData = { userId: decodedToken.userId };
    next();
  } catch (error) {
    console.error('Erreur d\'authentification:', error); // Log de l'erreur
    res.status(401).json({
      success: false,
      message: 'Token invalide ou expiré'
    });
  }
}; 