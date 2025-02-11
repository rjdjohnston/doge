const express = require('express');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3004;
const CACHE_SERVICE_URL = process.env.CACHE_SERVICE_URL || 'http://cache-service:3001';

// Cache data helper function
async function cacheData({ key, collection, ttl = 10800, fetchFn }) {
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
        data: error.response.data,
        url: error.config?.url,
        method: error.config?.method
      });
    } else {
      console.error('Cache service connection error:', {
        url: CACHE_SERVICE_URL,
        message: error.message
      });
    }
    // Fallback to direct API call if cache fails
    return await fetchFn();
  }
}

app.use(express.json());

// Get all titles (summary information)
app.get('/api/titles', async (req, res) => {
  try {
    const cacheKey = 'titles_list';
    
    try {
      const response = await cacheData({
        key: cacheKey,
        collection: 'Title',
        ttl: 10800, // 3 hours
        fetchFn: async () => {
          console.log('Versioner service: Fetching all titles');
          const url = `${process.env.API_BASE}/versioner/v1/titles.json`;
          console.log('Versioner service: Making request to:', url);
          
          const response = await axios.get(url);
          // console.log('Versioner service: Response from eCFR:', response.data);
          return response.data;
        }
      });

      res.json(response);
    } catch (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error fetching titles:', error);
    console.error('Failed request details:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data
    });
    res.status(500).json({ 
      error: error.message,
      details: error.response?.data || 'No additional details'
    });
  }
});

// Get title structure
app.get('/api/titles/:titleNumber/structure', async (req, res) => {
  try {
    const { titleNumber } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ error: 'Missing required date parameter' });
    }

    const cacheKey = `title_structure_${titleNumber}_${date}`;
    
    try {
      const response = await cacheData({
        key: cacheKey,
        collection: 'Title',
        ttl: 10800, // 3 hours
        fetchFn: async () => {
          // First, get the title information to check latest_issue_date
          const titleUrl = `${process.env.API_BASE}/versioner/v1/titles.json`;
          console.log('Versioner service: Fetching title info from:', titleUrl);
          
          const titleResponse = await cacheData({
            key: `titles_${titleUrl}`,
            collection: 'Title',
            ttl: 10800,
            fetchFn: async () => {
              const response = await axios.get(titleUrl);
              return response.data;
            }
          });
          
          const title = titleResponse.titles.find(t => t.number === parseInt(titleNumber));
          
          if (!title) {
            throw new Error('Title not found');
          }

          // Compare dates and use the appropriate one
          const requestDate = new Date(date);
          const latestIssueDate = new Date(title.latest_issue_date);
          const dateToUse = requestDate > latestIssueDate ? 
            title.latest_issue_date : 
            date;

          const structureUrl = `${process.env.API_BASE}/versioner/v1/structure/${dateToUse}/title-${titleNumber}.json`;
          console.log('Versioner service: Making request to:', structureUrl);

          const structureResponse = await cacheData({
            key: `structure_${structureUrl}`,
            collection: 'Title',
            ttl: 10800, // 3 hours
            fetchFn: async () => {
              const response = await axios.get(structureUrl);
              return response.data;
            }
          });

          return structureResponse;
        }
      });

      res.json(response);
    } catch (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error fetching title structure:', error);
    res.status(error.response?.status || 500).json({ 
      error: error.message,
      details: error.response?.data || 'No additional details'
    });
  }
});

// Get title ancestry
app.get('/api/titles/:titleNumber/ancestry', async (req, res) => {
  try {
    const { titleNumber } = req.params;
    const { 
      date,
      subtitle,
      chapter,
      subchapter,
      part,
      subpart,
      section,
      appendix 
    } = req.query;

    if (!date) {
      return res.status(400).json({ error: 'Missing required date parameter' });
    }

    // Validate parameter dependencies
    if (subchapter && !chapter) {
      return res.status(400).json({ error: 'Subchapter requires chapter parameter' });
    }
    if (subpart && !part) {
      return res.status(400).json({ error: 'Subpart requires part parameter' });
    }
    if (section && !part) {
      return res.status(400).json({ error: 'Section requires part parameter' });
    }
    if (appendix && !subtitle && !chapter && !part) {
      return res.status(400).json({ error: 'Appendix requires subtitle, chapter, or part parameter' });
    }

    // Format parameters according to requirements
    const params = {
      ...(subtitle && { subtitle: subtitle.toUpperCase() }),
      ...(chapter && { chapter: chapter.toUpperCase() }), // Assuming roman numerals are already correct
      ...(subchapter && { subchapter: subchapter.toUpperCase() }),
      ...(part && { part }),
      ...(subpart && { subpart }),
      ...(section && { section }),
      ...(appendix && { appendix })
    };

    console.log('Versioner service: Fetching ancestry for title:', {
      titleNumber,
      date,
      params
    });

    const url = `${process.env.API_BASE}/versioner/v1/ancestry/${date}/title-${titleNumber}.json`;
    console.log('Versioner service: Making request to:', url, 'with params:', params);

    const response = await cacheData({
      key: `ancestry_${url}_${JSON.stringify(params)}`,
      collection: 'Title',
      ttl: 3600, // 1 hour
      fetchFn: async () => {
        const response = await axios.get(url, { params });
        return response.data;
      }
    });

    res.json(response);
  } catch (error) {
    console.error('Error fetching title ancestry:', error);
    console.error('Failed request details:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data
    });
    if (error.response?.status === 404) {
      res.status(404).json({ error: 'Ancestry not found for the specified parameters' });
    } else {
      res.status(500).json({ 
        error: error.message,
        details: error.response?.data || 'No additional details'
      });
    }
  }
});

// Get title versions
app.get('/api/titles/:titleNumber/versions', async (req, res) => {
  try {
    const { titleNumber } = req.params;
    const { 
      date,
      subtitle,
      chapter,
      subchapter,
      part,
      subpart,
      section,
      appendix 
    } = req.query;

    if (!date) {
      return res.status(400).json({ error: 'Missing required date parameter' });
    }

    // Validate parameter dependencies
    if (subchapter && !chapter) {
      return res.status(400).json({ error: 'Subchapter requires chapter parameter' });
    }
    if (subpart && !part) {
      return res.status(400).json({ error: 'Subpart requires part parameter' });
    }
    if (section && !part) {
      return res.status(400).json({ error: 'Section requires part parameter' });
    }
    if (appendix && !subtitle && !chapter && !part) {
      return res.status(400).json({ error: 'Appendix requires subtitle, chapter, or part parameter' });
    }

    // Format parameters according to requirements
    const params = {
      date,
      ...(subtitle && { subtitle: subtitle.toUpperCase() }),
      ...(chapter && { chapter: chapter.toUpperCase() }), // Assuming roman numerals are already correct
      ...(subchapter && { subchapter: subchapter.toUpperCase() }),
      ...(part && { part }),
      ...(subpart && { subpart }),
      ...(section && { section }),
      ...(appendix && { appendix })
    };

    console.log('Versioner service: Fetching versions for title:', {
      titleNumber,
      params
    });

    const url = `${process.env.API_BASE}/versioner/v1/versions/title-${titleNumber}.json`;
    console.log('Versioner service: Making request to:', url, 'with params:', params);

    const response = await cacheData({
      key: `versions_${url}_${JSON.stringify(params)}`,
      collection: 'Title',
      ttl: 3600, // 1 hour
      fetchFn: async () => {
        const response = await axios.get(url, { params });
        return response.data;
      }
    });

    res.json(response);
  } catch (error) {
    console.error('Error fetching title versions:', error);
    console.error('Failed request details:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data
    });
    if (error.response?.status === 404) {
      res.status(404).json({ error: 'Versions not found for the specified parameters' });
    } else {
      res.status(500).json({ 
        error: error.message,
        details: error.response?.data || 'No additional details'
      });
    }
  }
});

// Get full title content
app.get('/api/titles/:titleNumber/full', async (req, res) => {
  try {
    const { titleNumber } = req.params;
    const { date, subtitle, chapter, subchapter, part, subpart, section, appendix } = req.query;

    if (!date) {
      return res.status(400).json({ error: 'Missing required date parameter' });
    }

    // Create a cache key based on all parameters
    const cacheKey = `title_full_${titleNumber}_${date}_${JSON.stringify({
      subtitle,
      chapter,
      subchapter,
      part,
      subpart,
      section,
      appendix
    })}`;

    try {
      const response = await cacheData({
        key: cacheKey,
        collection: 'Title',
        ttl: 10800, // 3 hours
        fetchFn: async () => {
          // Validate parameter dependencies
          if (subchapter && !chapter) {
            throw new Error('Subchapter requires chapter parameter');
          }
          if (subpart && !part) {
            throw new Error('Subpart requires part parameter');
          }
          if (section && !part) {
            throw new Error('Section requires part parameter');
          }
          if (appendix && !subtitle && !chapter && !part) {
            throw new Error('Appendix requires subtitle, chapter, or part parameter');
          }

          // Format parameters according to requirements
          const params = {
            ...(subtitle && { subtitle: subtitle.toUpperCase() }),
            ...(chapter && { chapter: chapter.toUpperCase() }),
            ...(subchapter && { subchapter: subchapter.toUpperCase() }),
            ...(part && { part }),
            ...(subpart && { subpart }),
            ...(section && { section }),
            ...(appendix && { appendix })
          };

          const url = `${process.env.API_BASE}/versioner/v1/full/${date}/title-${titleNumber}.xml`;
          console.log('Versioner service: Making request to:', url, 'with params:', params);

          const response = await axios.get(url, { 
            params,
            responseType: 'text'
          });

          return response.data;
        }
      });

      res.set('Content-Type', 'application/xml');
      res.send(response);
    } catch (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error fetching full title content:', error);
    res.status(error.response?.status || 500).json({ 
      error: error.message,
      details: error.response?.data || 'No additional details'
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Versioner service running on port ${PORT}`);
});