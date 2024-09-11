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

// GET endpoint to retrieve leaderboard
app.get('/api/leaderboard', async (req, res) => {
  try {
    const players = await Player.find().sort({ score: -1 }).limit(5); // Sort by score descending
    res.json(players);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST endpoint to submit scores
app.post('/api/leaderboard', async (req, res) => {
  const { name, inputs } = req.body;

  // Ensure the inputs from the client are valid (e.g., coordinates, actions)
  if (!validateInputs(inputs)) {
    return res.status(400).json({ message: 'Invalid game data' });
  }

  // Calculate score on the server based on valid inputs
  const calculatedScore = calculateScore(inputs);

  try {
    const player = await Player.findOne({ name });

    if (player) {
      // Update score if the new calculated score is higher
      if (calculatedScore > player.score) {
        player.score = calculatedScore;
        await player.save();
      }
    } else {
      // Create a new player if they don't exist
      const newPlayer = new Player({ name, score: calculatedScore });
      await newPlayer.save();
    }

    res.status(201).json({ name, score: calculatedScore });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Utility function to validate game inputs (e.g., player movement, block collection, etc.)
function validateInputs(inputs) {
  // Perform validation of the inputs here
  // For instance, check if inputs contain valid coordinates, timestamps, etc.
  return true; // For demonstration purposes, assume inputs are valid
}

// Calculate score on the server based on inputs (e.g., blocks dodged, collected, etc.)
function calculateScore(inputs) {
  let score = 0;

  // Example scoring logic: Increment score based on the number of blocks dodged or collected
  inputs.forEach(input => {
    if (input.action === 'collect') {
      score += 10; // Example: Award 10 points for each block collected
    }
  });

  return score;
}

module.exports = app;
