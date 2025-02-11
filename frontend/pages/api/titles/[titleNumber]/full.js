import axios from 'axios';

const VERSIONER_SERVICE_URL = process.env.VERSIONER_SERVICE_URL || 'http://localhost:3004';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { titleNumber } = req.query;
  const { date } = req.query;

  try {
    const response = await axios.get(
      `${VERSIONER_SERVICE_URL}/api/titles/${titleNumber}/full`,
      { params: { date } }
    );
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching full title content:', error);
    res.status(500).json({ error: 'Failed to fetch title content' });
  }
} 