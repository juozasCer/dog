const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB Atlas
mongoose.connect('mongodb+srv://cerjuozas:c3fjrfoqvHkYYxjx@cluster1.lsiee.mongodb.net/?retryWrites=true&w=majority&appName=Cluster1', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB Atlas');
});

// Define Schema and Model
const playerSchema = new mongoose.Schema({
  name: String,
  score: Number
});

const Player = mongoose.model('Player', playerSchema);

// Routes
app.get('/leaderboard', async (req, res) => {
  try {
    const players = await Player.find().sort({ score: -1 }).limit(5); // Top 10 players
    res.json(players);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/leaderboard', async (req, res) => {
  const player = new Player({
    name: req.body.name,
    score: req.body.score
  });

  try {
    const newPlayer = await player.save();
    res.status(201).json(newPlayer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
