const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: 'https://dog-blush-six.vercel.app',
}));
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Schema and model for leaderboard
const leaderboardSchema = new mongoose.Schema({
  name: String,
  score: Number
});
const Leaderboard = mongoose.model('Leaderboard', leaderboardSchema);

// Routes
app.get('/leaderboard', async (req, res) => {
  try {
    const leaders = await Leaderboard.find().sort({ score: -1 }).limit(10);
    res.json(leaders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/leaderboard', async (req, res) => {
  const { name, score } = req.body;
  try {
    const newEntry = new Leaderboard({ name, score });
    await newEntry.save();
    res.status(201).json(newEntry);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
