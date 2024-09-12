export default function handler(req, res) {
  if (req.method === 'GET') {
    console.log('Fetching spawn rate');
    res.status(200).json({ spawnRate: 0.05 });
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
