const axios = require('axios');
const { cacheData } = require('../services/cache-service');
const { Agency, Title } = require('../services/cache-service/src/models');

const API_BASE = 'https://www.ecfr.gov/api';

async function fetchWithRetry(url, params = {}, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await axios.get(url, { params });
      return response.data;
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}

async function initializeCache() {
  try {
    console.log('Starting cache initialization...');

    // Cache agencies
    const agencies = await fetchWithRetry(`${API_BASE}/admin/v1/agencies.json`);
    await cacheData({
      key: 'agencies',
      collection: Agency,
      data: agencies
    });

    // Cache titles and their initial versions
    const titles = await fetchWithRetry(`${API_BASE}/versioner/v1/titles.json`);
    const today = new Date().toISOString().split('T')[0];

    for (const title of titles) {
      // Get title structure
      const structure = await fetchWithRetry(
        `${API_BASE}/versioner/v1/structure/${today}/title-${title.number}.json`
      );

      // Get title versions
      const versions = await fetchWithRetry(
        `${API_BASE}/versioner/v1/versions/title-${title.number}.json`
      );

      // Get corrections
      const corrections = await fetchWithRetry(
        `${API_BASE}/admin/v1/corrections/title/${title.number}.json`
      );

      await cacheData({
        key: `title_${title.number}`,
        collection: Title,
        data: {
          ...title,
          structure,
          versions,
          corrections,
          lastUpdated: new Date()
        }
      });
    }

    console.log('Cache initialization complete');
  } catch (error) {
    console.error('Error initializing cache:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  initializeCache();
}

module.exports = { initializeCache }; 