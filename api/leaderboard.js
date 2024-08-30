const mongoose = require('mongoose');

// Connect to MongoDB Atlas
const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI, {
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

module.exports = async (req, res) => {
  if (req.method === 'GET') {
    try {
      const players = await Player.find().sort({ score: -1 }).limit(10); // Top 10 players
      res.status(200).json(players);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  } else if (req.method === 'POST') {
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
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};
