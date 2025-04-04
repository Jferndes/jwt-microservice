/**
 * Middleware de gestion globale des erreurs
 */

const config = require('../config/config');

/**
 * Middleware qui capture et formate les erreurs pour une réponse API cohérente
 * @param {Error} err - L'erreur capturée
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction next() d'Express
 */
const errorHandler = (err, req, res, next) => {
  // Statut d'erreur par défaut
  const statusCode = err.statusCode || 500;
  
  // Créer une réponse d'erreur
  const errorResponse = {
    success: false,
    message: err.message || 'Erreur interne du serveur',
    error: config.debug ? err.stack : undefined
  };

  // Si on est en mode développement, on peut ajouter des informations supplémentaires
  if (config.debug) {
    errorResponse.details = err.details || null;
  }

  // Enregistrer l'erreur dans la console (en production, utilisez un système de logging plus robuste)
  console.error(`[${new Date().toISOString()}] Erreur: ${err.message}`);
  if (config.debug) {
    console.error(err.stack);
  }

  // Envoyer la réponse d'erreur
  res.status(statusCode).json(errorResponse);
};

module.exports = errorHandler;