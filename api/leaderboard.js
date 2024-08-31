const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB Atlas');
});

const playerSchema = new mongoose.Schema({
  name: { type: String, unique: true },
  score: Number
});

// Create a unique index on 'name' to enforce single entry per player
playerSchema.index({ name: 1 }, { unique: true });

const Player = mongoose.model('Player', playerSchema);

app.get('/api/leaderboard', async (req, res) => {
  try {
    // Find all players, sort by score in descending order, and limit to top 5
    const players = await Player.find().sort({ score: -1 }).limit(5);
    res.json(players);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/leaderboard', async (req, res) => {
  const { name, score } = req.body;

  try {
    // Upsert: Update if the player exists with a higher score, otherwise create a new player
    const result = await Player.findOneAndUpdate(
      { name },
      { $max: { score } },  // Only update if the new score is higher
      { upsert: true, new: true }
    );

    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = app;
