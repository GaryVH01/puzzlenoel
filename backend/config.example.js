// Exemple de configuration
// Copiez ce fichier en config.js et modifiez les valeurs

module.exports = {
  // MongoDB URI - Utilisez MongoDB Atlas (gratuit) ou un serveur local
  // Format Atlas : mongodb+srv://username:password@cluster.mongodb.net/puzzle
  // Format local : mongodb://localhost:27017/puzzle
  MONGODB_URI: process.env.MONGODB_URI || "mongodb://localhost:27017/puzzle",

  // Port du serveur
  PORT: process.env.PORT || 3000,

  // URL du frontend (pour CORS si nécessaire)
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:8080",
};
