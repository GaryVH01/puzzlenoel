# 🔧 Configuration MongoDB Atlas pour Render

## Étape 1 : Accéder à MongoDB Atlas

1. Allez sur https://cloud.mongodb.com
2. Connectez-vous avec votre compte
3. Sélectionnez votre projet (ou créez-en un)

## Étape 2 : Configurer Network Access (Whitelist IP)

Cette étape est **ESSENTIELLE** pour que Render puisse se connecter à MongoDB Atlas.

### Méthode 1 : Via le menu principal

1. Dans le menu de gauche, cliquez sur **"Security"**
2. Cliquez sur **"Network Access"** (ou "IP Access List")
3. Cliquez sur **"Add IP Address"** (bouton vert)
4. Choisissez **"Allow Access from Anywhere"**
   - Cela ajoute automatiquement `0.0.0.0/0` (toutes les IPs)
5. Cliquez sur **"Confirm"**

### Méthode 2 : URL directe

- Allez directement sur : https://cloud.mongodb.com/v2#/security/network/whitelist
- Cliquez sur **"Add IP Address"**
- Choisissez **"Allow Access from Anywhere"**
- Cliquez sur **"Confirm"**

### Méthode 3 : Ajout manuel

Si vous préférez ajouter manuellement :

1. Cliquez sur **"Add IP Address"**
2. Dans "Access List Entry", entrez : `0.0.0.0/0`
3. Donnez un nom (ex: "Render - All IPs")
4. Cliquez sur **"Confirm"**

⚠️ **Important** : Sans cette configuration, Render ne pourra pas se connecter à MongoDB Atlas !

## Étape 3 : Vérifier Database Access

1. Dans le menu de gauche, cliquez sur **"Security"**
2. Cliquez sur **"Database Access"**
3. Vérifiez que votre utilisateur existe
4. Si vous n'avez pas d'utilisateur :
   - Cliquez sur **"Add New Database User"**
   - Choisissez **"Password"** comme méthode d'authentification
   - Entrez un nom d'utilisateur (ex: `puzzleuser`)
   - Entrez un mot de passe **SIMPLE** (sans caractères spéciaux pour éviter les problèmes)
   - Dans "Database User Privileges", choisissez **"Read and write to any database"**
   - Cliquez sur **"Add User"**

## Étape 4 : Obtenir la Connection String

1. Dans le menu de gauche, cliquez sur **"Database"**
2. Cliquez sur **"Connect"** sur votre cluster
3. Choisissez **"Connect your application"**
4. Sélectionnez **"Node.js"** comme driver
5. Copiez la connection string qui ressemble à :
   ```
   mongodb+srv://username:password@cluster.mongodb.net/puzzle?retryWrites=true&w=majority
   ```

## Étape 5 : Encoder le mot de passe (si nécessaire)

Si votre mot de passe contient des caractères spéciaux, vous devez les encoder :

| Caractère    | Encodé |
| ------------ | ------ |
| `@`          | `%40`  |
| `#`          | `%23`  |
| `%`          | `%25`  |
| `&`          | `%26`  |
| `/`          | `%2F`  |
| `:`          | `%3A`  |
| `?`          | `%3F`  |
| `=`          | `%3D`  |
| `+`          | `%2B`  |
| ` ` (espace) | `%20`  |

**Exemple :**

- Mot de passe : `Mon@Mot#De%Passe`
- Encodé : `Mon%40Mot%23De%25Passe`
- Connection string : `mongodb+srv://username:Mon%40Mot%23De%25Passe@cluster.mongodb.net/puzzle`

💡 **Astuce** : Pour éviter les problèmes, utilisez un mot de passe simple avec seulement des lettres, chiffres, tirets et underscores.

## Étape 6 : Configurer sur Render

1. Allez sur votre service Render
2. Cliquez sur **"Environment"**
3. Ajoutez la variable d'environnement :
   - **Key** : `MONGODB_URI`
   - **Value** : Votre connection string complète (avec mot de passe encodé si nécessaire)
4. Cliquez sur **"Save Changes"**
5. Render redéploiera automatiquement

## Vérification

Après configuration, testez :

```bash
curl https://votre-service.onrender.com/health
```

Devrait retourner :

```json
{ "status": "OK", "mongodb": "connected", "timestamp": "..." }
```

## Problèmes courants

### "Could not connect to any servers... IP that isn't whitelisted"

→ **Solution** : Vérifiez que vous avez bien ajouté `0.0.0.0/0` dans Network Access

### "SSL routines:ssl3_read_bytes:tlsv1 alert internal error"

→ **Solution** : Vérifiez que les caractères spéciaux du mot de passe sont encodés dans la connection string

### "Authentication failed"

→ **Solution** : Vérifiez que l'utilisateur existe dans Database Access et que le mot de passe est correct
