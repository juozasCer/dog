// GET endpoint to retrieve spawn rate
app.get('', (req, res) => {
  // Return a fixed spawn rate (e.g., 0.05) for simplicity
  console.log('Fetching spawn rate');
  res.json({ spawnRate: 0.05 });
});