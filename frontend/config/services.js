export const serviceUrls = {
  agency: process.env.AGENCY_SERVICE_URL || 'http://localhost:3002',
  search: process.env.SEARCH_SERVICE_URL || 'http://localhost:3003',
  versioner: process.env.VERSIONER_SERVICE_URL || 'http://localhost:3004',
  cache: process.env.CACHE_SERVICE_URL || 'http://localhost:3001'
}; 