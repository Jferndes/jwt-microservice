/**
 * Point d'entrée principal du micro-service JWT
 */

// Chargement des variables d'environnement à partir du fichier .env
require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const tokenRoutes = require('./routes/token');
const protectedRoutes = require('./routes/protected');
const errorHandler = require('./utils/errorHandler');

// Initialisation de l'application Express
const app = express();
const port = process.env.PORT || 3000;

// Middleware pour parser le JSON
app.use(bodyParser.json());

// Routes API
app.use('/api/token', tokenRoutes);
app.use('/api', protectedRoutes);

// Route de base pour vérifier que le service est en ligne
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    service: 'jwt-microservice',
    version: '1.0.0'
  });
});

// Middleware de gestion d'erreurs
app.use(errorHandler);

// Démarrage du serveur
app.listen(port, () => {
  console.log(`JWT Microservice démarré sur le port ${port}`);
});

// Exportation pour les tests
module.exports = app;