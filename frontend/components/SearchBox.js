import { useState } from 'react';
import axios from 'axios';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export function SearchBox({ agencySlug, onResults }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    try {
      setLoading(true);

      // Use different endpoints based on context
      const endpoint = agencySlug 
        ? `${process.env.NEXT_PUBLIC_API_URL}/search/v1/results`
        : `${process.env.NEXT_PUBLIC_API_URL}/search`;

      const params = agencySlug 
        ? {
            query: searchTerm,
            agency: agencySlug
          }
        : {
            query: searchTerm.trim(),
            agency_slugs: [] // Empty array for global search
          };

      const response = await axios.get(endpoint, { params });

      console.log('Search results:', response.data);
      onResults(response.data);
    } catch (error) {
      console.error('Search error:', error);
      onResults({ error: 'Search failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSearch} className={`w-full ${!agencySlug ? 'max-w-2xl mx-auto mb-8' : ''}`}>
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={agencySlug ? "Search within this agency..." : "Search all agencies..."}
          className="w-full px-4 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-gray-700"
        >
          {loading ? (
            <div className="w-5 h-5 border-t-2 border-gray-500 rounded-full animate-spin" />
          ) : (
            <MagnifyingGlassIcon className="w-5 h-5" />
          )}
        </button>
      </div>
    </form>
  );
} 