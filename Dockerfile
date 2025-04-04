# Utiliser une image Node.js officielle comme base
FROM node:18-alpine

# Créer le répertoire de l'application
WORKDIR /usr/src/app

# Copier package.json et package-lock.json
COPY package*.json ./

# Installer toutes les dépendances, y compris celles de développement
RUN npm install

# Copier le reste des fichiers de l'application
COPY . .

# Ouvrir le port sur lequel l'application s'exécute
EXPOSE 3000

# Spécifier la commande par défaut (sera remplacée par docker-compose)
CMD ["npm", "run", "dev"]