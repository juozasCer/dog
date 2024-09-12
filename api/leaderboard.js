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
  score: { type: Number, default: 0 }
});

const Player = mongoose.model('Player', playerSchema);

// GET endpoint to retrieve leaderboard
app.get('/api/leaderboard', async (req, res) => {
  try {
    const players = await Player.find().sort({ score: -1 }).limit(5);
    res.json(players);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST endpoint to submit scores
app.post('/api/leaderboard', async (req, res) => {
  const { name, inputs } = req.body;

  try {
    let score = 0;
    inputs.forEach(input => {
      if (input.event === 'blockCollected') {
        score += input.value;
      }
    });

    const player = await Player.findOne({ name });

    if (player) {
      if (score > player.score) {
        player.score = score;
        await player.save();
      }
    } else {
      const newPlayer = new Player({ name, score });
      await newPlayer.save();
    }

    res.status(201).json({ name, score });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// GET endpoint to retrieve spawn rate
/*app.get('/api/spawnRate', (req, res) => {
  console.log('Fetching spawn rate');
  res.json({ spawnRate: 0.05 });
});*/

module.exports = app;


