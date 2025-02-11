import { useState } from 'react';
import Link from 'next/link';

export function AgencyList({ agencies, dateRange }) {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter agencies based on search query
  const filteredAgencies = agencies.filter(agency => 
    agency.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agency.short_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Search input */}
      <div className="max-w-xl">
        <input
          type="text"
          placeholder="Search agencies..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Agency grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAgencies.map(agency => (
          <Link 
            key={agency.slug}
            href={`/agencies/${agency.slug}`}
            className="block"
          >
            <div className="h-full bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow duration-200 border-l-4 border-blue-500">
              <h2 className="text-lg font-semibold mb-2">{agency.name}</h2>
              {agency.short_name && (
                <p className="text-sm text-gray-600">{agency.short_name}</p>
              )}
              {agency.children?.length > 0 && (
                <p className="text-sm text-gray-500 mt-2">
                  {agency.children.length} sub-agencies
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>

      {/* No results message */}
      {filteredAgencies.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No agencies found matching "{searchQuery}"
        </div>
      )}
    </div>
  );
} 