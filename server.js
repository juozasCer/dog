const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

let isConnected = false; // track connection status

// Connect to MongoDB Atlas function
async function connectToDatabase() {
  if (isConnected) {
    return; // reuse existing database connection
  }

  try {
    await mongoose.connect('mongodb+srv://cerjuozas:c3fjrfoqvHkYYxjx@cluster1.lsiee.mongodb.net/?retryWrites=true&w=majority&appName=Cluster1', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    isConnected = true;
    console.log('Connected to MongoDB Atlas');
  } catch (error) {
    console.error('Error connecting to MongoDB Atlas:', error);
  }
}

// Define Schema and Model
const playerSchema = new mongoose.Schema({
  name: String,
  score: Number,
});

const Player = mongoose.model('Player', playerSchema);

// Routes
app.get('/api/leaderboard', async (req, res) => {
  await connectToDatabase(); // ensure connection before handling request
  try {
    const players = await Player.find().sort({ score: -1 }).limit(5); // Top 5 players
    res.json(players);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/leaderboard', async (req, res) => {
  await connectToDatabase(); // ensure connection before handling request

  const player = new Player({
    name: req.body.name,
    score: req.body.score,
  });

  try {
    const newPlayer = await player.save();
    res.status(201).json(newPlayer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Export the app for Vercel's serverless handler
module.exports = app;
