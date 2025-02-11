const express = require('express');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3005;

app.use(express.json());

// Get all corrections with optional filters
app.get('/api/corrections', async (req, res) => {
  try {
    const { date, title, error_corrected_date } = req.query;
    console.log('Corrections service: Fetching corrections with params:', { date, title, error_corrected_date });
    
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

// Get corrections by title
app.get('/api/corrections/title/:title', async (req, res) => {
  try {
    const { title } = req.params;
    console.log('Corrections service: Fetching corrections for title:', title);
    
    const response = await axios.get(`${process.env.API_BASE}/admin/v1/corrections/title/${title}.json`);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching title corrections:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Corrections service running on port ${PORT}`);
}); 