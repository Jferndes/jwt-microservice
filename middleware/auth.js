/**
 * Middleware d'authentification par JWT
 */

const jwt = require('jsonwebtoken');
const config = require('../config/config');

/**
 * Middleware pour vérifier le token JWT dans l'en-tête Authorization
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction next() d'Express
 */
const verifyToken = (req, res, next) => {
  // Récupérer le token depuis les en-têtes
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Token d\'authentification requis'
    });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    // Vérifier le token avec la clé secrète
    const decoded = jwt.verify(token, config.jwtSecret);
    
    // Ajouter les informations du token au request
    req.user = decoded;
    
    next();
  } catch (error) {
    let message = 'Token invalide';
    
    if (error.name === 'TokenExpiredError') {
      message = 'Le token a expiré';
    } else if (error.name === 'JsonWebTokenError') {
      message = 'Token invalide ou malformé';
    }
    
    return res.status(401).json({
      success: false,
      message,
      error: error.message
    });
  }
};

/**
 * Middleware pour vérifier qu'un utilisateur a un rôle spécifique
 * @param {string[]} roles - Tableau des rôles autorisés
 */
const hasRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Utilisateur non authentifié'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé avec ce rôle'
      });
    }

    next();
  };
};

module.exports = {
  verifyToken,
  hasRole
};