# Backend Puzzle - Installation rapide

## 1. Installation

```bash
cd backend
npm install
```

## 2. Configuration MongoDB

### Option A : MongoDB Atlas (Gratuit, recommandé)

1. Créez un compte sur [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Créez un cluster gratuit
3. Créez un utilisateur avec mot de passe
4. Ajoutez votre IP dans "Network Access" (ou 0.0.0.0/0 pour toutes les IPs)
5. Copiez la connection string

### Option B : MongoDB Local

Installez MongoDB localement et utilisez : `mongodb://localhost:27017/puzzle`

## 3. Configuration

Créez un fichier `.env` :

```bash
cp .env.example .env
```

Éditez `.env` et ajoutez votre URI MongoDB :

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/puzzle
PORT=3000
```

## 4. Démarrer le serveur

```bash
npm start
```

Ou en mode développement (avec auto-reload) :

```bash
npm run dev
```

Le serveur sera accessible sur `http://localhost:3000`

## 5. Déploiement (optionnel)

### Sur Heroku (gratuit)

1. Créez un compte Heroku
2. Installez Heroku CLI
3. `heroku create puzzle-backend`
4. `heroku config:set MONGODB_URI=votre_uri`
5. `git push heroku main`

### Sur Railway (gratuit)

1. Créez un compte Railway
2. Connectez votre repo GitHub
3. Ajoutez la variable MONGODB_URI
4. Déployez !
