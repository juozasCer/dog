// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');

// const app = express();
// app.use(cors());
// app.use(express.json());

// mongoose.connect(process.env.MONGO_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// });

// const db = mongoose.connection;
// db.on('error', console.error.bind(console, 'connection error:'));
// db.once('open', () => {
//   console.log('Connected to MongoDB Atlas');
// });

// // Define schema with a unique index for player names
// const playerSchema = new mongoose.Schema({
//   name: { type: String, unique: true },
//   score: { type: Number, default: 0 }
// });

// const Player = mongoose.model('Player', playerSchema);

// // GET endpoint to retrieve leaderboard
// app.get('/api/leaderboard', async (req, res) => {
//   try {
//     // Find all players, sort by score in descending order, and limit to top 5
//     const players = await Player.find().sort({ score: -1 }).limit(5);
//     res.json(players);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// // POST endpoint to submit scores
// app.post('/api/leaderboard', async (req, res) => {
//   const { name, score } = req.body;

//   try {
//     // Find player by name and update score if new score is higher
//     const player = await Player.findOne({ name });

//     if (player) {
//       // Update player score only if the new score is higher
//       if (score > player.score) {
//         player.score = score;
//         await player.save();
//       }
//     } else {
//       // Create a new player document
//       const newPlayer = new Player({ name, score });
//       await newPlayer.save();
//     }

//     res.status(201).json({ name, score });
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// });

// module.exports = app;
