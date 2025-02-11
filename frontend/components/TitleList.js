import { useState, useEffect } from 'react';
import axios from 'axios';
import { TitleDetails } from './TitleDetails';
import { SearchBox } from './SearchBox';
import { TitleStructure } from './TitleStructure';
import Link from 'next/link';

export function TitleList({ agencySlug, dateRange, agencyName }) {
  const [titles, setTitles] = useState({ main: [], children: [] });
  const [corrections, setCorrections] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchResults, setSearchResults] = useState(null);
  const [selectedChild, setSelectedChild] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch corrections count from the correct endpoint
        const correctionsResponse = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/search/counts/titles`, {
          params: {
            agency_slugs: [agencySlug]
          }
        });

        console.log('Corrections response:', correctionsResponse.data);  // Added logging

        const totalCorrections = correctionsResponse.data.total;
        
        setCorrections({ total_count: totalCorrections });

        // Get agency details
        const agencyResponse = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/agencies/${agencySlug}`);
        const agency = agencyResponse.data;

        // Fetch all titles summary
        const titlesResponse = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/titles`);
        console.log('Titles response:', titlesResponse.data);

        // Helper function to get titles for an agency
        const getTitlesForAgency = (agency) => {
          const allTitles = titlesResponse.data.titles || [];
          return allTitles.filter(title => 
            agency.cfr_references.some(ref => ref.title === parseInt(title.number))
          );
        };

        // Get titles for main agency only
        const mainAgencyTitles = getTitlesForAgency(agency);

        // Fetch structure for main agency titles
        const fetchStructure = async (title) => {
          try {
            const structureResponse = await axios.get(
              `${process.env.NEXT_PUBLIC_API_URL}/titles/${title.number}/structure`,
              {
                params: { date: dateRange.to }
              }
            );
            return { ...title, structure: structureResponse.data };
          } catch (err) {
            console.error(`Error fetching structure for title ${title.number}:`, err);
            return title;
          }
        };

        const mainTitlesWithStructure = await Promise.all(
          mainAgencyTitles.map(fetchStructure)
        );

        setTitles({
          main: mainTitlesWithStructure,
          children: agency.children || []
        });
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    if (agencySlug) {
      fetchData();
      setSelectedChild(null); // Reset selected child when agency changes
    }
  }, [agencySlug, dateRange.to]);

  const handleSearchResults = (results) => {
    if (results.error) {
      setSearchResults(null);
      // Optionally show error message
      return;
    }

    setSearchResults(results);
  };

  const clearSearchResults = () => {
    setSearchResults(null);
  };

  // Add this section to render search results
  const renderSearchResults = () => {
    if (!searchResults || !searchResults.results) {
      return <div>No results found</div>;
    }

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">
            Search Results ({searchResults.meta.total_count})
          </h2>
          <button
            onClick={() => setSearchResults(null)}
            className="text-sm text-blue-500 hover:text-blue-600"
          >
            Clear Results
          </button>
        </div>

        <div className="space-y-4">
          {searchResults.results.map((result) => (
            <div 
              key={`${result.structure_index}-${result.starts_on}-${result.type}`} 
              className="bg-white rounded-lg shadow p-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Link
                      href={{
                        pathname: `/titles/${result.hierarchy.title}`,
                        query: { 
                          from: 'agency',
                          agency: agencySlug 
                        }
                      }}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Title {result.hierarchy.title}
                    </Link>
                    <span className="text-gray-400">›</span>
                    <h3 className="font-medium">
                      {result.hierarchy_headings ? Object.values(result.hierarchy_headings).join(' > ') : 'Section'}
                    </h3>
                  </div>
                  <div 
                    className="text-sm text-gray-600 mt-1"
                    dangerouslySetInnerHTML={{ __html: result.full_text_excerpt }}
                  />
                </div>
                <span className="text-sm text-gray-500">
                  {new Date(result.starts_on).toLocaleDateString()}
                </span>
              </div>
              {result.type && (
                <div className="mt-2 text-sm text-gray-600">
                  <span className="font-medium">Type:</span> {result.type}
                </div>
              )}
            </div>
          ))}
        </div>

        {searchResults.meta.total_pages > 1 && (
          <div className="text-sm text-gray-600 mt-4">
            Page {searchResults.meta.current_page} of {searchResults.meta.total_pages}
          </div>
        )}
      </div>
    );
  };

  const handleChildClick = (childSlug) => {
    // Navigate to the child agency's page
    window.location.href = `/agencies/${childSlug}`;
  };

  if (loading) return <div className="p-4">Loading titles...</div>;
  if (error) return <div className="p-4 text-red-500">Error loading titles: {error}</div>;
  if (!titles.main?.length && !titles.children?.length) {
    return <div className="p-4">No titles found for this agency or its sub-agencies.</div>;
  }

  const TitleCard = ({ title }) => (
    <div key={title.number} className="bg-white rounded-lg shadow">
      <div className="p-6 border-b">
        <Link
          href={{
            pathname: `/titles/${title.number}`,
            query: { 
              from: 'agency',
              agency: agencySlug 
            }
          }}
          className="text-lg font-semibold text-blue-600 hover:text-blue-800"
        >
          Title {title.number}: {title.name}
        </Link>
        <div className="text-sm text-gray-600 space-y-1">
          <p>Latest Issue Date: {new Date(title.latest_issue_date).toLocaleDateString()}</p>
          <p>Up to Date as of: {new Date(title.up_to_date_as_of).toLocaleDateString()}</p>
        </div>
      </div>
      {title.structure && (
        <div className="p-4">
          <TitleStructure 
            structure={title.structure} 
            titleNumber={title.number}
            agencySlug={agencySlug}
          />
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-8">
      <SearchBox 
        agencySlug={agencySlug} 
        onResults={handleSearchResults}
      />

      {searchResults ? (
        renderSearchResults()
      ) : (
        <>
          {/* Main agency section */}
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-lg shadow">
              <h1 className="text-2xl font-bold mb-2">{agencyName}</h1>
              {corrections && (
                <p className="text-gray-600">
                  Total Corrections: {corrections.total_count}
                </p>
              )}
            </div>

            {titles.main.length > 0 && (
              <div className="space-y-4">
                {titles.main.map(title => (
                  <TitleCard key={title.number} title={title} />
                ))}
              </div>
            )}
          </div>

          {/* Children agencies section */}
          {titles.children.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Sub-Agencies</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {titles.children.map(child => (
                  <button
                    key={child.slug}
                    onClick={() => handleChildClick(child.slug)}
                    className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow duration-200 text-left border-l-4 border-blue-500"
                  >
                    <h3 className="text-lg font-semibold mb-1">{child.name}</h3>
                    {child.short_name && (
                      <p className="text-sm text-gray-600">{child.short_name}</p>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
} 