# 🚀 Déploiement sur Render

## Configuration des variables d'environnement

Sur Render, vous devez ajouter **une seule variable d'environnement** :

### Variable requise :

1. **`MONGODB_URI`**
   - Valeur : Votre connection string MongoDB Atlas
   - Format : `mongodb+srv://username:password@cluster.mongodb.net/puzzle?retryWrites=true&w=majority`
   - ⚠️ **OBLIGATOIRE** - Sans cette variable, le serveur ne pourra pas se connecter à MongoDB

### Variables optionnelles :

- **`PORT`** : Render gère automatiquement le port, pas besoin de le définir
- **`NODE_ENV`** : `production` (défini automatiquement par Render)

## Étapes de déploiement

### 1. Préparer MongoDB Atlas

1. Créez un compte sur [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Créez un cluster gratuit (M0)
3. Créez un utilisateur avec un mot de passe
4. Dans "Network Access", ajoutez `0.0.0.0/0` (toutes les IPs) pour permettre Render
5. Cliquez sur "Connect" → "Connect your application"
6. Copiez la connection string

### 2. Déployer sur Render

1. Allez sur [Render](https://render.com)
2. Créez un compte (gratuit)
3. Cliquez sur "New" → "Web Service"
4. Connectez votre repository GitHub (ou déployez depuis Git)
5. Configurez :
   - **Name** : `puzzle-backend` (ou autre nom)
   - **Environment** : `Node`
   - **Build Command** : `cd backend && npm install`
   - **Start Command** : `cd backend && npm start`
   - **Root Directory** : (laissez vide ou mettez `/`)

### 3. Ajouter la variable d'environnement

1. Dans votre service Render, allez dans "Environment"
2. Cliquez sur "Add Environment Variable"
3. Ajoutez :
   - **Key** : `MONGODB_URI`
   - **Value** : Votre connection string MongoDB Atlas
4. Cliquez sur "Save Changes"

### 4. Déployer

1. Render va automatiquement déployer votre service
2. Attendez que le déploiement soit terminé (2-3 minutes)
3. Votre backend sera accessible sur : `https://votre-service.onrender.com`

### 5. Tester

```bash
# Vérifier que le serveur fonctionne
curl https://votre-service.onrender.com/health

# Devrait retourner : {"status":"OK"}
```

### 6. Configurer le frontend

Dans `index.html`, ligne ~645, modifiez :

```javascript
const BACKEND_URL = "https://votre-service.onrender.com";
```

## Notes importantes

- ⚠️ **Gratuit mais avec limitations** : Le plan gratuit de Render met le service en veille après 15 minutes d'inactivité. Le premier appel peut prendre 30-60 secondes pour "réveiller" le service.
- 💰 **Plan payant** : Si vous voulez éviter la mise en veille, le plan payant ($7/mois) garde le service actif 24/7.
- 🔒 **Sécurité** : Ne commitez jamais votre `MONGODB_URI` dans Git. Utilisez toujours les variables d'environnement.

## Dépannage

### Le service ne démarre pas

- Vérifiez les logs dans Render
- Assurez-vous que `MONGODB_URI` est bien définie
- Vérifiez que MongoDB Atlas autorise les connexions depuis toutes les IPs (0.0.0.0/0)

### Erreur de connexion MongoDB

- Vérifiez que votre connection string est correcte
- Vérifiez que l'utilisateur MongoDB a les bonnes permissions
- Vérifiez que l'IP de Render est autorisée dans MongoDB Atlas (0.0.0.0/0)

### Le service est lent au premier appel

- C'est normal sur le plan gratuit (mise en veille)
- Le premier appel "réveille" le service
- Les appels suivants sont rapides
