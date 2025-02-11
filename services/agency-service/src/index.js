const express = require('express');
const axios = require('axios');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3002;
const CACHE_SERVICE_URL = process.env.CACHE_SERVICE_URL || 'cache-service:3001';

// Cache data helper function
async function cacheData({ key, collection, fetchFn }) {
  try {
    const response = await axios.post(`http://${CACHE_SERVICE_URL}/api/cache`, {
      key,
      collection,
      data: await fetchFn()
    });
    return response.data;
  } catch (error) {
    console.error('Cache service error:', error);
    // Fallback to direct API call if cache fails
    return await fetchFn();
  }
}

app.use(express.json());

// Get all agencies
app.get('/api/agencies', async (req, res) => {
  try {
    console.log('Agency service: Fetching all agencies');
    const response = await axios.get(`${process.env.API_BASE}/admin/v1/agencies.json`);
    const agenciesData = response.data.agencies || [];
    res.json(agenciesData);
  } catch (error) {
    console.error('Error fetching agencies:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get agency by slug
app.get('/api/agencies/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const response = await axios.get(`${process.env.API_BASE}/admin/v1/agencies.json`);
    const agencies = response.data.agencies || [];
    const agency = agencies.find(a => a.slug === slug);
    
    if (!agency) {
      return res.status(404).json({ error: 'Agency not found' });
    }
    
    res.json(agency);
  } catch (error) {
    console.error('Error fetching agency:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Agency service running on port ${PORT}`);
}); 