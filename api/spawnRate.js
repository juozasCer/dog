// spawnRate.js

const express = require('express');
const router = express.Router();

// GET endpoint to retrieve spawn rate
router.get('/spawnRate', (req, res) => {
  // Return a fixed spawn rate (e.g., 0.05) for simplicity
  console.log('Fetching spawn rate');
  res.json({ spawnRate: 0.05 });
});

module.exports = router;
