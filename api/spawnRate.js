const express = require('express');
const router = express.Router();

router.get('/api/spawnRate', (req, res) => {
  console.log('Fetching spawn rate');
  res.json({ spawnRate: 0.05 });
});

module.exports = router;