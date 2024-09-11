const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config(); // Load environment variables from .env file

const app = express();
app.use(cors());
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB Atlas');
});

// Define the Player schema
const playerSchema = new mongoose.Schema({
  name: { type: String, unique: true },
  score: Number,
  position: { x: Number, y: Number }  // Add player position for game logic
});

const Player = mongoose.model('Player', playerSchema);

// Route to get the leaderboard
app.get('/api/leaderboard', async (req, res) => {
  try {
    const players = await Player.find().sort({ score: -1 }).limit(5);
    res.json(players);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route to submit or update player score
app.post('/api/leaderboard', async (req, res) => {
  try {
    // Update existing player's score or create a new entry
    const player = await Player.findOneAndUpdate(
      { name: req.body.name },
      { score: req.body.score },
      { new: true, upsert: true }
    );
    res.status(201).json(player);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Route to handle player actions (moveLeft, moveRight, catchBlock)
app.post('/api/player-action', async (req, res) => {
  const { playerName, action } = req.body;

  try {
    let player = await Player.findOne({ name: playerName });

    // If the player doesn't exist, create one
    if (!player) {
      player = new Player({ name: playerName, score: 0, position: { x: 0, y: 0 } });
    }

    // Update player position and score based on the action
    if (action === 'moveLeft') {
      player.position.x -= 5;
    } else if (action === 'moveRight') {
      player.position.x += 5;
    } else if (action === 'catchBlock') {
      player.score += 10;
    }

    await player.save();

    res.json({ player });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Export the app
module.exports = app;
