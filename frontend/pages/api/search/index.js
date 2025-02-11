import axios from 'axios';

const SEARCH_SERVICE_URL = process.env.SEARCH_SERVICE_URL || 'http://localhost:3003';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const response = await axios.get(`${SEARCH_SERVICE_URL}/api/search`, {
      params: req.query
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error performing search:', error);
    res.status(500).json({ error: 'Search failed' });
  }
} 