/**
 * Configuration du micro-service JWT
 */

// Configuration principale
const config = {
    // Clé secrète utilisée pour signer les tokens JWT
    jwtSecret: process.env.JWT_SECRET || 'secretkey',
    
    // Durée de validité par défaut des tokens JWT
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
    
    // Algorithme de signature JWT (par défaut HS256)
    jwtAlgorithm: 'HS256',
    
    // Port du serveur
    port: process.env.PORT || 3000,
    
    // Environnement d'exécution
    nodeEnv: process.env.NODE_ENV || 'development',
    
    // Activer ou désactiver le mode debug
    debug: process.env.NODE_ENV !== 'production'
  };
  
  module.exports = config;