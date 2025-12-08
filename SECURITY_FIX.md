# 🔒 URGENCE SÉCURITÉ - Credentials MongoDB exposés

## ⚠️ PROBLÈME DÉTECTÉ

Vos credentials MongoDB ont été exposés publiquement sur GitHub dans le fichier `.env`.

## ✅ ACTIONS IMMÉDIATES REQUISES

### 1. Changer les credentials MongoDB (URGENT)

**Faites-le MAINTENANT avant toute autre chose :**

1. Allez sur https://cloud.mongodb.com/v2/69368d89348a681379ba2e71#/security/database
2. Trouvez l'utilisateur de base de données qui a été exposé
3. **Changez son mot de passe** ou **supprimez l'utilisateur** et créez-en un nouveau
4. Notez le nouveau mot de passe

### 2. Mettre à jour la variable d'environnement sur Render

1. Allez sur votre service Render → Environment
2. Mettez à jour `MONGODB_URI` avec le nouveau mot de passe
3. Redéployez le service

### 3. Nettoyer l'historique Git (RECOMMANDÉ)

Le fichier `.env` a été supprimé de Git, mais il reste dans l'historique. Pour le supprimer complètement :

#### Option A : Utiliser git-filter-repo (recommandé)

```bash
# Installer git-filter-repo si nécessaire
# macOS: brew install git-filter-repo
# Linux: pip install git-filter-repo

cd /Users/Gary/Desktop/puzzle
git filter-repo --path .env --invert-paths --force
git push origin --force --all
```

#### Option B : Utiliser BFG Repo-Cleaner

```bash
# Télécharger BFG depuis https://rtyley.github.io/bfg-repo-cleaner/
java -jar bfg.jar --delete-files .env
git reflog expire --expire=now --all
git gc --prune=now --aggressive
git push origin --force --all
```

#### Option C : Si vous préférez ne pas toucher à l'historique

Si vous ne voulez pas modifier l'historique Git (ce qui peut affecter d'autres contributeurs), au moins :
- Le fichier est maintenant dans `.gitignore`
- Les credentials ont été changés
- L'historique sera moins accessible avec le temps

⚠️ **Note** : Modifier l'historique Git nécessite un `force push`, ce qui peut affecter d'autres personnes travaillant sur le repo.

### 4. Vérifier qu'il n'y a pas d'autres fichiers sensibles

```bash
# Chercher d'autres fichiers potentiellement sensibles
git log --all --full-history -- "*.env*"
git log --all --full-history -- "*secret*"
git log --all --full-history -- "*password*"
git log --all --full-history -- "*key*"
```

## ✅ FICHIERS CRÉÉS

- `.gitignore` : S'assure que `.env` ne sera plus jamais commité
- `.env.example` : Template pour documenter les variables sans exposer les valeurs

## 📋 CHECKLIST DE SÉCURITÉ

- [ ] Credentials MongoDB changés dans MongoDB Atlas
- [ ] Variable `MONGODB_URI` mise à jour sur Render
- [ ] Service Render redéployé et testé
- [ ] Fichier `.env` supprimé de Git (fait)
- [ ] `.gitignore` créé et vérifié (fait)
- [ ] Historique Git nettoyé (optionnel mais recommandé)
- [ ] Vérification qu'aucun autre fichier sensible n'est exposé

## 🔐 BONNES PRATIQUES POUR L'AVENIR

1. **JAMAIS** commiter de fichiers `.env` ou contenant des credentials
2. Toujours utiliser `.env.example` pour documenter les variables nécessaires
3. Vérifier `.gitignore` avant chaque commit
4. Utiliser des secrets managers pour la production (Render, Heroku, etc. ont leurs propres systèmes)
5. Utiliser des credentials différents pour dev/prod

## 📞 SUPPORT

Si vous avez des questions ou besoin d'aide :
- MongoDB Atlas Support : https://www.mongodb.com/support
- Documentation Git : https://git-scm.com/doc

