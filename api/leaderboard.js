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

// Define schema with a unique index for player names
const playerSchema = new mongoose.Schema({
  name: { type: String, unique: true },
  score: { type: Number, default: 0 }
});

const Player = mongoose.model('Player', playerSchema);

// Start game and reset the score
app.post('/api/startGame', async (req, res) => {
  const { name } = req.body;

  try {
    const player = await Player.findOne({ name });

    if (player) {
      player.score = 0; // Reset score at the start of the game
      await player.save();
    } else {
      const newPlayer = new Player({ name });
      await newPlayer.save();
    }

    res.status(200).json({ message: 'Game started' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Handle collision and update the score
app.post('/api/collision', async (req, res) => {
  const { name } = req.body;

  try {
    const player = await Player.findOne({ name });

    if (player) {
      player.score += 10; // Increase score by 10 per collision
      await player.save();

      res.status(200).json({ score: player.score });
    } else {
      res.status(404).json({ message: 'Player not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Handle game over
app.post('/api/gameOver', async (req, res) => {
  const { name } = req.body;

  try {
    const player = await Player.findOne({ name });

    if (player) {
      // Keep the score as is and return it
      res.status(200).json({ score: player.score });
    } else {
      res.status(404).json({ message: 'Player not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get the leaderboard
app.get('/api/leaderboard', async (req, res) => {
  try {
    const players = await Player.find().sort({ score: -1 }).limit(5);
    res.json(players);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = app;
