import axios from 'axios';

const AGENCY_SERVICE_URL = process.env.AGENCY_SERVICE_URL || 'http://localhost:3002';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { slug } = req.query;

  try {
    const response = await axios.get(`${AGENCY_SERVICE_URL}/api/agencies/${slug}`);
    res.json(response.data);
  } catch (error) {
    if (error.response?.status === 404) {
      return res.status(404).json({ error: 'Agency not found' });
    }
    console.error('Error fetching agency:', error);
    res.status(500).json({ error: 'Failed to fetch agency' });
  }
} 