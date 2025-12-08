# 🔧 Dépannage - Backend Render

## Le serveur crash (Status 1)

### Causes possibles :

1. **Variable MONGODB_URI manquante ou incorrecte**

   - Vérifiez dans Render → Environment → que `MONGODB_URI` est bien définie
   - Format attendu : `mongodb+srv://username:password@cluster.mongodb.net/puzzle`

2. **MongoDB Atlas bloque les connexions**

   - Allez dans MongoDB Atlas → Network Access
   - Ajoutez `0.0.0.0/0` (toutes les IPs) ou l'IP de Render

3. **Erreur dans le code**
   - Vérifiez les logs dans Render → Logs

## Vérifications à faire

### 1. Vérifier les variables d'environnement sur Render

Dans votre service Render :

- Allez dans "Environment"
- Vérifiez que `MONGODB_URI` est bien définie
- Le format doit être : `mongodb+srv://username:password@cluster.mongodb.net/puzzle`

### 2. Tester la connexion MongoDB

```bash
# Testez depuis votre machine locale
curl https://votre-service.onrender.com/health

# Devrait retourner :
# {"status":"OK","timestamp":"...","mongodb":"connected"}
# ou
# {"status":"DEGRADED","timestamp":"...","mongodb":"disconnected"}
```

### 3. Vérifier les logs Render

Dans Render → Logs, vous devriez voir :

- `🚀 Serveur démarré sur 0.0.0.0:XXXX`
- `✅ Connecté à MongoDB` (si MongoDB fonctionne)
- ou `❌ Erreur de connexion MongoDB` (si problème)

### 4. Vérifier MongoDB Atlas

1. Allez sur https://cloud.mongodb.com
2. Vérifiez que votre cluster est actif
3. Vérifiez Network Access → ajoutez `0.0.0.0/0` si nécessaire
4. Vérifiez Database Access → votre utilisateur existe et a les bonnes permissions

## Solutions

### Si MongoDB n'est pas connecté

Le serveur ne crash plus maintenant, mais retournera une erreur 503. Vérifiez :

1. La variable `MONGODB_URI` dans Render
2. Les permissions MongoDB Atlas
3. Les logs pour voir l'erreur exacte

### Si le serveur ne démarre pas du tout

1. Vérifiez les logs Render pour l'erreur exacte
2. Vérifiez que `package.json` est correct
3. Vérifiez que le "Start Command" est : `npm start` (pas `node server.js` directement)

### Erreur SSL/TLS (MongoNetworkError: SSL routines)

Si vous voyez une erreur comme :

```
MongoNetworkError: C01CB4F50C7E0000:error:0A000438:SSL routines:ssl3_read_bytes:tlsv1 alert internal error
```

**Solutions :**

1. **Vérifier la connection string MongoDB Atlas**

   - Allez dans MongoDB Atlas → Connect → Connect your application
   - Copiez la connection string complète
   - **Important** : Si votre mot de passe contient des caractères spéciaux (`@`, `#`, `%`, etc.), vous devez les encoder en URL :
     - `@` → `%40`
     - `#` → `%23`
     - `%` → `%25`
     - `&` → `%26`
     - etc.

2. **Vérifier le format de l'URI**

   - Format correct : `mongodb+srv://username:password@cluster.mongodb.net/puzzle?retryWrites=true&w=majority`
   - Remplacez `<password>` par votre mot de passe encodé si nécessaire

3. **Créer un nouvel utilisateur MongoDB**

   - Si le problème persiste, créez un nouvel utilisateur avec un mot de passe simple (sans caractères spéciaux)
   - Utilisez ce nouvel utilisateur dans la connection string

4. **Vérifier la version Node.js sur Render**
   - Render utilise généralement Node.js 18+ par défaut
   - MongoDB Atlas nécessite Node.js 14+ avec support TLS 1.2+

### Test rapide

```bash
# Testez depuis votre terminal
curl https://votre-service.onrender.com/

# Devrait retourner :
# {"message":"Puzzle Backend API","status":"running",...}
```

### Vérifier la connection string

Pour tester si votre connection string est correcte :

```bash
# Depuis votre machine locale (si vous avez MongoDB CLI)
mongosh "votre-connection-string"

# Ou testez avec Node.js
node -e "require('mongoose').connect('votre-connection-string').then(() => console.log('OK')).catch(e => console.error(e))"
```
