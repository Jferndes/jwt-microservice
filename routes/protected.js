/**
 * Routes protégées par authentification JWT
 */

const express = require('express');
const router = express.Router();
const { verifyToken, hasRole } = require('../middleware/auth');

/**
 * Route protégée accessible à tous les utilisateurs authentifiés
 * @route GET /api/protected
 */
router.get('/protected', verifyToken, (req, res) => {
  res.json({
    success: true,
    message: 'Accès autorisé à la ressource protégée',
    user: req.user
  });
});

/**
 * Route protégée accessible uniquement aux administrateurs
 * @route GET /api/admin
 */
router.get('/admin', verifyToken, hasRole(['admin']), (req, res) => {
  res.json({
    success: true,
    message: 'Accès autorisé à la zone admin',
    user: req.user
  });
});

/**
 * Route pour obtenir le profil de l'utilisateur courant
 * @route GET /api/profile
 */
router.get('/profile', verifyToken, (req, res) => {
  // Retourner uniquement les données pertinentes du profil
  const { iat, exp, ...userProfile } = req.user;
  
  res.json({
    success: true,
    profile: userProfile
  });
});

module.exports = router;