import axios from 'axios';

const VERSIONER_SERVICE_URL = process.env.VERSIONER_SERVICE_URL || 'http://localhost:3004';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { titleNumber } = req.query;
  const { date } = req.query;

  try {
    // Fetch all title data in parallel
    const [structure, ancestry, versions] = await Promise.all([
      axios.get(`${VERSIONER_SERVICE_URL}/api/titles/${titleNumber}/structure`, {
        params: { date }
      }),
      axios.get(`${VERSIONER_SERVICE_URL}/api/titles/${titleNumber}/ancestry`, {
        params: { date }
      }),
      axios.get(`${VERSIONER_SERVICE_URL}/api/titles/${titleNumber}/versions`, {
        params: { date }
      })
    ]);

    res.json({
      structure: structure.data,
      ancestry: ancestry.data,
      versions: versions.data
    });
  } catch (error) {
    console.error('Error fetching title data:', error);
    res.status(500).json({ error: 'Failed to fetch title data' });
  }
} 