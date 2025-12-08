const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware CORS - Autoriser toutes les origines (y compris null pour fichiers locaux)
app.use(
  cors({
    origin: "*", // Autoriser toutes les origines
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  })
);
app.use(express.json({ limit: "10mb" })); // Augmenter la limite pour les images

// Connexion MongoDB
let mongoConnected = false;

// Fonction pour connecter à MongoDB avec retry
async function connectMongoDB() {
  const mongoUri =
    process.env.MONGODB_URI || "mongodb://localhost:27017/puzzle";

  if (!process.env.MONGODB_URI) {
    console.warn(
      "⚠️ MONGODB_URI non définie, utilisation de la valeur par défaut (localhost)"
    );
  }

  try {
    // Vérifier le format de l'URI
    if (mongoUri.includes("mongodb+srv://")) {
      console.log("📡 Connexion à MongoDB Atlas (SRV)...");
    } else if (mongoUri.includes("mongodb://")) {
      console.log("📡 Connexion à MongoDB (standard)...");
    } else {
      console.warn(
        "⚠️ Format d'URI MongoDB suspect:",
        mongoUri.substring(0, 20) + "..."
      );
    }

    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000, // Timeout de 30 secondes
      socketTimeoutMS: 60000, // Timeout socket de 60 secondes
      connectTimeoutMS: 30000, // Timeout de connexion de 30 secondes
      // Retry logic
      retryWrites: true,
      w: "majority",
      // Buffer commands si pas connecté
      bufferMaxEntries: 0, // Désactiver le buffering pour éviter les timeouts
    };

    // Options SSL pour MongoDB Atlas
    if (mongoUri.includes("mongodb+srv://")) {
      options.ssl = true;
      options.sslValidate = true;
      // Désactiver la validation stricte si problème SSL (à utiliser avec précaution)
      // options.tlsAllowInvalidCertificates = false; // Ne pas activer en production
    }

    await mongoose.connect(mongoUri, options);

    mongoConnected = true;
    console.log("✅ Connecté à MongoDB");
  } catch (error) {
    console.error("❌ Erreur de connexion MongoDB:", error.message);
    console.error(
      "⚠️ Le serveur démarre quand même, mais MongoDB n'est pas disponible"
    );
    console.error("💡 Vérifiez :");
    console.error("   - La variable MONGODB_URI est correcte");
    console.error(
      "   - MongoDB Atlas autorise les connexions (Network Access)"
    );
    console.error("   - Les credentials sont corrects");
    mongoConnected = false;

    // Essayer de reconnecter après 10 secondes
    setTimeout(() => {
      console.log("🔄 Tentative de reconnexion MongoDB...");
      connectMongoDB();
    }, 10000);
  }
}

// Démarrer la connexion
connectMongoDB();

// Gestion des événements MongoDB
mongoose.connection.on("disconnected", () => {
  mongoConnected = false;
  console.warn("⚠️ MongoDB déconnecté");
  // Tenter de reconnecter
  setTimeout(() => {
    if (!mongoConnected) {
      console.log("🔄 Tentative de reconnexion MongoDB...");
      connectMongoDB();
    }
  }, 5000);
});

mongoose.connection.on("reconnected", () => {
  mongoConnected = true;
  console.log("✅ MongoDB reconnecté");
});

mongoose.connection.on("error", (error) => {
  console.error("❌ Erreur MongoDB:", error.message);
  mongoConnected = false;
});

// Schéma MongoDB simple
const puzzleSchema = new mongoose.Schema(
  {
    puzzleId: { type: String, required: true, unique: true, index: true },
    img: { type: String, required: true }, // Image en base64
    msg: String,
    size: Number,
    type: String,
    t: Number, // timestamp
    p: String, // password hash
    expires: Number,
    createdAt: { type: Date, default: Date.now, expires: 86400 }, // Auto-suppression après 24h
  },
  {
    timestamps: true,
    // Optimisations pour les gros documents
    bufferCommands: false, // Désactiver le buffering pour éviter les timeouts
    autoIndex: true,
  }
);

const Puzzle = mongoose.model("Puzzle", puzzleSchema);

// Route pour créer un puzzle
app.post("/api/puzzle", async (req, res) => {
  try {
    // Vérifier la connexion MongoDB
    if (!mongoConnected || mongoose.connection.readyState !== 1) {
      console.error("❌ MongoDB non connecté");
      return res.status(503).json({
        error: "Service temporairement indisponible",
        message:
          "La base de données n'est pas accessible. Vérifiez la variable MONGODB_URI.",
      });
    }

    const { puzzleId, img, msg, size, type, t, p, expires } = req.body;

    if (!puzzleId) {
      return res.status(400).json({ error: "puzzleId requis" });
    }

    const imgSize = img ? img.length : 0;
    console.log(
      `📝 Création puzzle: ${puzzleId} (img: ${imgSize} chars, ~${Math.round(
        imgSize / 1024
      )} KB)`
    );

    // Vérifier la taille de l'image (MongoDB a une limite de 16MB par document)
    if (imgSize > 15 * 1024 * 1024) {
      console.error(
        `❌ Image trop grande: ${Math.round(imgSize / 1024 / 1024)} MB`
      );
      return res.status(413).json({
        error: "Image trop grande",
        message:
          "L'image dépasse la limite de 15 MB. Veuillez utiliser une image plus petite.",
      });
    }

    // Créer le puzzle avec timeout augmenté
    const puzzle = new Puzzle({
      puzzleId,
      img,
      msg,
      size,
      type,
      t,
      p,
      expires,
    });

    // Utiliser un timeout personnalisé pour l'opération save
    const savePromise = puzzle.save();
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error("Timeout: opération trop longue")),
        60000
      )
    );

    await Promise.race([savePromise, timeoutPromise]);

    console.log(`✅ Puzzle créé avec succès: ${puzzleId}`);
    res.json({ success: true, puzzleId });
  } catch (error) {
    if (error.code === 11000) {
      // ID déjà existant, générer un nouveau
      console.warn(`⚠️ ID déjà utilisé: ${req.body.puzzleId}`);
      res.status(409).json({ error: "ID déjà utilisé, réessayez" });
    } else if (error.message.includes("Timeout")) {
      console.error("❌ Timeout lors de la sauvegarde:", error);
      res.status(504).json({
        error: "Timeout",
        message:
          "L'opération a pris trop de temps. L'image est peut-être trop grande.",
      });
    } else {
      console.error("❌ Erreur création puzzle:", error);
      res.status(500).json({ error: "Erreur serveur", details: error.message });
    }
  }
});

// Route pour récupérer un puzzle
app.get("/api/puzzle/:puzzleId", async (req, res) => {
  try {
    // Vérifier la connexion MongoDB
    if (!mongoConnected || mongoose.connection.readyState !== 1) {
      console.error("❌ MongoDB non connecté");
      return res.status(503).json({
        error: "Service temporairement indisponible",
        message:
          "La base de données n'est pas accessible. Vérifiez la variable MONGODB_URI.",
      });
    }

    const { puzzleId } = req.params;
    console.log(`🔍 Recherche puzzle: ${puzzleId}`);

    const puzzle = await Puzzle.findOne({ puzzleId });

    if (!puzzle) {
      console.log(`❌ Puzzle introuvable: ${puzzleId}`);
      return res.status(404).json({ error: "Puzzle introuvable" });
    }

    // Vérifier l'expiration
    if (puzzle.expires && puzzle.expires < Date.now()) {
      console.log(`⏰ Puzzle expiré: ${puzzleId}`);
      await Puzzle.deleteOne({ puzzleId });
      return res.status(410).json({ error: "Puzzle expiré" });
    }

    console.log(`✅ Puzzle trouvé: ${puzzleId}`);
    res.json({
      img: puzzle.img,
      msg: puzzle.msg,
      size: puzzle.size,
      type: puzzle.type,
      t: puzzle.t,
      p: puzzle.p,
    });
  } catch (error) {
    console.error("❌ Erreur récupération puzzle:", error);
    res.status(500).json({ error: "Erreur serveur", details: error.message });
  }
});

// Route de santé
app.get("/health", (req, res) => {
  const mongoStatus = mongoConnected && mongoose.connection.readyState === 1;
  res.json({
    status: mongoStatus ? "OK" : "DEGRADED",
    timestamp: new Date().toISOString(),
    mongodb: mongoStatus ? "connected" : "disconnected",
  });
});

// Route racine pour vérifier que le serveur fonctionne
app.get("/", (req, res) => {
  res.json({
    message: "Puzzle Backend API",
    status: "running",
    endpoints: {
      health: "/health",
      create: "POST /api/puzzle",
      get: "GET /api/puzzle/:puzzleId",
    },
  });
});

// Démarrer le serveur
// Sur Render, écouter sur 0.0.0.0 pour accepter les connexions externes
const HOST = process.env.HOST || "0.0.0.0";

app.listen(PORT, HOST, () => {
  console.log(`🚀 Serveur démarré sur ${HOST}:${PORT}`);
  console.log(
    `📡 MongoDB URI configurée: ${process.env.MONGODB_URI ? "Oui" : "Non"}`
  );

  if (!process.env.MONGODB_URI) {
    console.warn("⚠️ ATTENTION: MONGODB_URI n'est pas définie !");
    console.warn(
      "⚠️ Le serveur fonctionne mais ne pourra pas stocker de données."
    );
  }
});
