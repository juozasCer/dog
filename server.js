// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// require('dotenv').config(); // Load environment variables from .env file

// const app = express();
// app.use(cors());
// app.use(express.json());

// const MONGO_URI = process.env.MONGO_URI;

// mongoose.connect(MONGO_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// });

// const db = mongoose.connection;
// db.on('error', console.error.bind(console, 'connection error:'));
// db.once('open', () => {
//   console.log('Connected to MongoDB Atlas');
// });

// const playerSchema = new mongoose.Schema({
//   name: String,
//   score: Number
// });

// const Player = mongoose.model('Player', playerSchema);

// app.get('/api/leaderboard', async (req, res) => {
//   try {
//     const players = await Player.find().sort({ score: -1 }).limit(5);
//     res.json(players);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// app.post('/api/leaderboard', async (req, res) => {
//   const player = new Player({
//     name: req.body.name,
//     score: req.body.score
//   });

//   try {
//     const newPlayer = await player.save();
//     res.status(201).json(newPlayer);
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// });

// module.exports = app;
