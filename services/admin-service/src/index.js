const express = require('express');
const axios = require('axios');
const mongoose = require('mongoose');
const Correction = require('./models/correction');

const app = express();
const PORT = process.env.PORT || 3006;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://mongodb:27017/ecfr';

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

app.use(express.json());

// Get all agencies
app.get('/api/agencies', async (req, res) => {
  try {
    console.log('Admin service: Fetching all agencies');
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

// Get all corrections with optional filters
app.get('/api/corrections', async (req, res) => {
  try {
    const { date, title, error_corrected_date } = req.query;
    console.log('Admin service: Fetching corrections with params:', { date, title, error_corrected_date });
    
    const response = await axios.get(`${process.env.API_BASE}/admin/v1/corrections.json`, {
      params: {
        date,
        title,
        error_corrected_date
      }
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching corrections:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get corrections for a specific title
app.get('/api/corrections/title/:titleNumber', async (req, res) => {
  try {
    const { titleNumber } = req.params;
    console.log('Fetching corrections for title:', titleNumber);

    // Fetch from external API first
    const response = await axios.get(
      `${process.env.API_BASE}/admin/v1/corrections/title/${titleNumber}.json`
    );

    // Check if we have corrections
    if (!response.data.ecfr_corrections || response.data.ecfr_corrections.length === 0) {
      console.log('No corrections found in API response');
      return res.json({ ecfr_corrections: [] });
    }

    // Store in MongoDB - store exactly as received
    try {
      await Correction.deleteMany({ title: parseInt(titleNumber) });
      if (response.data.ecfr_corrections.length > 0) {
        await Correction.insertMany(response.data.ecfr_corrections);
        console.log(`Stored ${response.data.ecfr_corrections.length} corrections in database`);
      }
    } catch (dbError) {
      console.error('Database operation failed:', dbError);
      // Continue even if DB operations fail
    }

    // Send the API response directly without transformation
    res.json(response.data);

  } catch (error) {
    console.error('Error fetching from API:', error);
    
    // Try to get from database if API fails
    try {
      console.log('Attempting to fetch from database');
      const dbCorrections = await Correction.find({ 
        title: parseInt(titleNumber) 
      })
      .sort({ error_corrected: -1 })
      .lean(); // Convert to plain objects

      console.log(`Found ${dbCorrections.length} corrections in database`);
      res.json({ ecfr_corrections: dbCorrections });
    } catch (dbError) {
      console.error('Database fetch failed:', dbError);
      res.status(500).json({ error: error.message });
    }
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Admin service running on port ${PORT}`);
}); 