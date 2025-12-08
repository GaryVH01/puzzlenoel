# 🚀 Démarrage Rapide - Backend Puzzle

## Installation en 5 minutes

### 1. Installer les dépendances

```bash
cd backend
npm install
```

### 2. Configurer MongoDB

**Option A : MongoDB Atlas (Gratuit, recommandé pour la production)**

1. Allez sur https://www.mongodb.com/cloud/atlas
2. Créez un compte gratuit
3. Créez un cluster (choisissez le plan gratuit M0)
4. Créez un utilisateur avec un mot de passe
5. Dans "Network Access", ajoutez `0.0.0.0/0` (toutes les IPs) ou votre IP
6. Cliquez sur "Connect" → "Connect your application"
7. Copiez la connection string (format : `mongodb+srv://username:password@cluster.mongodb.net/puzzle`)

**Option B : MongoDB Local**

```bash
# Sur macOS avec Homebrew
brew install mongodb-community

# Démarrer MongoDB
brew services start mongodb-community
```

### 3. Créer le fichier .env

```bash
# Créez un fichier .env dans le dossier backend/
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/puzzle
PORT=3000
```

### 4. Démarrer le serveur

```bash
npm start
```

Le serveur sera accessible sur `http://localhost:3000`

### 5. Configurer le frontend

Dans `index.html`, ligne ~645, modifiez :

```javascript
const BACKEND_URL = "http://localhost:3000"; // Pour le développement
// ou
const BACKEND_URL = "https://votre-backend.herokuapp.com"; // Pour la production
```

## Déploiement (optionnel)

### Sur Heroku (Gratuit)

```bash
# Installer Heroku CLI
# Créer une app
heroku create puzzle-backend

# Ajouter MongoDB Atlas URI
heroku config:set MONGODB_URI="votre_uri_mongodb_atlas"

# Déployer
git push heroku main
```

### Sur Railway (Gratuit)

1. Allez sur https://railway.app
2. Créez un nouveau projet
3. Connectez votre repo GitHub
4. Ajoutez la variable `MONGODB_URI`
5. Déployez !

## Test

```bash
# Vérifier que le serveur fonctionne
curl http://localhost:3000/health

# Devrait retourner : {"status":"OK"}
```
