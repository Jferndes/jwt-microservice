# Micro-service JWT

Ce micro-service permet de générer et vérifier des jetons JWT (JSON Web Token).

## Fonctionnalités

- Génération de tokens JWT avec payload personnalisable
- Vérification de tokens JWT
- Révocation de tokens (blacklist)
- Middleware pour protéger des routes API avec JWT
- Contrôle d'accès basé sur les rôles
- Gestion des erreurs et expirations des tokens

## Architecture du projet

```
jwt-microservice/
│
├── index.js                  # Point d'entrée principal du service
├── package.json              # Configuration du projet et dépendances
├── .env                      # Variables d'environnement (PORT, JWT_SECRET)
├── .dockerignore             # Fichiers à ignorer lors de la construction Docker
├── Dockerfile                # Instructions de construction de l'image Docker
├── docker-compose.yml        # Configuration pour Docker Compose
│
├── config/
│   └── config.js             # Configuration (clés secrètes, options JWT)
│
├── controllers/
│   └── tokenController.js    # Logique de traitement des tokens
│
├── middleware/
│   └── auth.js               # Middleware d'authentification (verifyToken)
│
├── routes/
│   ├── token.js              # Routes pour la génération et vérification des tokens
│   └── protected.js          # Routes protégées par JWT
│
├── utils/
│   └── errorHandler.js       # Gestion des erreurs spécifiques aux JWT
│
└── tests/
    ├── token.test.js         # Tests unitaires pour les fonctions de token
    └── routes.test.js        # Tests d'intégration pour les routes API
```

## Installation

```bash
# Cloner le dépôt
git clone <url-du-repo>
cd jwt-microservice

# Installer les dépendances
npm install
```

## Configuration

Le service utilise les variables d'environnement suivantes:

- `PORT`: le port sur lequel le serveur sera lancé (par défaut: 3000)
- `JWT_SECRET`: la clé secrète utilisée pour signer les tokens JWT (définissez une clé forte en production)
- `JWT_EXPIRES_IN`: durée de validité par défaut des tokens (par défaut: 1h)
- `NODE_ENV`: environnement d'exécution (development, production, test)

Créez un fichier `.env` à la racine du projet avec ces variables :

```
PORT=3000
JWT_SECRET=secretkey
JWT_EXPIRES_IN=1h
NODE_ENV=development
```

## Lancement du service

### Avec Node.js directement

```bash
# Mode développement avec redémarrage automatique
npm run dev

# Mode production
npm start
```

### Avec Docker

```bash
# Construire et démarrer avec Docker Compose
docker-compose up -d

# Voir les logs
docker logs jwt-microservice

# Arrêter le service
docker-compose down
```

## Endpoints API

### Générer un token

```
POST /api/token/generate
```

Corps de la requête:
```json
{
  "userId": "123",
  "username": "utilisateur",
  "role": "admin",
  "expiresIn": "2h"  // Optionnel, par défaut: "1h"
}
```

Réponse:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": "2h"
}
```

### Vérifier un token

```
POST /api/token/verify
```

Corps de la requête:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

Réponse (succès):
```json
{
  "success": true,
  "payload": {
    "userId": "123",
    "username": "utilisateur",
    "role": "admin",
    "iat": 1618236123,
    "exp": 1618239723
  },
  "expires": "2023-04-12T10:15:23.000Z"
}
```

### Révoquer un token

```
POST /api/token/revoke
```

Corps de la requête:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

Réponse:
```json
{
  "success": true,
  "message": "Token révoqué avec succès"
}
```

### Accéder à une route protégée

```
GET /api/protected
```

Headers:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Réponse:
```json
{
  "success": true,
  "message": "Accès autorisé à la ressource protégée",
  "user": {
    "userId": "123",
    "username": "utilisateur",
    "role": "admin",
    "iat": 1618236123,
    "exp": 1618239723
  }
}
```

### Accéder à une route protégée par rôle

```
GET /api/admin
```

Headers:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Réponse (avec un token ayant le rôle "admin"):
```json
{
  "success": true,
  "message": "Accès autorisé à la zone admin",
  "user": {
    "userId": "123",
    "username": "admin",
    "role": "admin",
    "iat": 1618236123,
    "exp": 1618239723
  }
}
```

## Tests

```bash
# Exécuter tous les tests
npm test

# Exécuter les tests unitaires uniquement
npx jest tests/token.test.js

# Exécuter les tests d'intégration uniquement
npx jest tests/routes.test.js
```

## Exemple d'utilisation avec cURL

```bash
# Générer un token
TOKEN=$(curl -s -X POST http://localhost:3000/api/token/generate \
  -H "Content-Type: application/json" \
  -d '{"userId":"123","username":"test","role":"admin"}' \
  | jq -r '.token')

# Utiliser le token pour accéder à une route protégée
curl -X GET http://localhost:3000/api/protected \
  -H "Authorization: Bearer $TOKEN"
```

## Sécurité

Points importants à considérer:

1. Utilisez HTTPS en production
2. Définissez une clé secrète forte et unique pour `JWT_SECRET`
3. Limitez les informations sensibles stockées dans le payload JWT
4. Définissez des durées d'expiration appropriées pour vos tokens selon le cas d'usage
5. Utilisez un système de stockage persistant pour la blacklist en production

## Licence

MIT