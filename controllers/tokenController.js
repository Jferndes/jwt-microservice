/**
 * Contrôleur pour gérer les opérations liées aux tokens JWT
 */

const jwt = require('jsonwebtoken');
const config = require('../config/config');

// Liste des tokens révoqués (en mémoire - à remplacer par une base de données en production)
const revokedTokens = new Set();

/**
 * Génère un nouveau token JWT
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
const generateToken = (req, res) => {
  try {
    // Récupérer les données du payload depuis la requête
    const payload = req.body;
    
    if (!payload || Object.keys(payload).length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Le payload ne peut pas être vide' 
      });
    }

    // Options pour le token (expiration, etc.)
    const options = {
      expiresIn: req.body.expiresIn || config.jwtExpiresIn
    };

    // Supprimer le champ expiresIn du payload s'il existe
    if (payload.expiresIn) {
      delete payload.expiresIn;
    }

    // Générer le token JWT
    const token = jwt.sign(payload, config.jwtSecret, options);

    // Renvoyer le token
    res.json({
      success: true,
      token,
      expiresIn: options.expiresIn
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la génération du token',
      error: error.message
    });
  }
};

/**
 * Vérifie un token JWT
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
const verifyToken = (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Le token est requis'
      });
    }

    // Vérifier si le token a été révoqué
    if (revokedTokens.has(token)) {
      return res.status(401).json({
        success: false,
        message: 'Le token a été révoqué'
      });
    }

    // Vérifier le token
    const decoded = jwt.verify(token, config.jwtSecret);
    
    // Renvoyer les informations décodées du token
    res.json({
      success: true,
      payload: decoded,
      expires: new Date(decoded.exp * 1000).toISOString()
    });
  } catch (error) {
    let message = 'Token invalide';
    
    if (error.name === 'TokenExpiredError') {
      message = 'Le token a expiré';
    } else if (error.name === 'JsonWebTokenError') {
      message = 'Token invalide ou malformé';
    }
    
    res.status(401).json({
      success: false,
      message,
      error: error.message
    });
  }
};

/**
 * Révoque un token JWT (l'ajoute à la blacklist)
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
const revokeToken = (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Le token est requis'
      });
    }

    // Essayons de décoder le token pour vérifier qu'il est valide
    // (mais nous n'avons pas besoin de vérifier la signature ici)
    try {
      jwt.decode(token);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Format de token invalide',
        error: error.message
      });
    }

    // Ajouter le token à la liste des tokens révoqués
    revokedTokens.add(token);
    
    res.json({
      success: true,
      message: 'Token révoqué avec succès'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la révocation du token',
      error: error.message
    });
  }
};

module.exports = {
  generateToken,
  verifyToken,
  revokeToken
};