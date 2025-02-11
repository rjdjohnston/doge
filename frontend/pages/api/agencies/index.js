import axios from 'axios';

// Use Docker DNS resolver with new subnet
const API_GATEWAY_URL = process.env.API_GATEWAY_URL || 'http://172.28.0.1:3000';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Frontend API: Fetching agencies from:', `${API_GATEWAY_URL}/api/agencies`);
    const response = await axios.get(`${API_GATEWAY_URL}/api/agencies`, {
      headers: {
        'Host': 'api-gateway'
      }
    });
    console.log('Frontend API: Response:', response.data);
    const agencies = Array.isArray(response.data) ? response.data : [];
    res.json(agencies);
  } catch (error) {
    console.error('Frontend API Error:', error);
    console.error('Error details:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Failed to fetch agencies',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
} 