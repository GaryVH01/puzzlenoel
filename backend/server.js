const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" })); // Augmenter la limite pour les images

// Connexion MongoDB
mongoose.connect(
  process.env.MONGODB_URI || "mongodb://localhost:27017/puzzle",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

// Schéma MongoDB simple
const puzzleSchema = new mongoose.Schema(
  {
    puzzleId: { type: String, required: true, unique: true, index: true },
    img: String,
    msg: String,
    size: Number,
    type: String,
    t: Number, // timestamp
    p: String, // password hash
    expires: Number,
    createdAt: { type: Date, default: Date.now, expires: 86400 }, // Auto-suppression après 24h
  },
  { timestamps: true }
);

const Puzzle = mongoose.model("Puzzle", puzzleSchema);

// Route pour créer un puzzle
app.post("/api/puzzle", async (req, res) => {
  try {
    const { puzzleId, img, msg, size, type, t, p, expires } = req.body;

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

    await puzzle.save();

    res.json({ success: true, puzzleId });
  } catch (error) {
    if (error.code === 11000) {
      // ID déjà existant, générer un nouveau
      res.status(409).json({ error: "ID déjà utilisé, réessayez" });
    } else {
      console.error("Erreur création puzzle:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  }
});

// Route pour récupérer un puzzle
app.get("/api/puzzle/:puzzleId", async (req, res) => {
  try {
    const { puzzleId } = req.params;

    const puzzle = await Puzzle.findOne({ puzzleId });

    if (!puzzle) {
      return res.status(404).json({ error: "Puzzle introuvable" });
    }

    // Vérifier l'expiration
    if (puzzle.expires && puzzle.expires < Date.now()) {
      await Puzzle.deleteOne({ puzzleId });
      return res.status(410).json({ error: "Puzzle expiré" });
    }

    res.json({
      img: puzzle.img,
      msg: puzzle.msg,
      size: puzzle.size,
      type: puzzle.type,
      t: puzzle.t,
      p: puzzle.p,
    });
  } catch (error) {
    console.error("Erreur récupération puzzle:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Route de santé
app.get("/health", (req, res) => {
  res.json({ status: "OK" });
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
});
