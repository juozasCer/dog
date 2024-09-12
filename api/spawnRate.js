const express = require('express');
const router = express.Router();

router.get('/api/spawnRate', (req, res) => {
  console.log('Fetching spawn rate');
  res.json({ spawnRate: 1 });
});

module.exports = router;