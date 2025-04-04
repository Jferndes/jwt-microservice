/**
 * Routes pour la gestion des tokens JWT
 */

const express = require('express');
const router = express.Router();
const tokenController = require('../controllers/tokenController');

/**
 * Route pour générer un nouveau token JWT
 * @route POST /api/token/generate
 */
router.post('/generate', tokenController.generateToken);

/**
 * Route pour vérifier un token JWT
 * @route POST /api/token/verify
 */
router.post('/verify', tokenController.verifyToken);

/**
 * Route pour invalider un token (ajout à une blacklist)
 * @route POST /api/token/revoke
 */
router.post('/revoke', tokenController.revokeToken);

module.exports = router;