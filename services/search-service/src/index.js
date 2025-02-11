const express = require('express');
const axios = require('axios');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3003;
const CACHE_SERVICE_URL = process.env.CACHE_SERVICE_URL || 'http://cache-service:3001';

// Cache data helper function
async function cacheData({ key, collection, ttl = 300, fetchFn }) {
  try {
    // Ensure URL has protocol
    const cacheUrl = CACHE_SERVICE_URL.startsWith('http') 
      ? `${CACHE_SERVICE_URL}/api/cache`
      : `http://${CACHE_SERVICE_URL}/api/cache`;
    
    const response = await axios.post(cacheUrl, {
      key,
      collection,
      ttl,
      data: await fetchFn()
    });
    return response.data;
  } catch (error) {
    console.error('Cache service error:', error);
    if (error.response) {
      console.error('Cache service response:', {
        status: error.response.status,
        data: error.response.data
      });
    } else {
      console.error('Cache service connection error:', {
        url: CACHE_SERVICE_URL,
        message: error.message
      });
    }
    return await fetchFn();
  }
}

app.use(express.json());

// Search endpoint
app.get('/api/search', async (req, res) => {
  try {
    const { query, agency_slugs = [], page = 1, per_page = 10 } = req.query;

    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    // Create cache key based on all search parameters
    const cacheKey = `search_${query}_${agency_slugs.join(',')}_${page}_${per_page}`;

    try {
      const response = await cacheData({
        key: cacheKey,
        collection: 'Search',
        ttl: 300, // 5 minutes
        fetchFn: async () => {
          const params = {
            query,
            ...(agency_slugs.length > 0 && { agency_slugs }),
            page,
            per_page
          };

          console.log('Search service: Performing search with params:', params);
          const response = await axios.get(`${process.env.API_BASE}/search`, { params });
          return response.data;
        }
      });

      res.json(response);
    } catch (error) {
      throw error;
    }
  } catch (error) {
    console.error('Search error:', error);
    res.status(error.response?.status || 500).json({
      error: error.message,
      details: error.response?.data || 'No additional details'
    });
  }
});

// Get correction counts
app.get('/api/search/counts/titles', async (req, res) => {
  try {
    const { agency_slugs = [] } = req.query;

    // Create cache key based on agency slugs
    const cacheKey = `counts_${agency_slugs.join(',')}`;

    try {
      const response = await cacheData({
        key: cacheKey,
        collection: 'Search',
        ttl: 300, // 5 minutes
        fetchFn: async () => {
          // Format params to match expected URL structure
          const params = new URLSearchParams();
          agency_slugs.forEach(slug => {
            params.append('agency_slugs[]', slug);
          });

          console.log('Search service: Fetching counts with params:', params.toString());
          const response = await axios.get(
            `${process.env.API_BASE}/search/v1/count`, 
            { 
              params: params,
              paramsSerializer: params => params.toString() // Prevent axios from encoding brackets
            }
          );

          // Transform the response to match expected format
          return {
            counts: [], // Keep empty array for backward compatibility
            total: response.data.meta.total_count
          };
        }
      });

      res.json(response);
    } catch (error) {
      if (error.response?.status === 404) {
        // Return empty counts if no data found
        return res.json({
          counts: [],
          total: 0
        });
      }
      throw error;
    }
  } catch (error) {
    console.error('Error fetching counts:', error);
    res.status(error.response?.status || 500).json({
      error: error.message,
      details: error.response?.data || 'No additional details'
    });
  }
});

// Search results endpoint
app.get('/api/search/v1/results', async (req, res) => {
  try {
    const { query, agency } = req.query;
    console.log('Search service: Processing request:', {
      endpoint: '/api/search/v1/results',
      query,
      agency,
      apiBase: process.env.API_BASE
    });

    // Transform parameters to match API expectations
    const params = {
      query,
      agency_slugs: agency ? [agency] : [], // Convert agency to agency_slugs array
      page: 1,
      per_page: 20
    };

    const apiUrl = `${process.env.API_BASE}/search/v1/results`;
    console.log('Making request to:', apiUrl, 'with params:', params);

    const response = await axios.get(apiUrl, { params });

    console.log('Received response:', response.data);
    res.json(response.data);
  } catch (error) {
    console.error('Search error:', error);
    if (error.response) {
      console.error('API Error response:', {
        status: error.response.status,
        data: error.response.data,
        config: {
          url: error.config.url,
          params: error.config.params
        }
      });
    }
    res.status(error.response?.status || 500).json({ 
      error: 'Search failed',
      details: error.response?.data || error.message
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Search service running on port ${PORT}`);
}); 