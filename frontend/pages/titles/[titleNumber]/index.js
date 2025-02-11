import { useRouter } from 'next/router';
import { TitleLayout } from '../../../components/TitleLayout';
import { TitleStructure } from '../../../components/TitleStructure';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';

export default function TitlePage() {
  const router = useRouter();
  const { titleNumber } = router.query;
  const [title, setTitle] = useState(null);
  const [structure, setStructure] = useState(null);
  const [agencies, setAgencies] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [previousAgency, setPreviousAgency] = useState(null);
  const [corrections, setCorrections] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!titleNumber) return;

      try {
        setLoading(true);
        const [titlesResponse, structureResponse, agenciesResponse, correctionsResponse] = await Promise.all([
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/titles`),
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/titles/${titleNumber}/structure`, {
            params: { date: new Date().toISOString().split('T')[0] }
          }),
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/agencies`),
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/corrections/title/${titleNumber}`, {
            onDownloadProgress: (progressEvent) => {
              console.log('Download progress:', progressEvent);
            }
          })
        ]);

        console.log('Frontend - Corrections response:', correctionsResponse.data);
        console.log('Frontend - Corrections array:', correctionsResponse.data?.ecfr_corrections);

        const titleData = titlesResponse.data.titles.find(t => t.number === parseInt(titleNumber));
        if (!titleData) {
          throw new Error('Title not found');
        }

        // Filter agencies to only include those with matching CFR references
        const filteredAgencies = agenciesResponse.data.filter(agency => {
          // console.log('Agency:', agency.name, 'CFR refs:', agency.cfr_references);
          return agency.cfr_references.some(ref => {
            // console.log('Checking ref:', ref.title, 'against title:', parseInt(titleNumber));
            return ref.title === parseInt(titleNumber);
          });
        });
        // console.log('Filtered agencies:', filteredAgencies);

        setCorrections(correctionsResponse.data);
        console.log('Frontend - Full corrections response:', {
          status: correctionsResponse.status,
          headers: correctionsResponse.headers,
          data: correctionsResponse.data
        });
        console.log('Frontend - State after setting corrections:', correctionsResponse.data);
        setTitle(titleData);
        setStructure(structureResponse.data);
        setAgencies(filteredAgencies);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, [titleNumber]);

  // Track previous path
  useEffect(() => {
    // Check if we have state with previous agency
    if (router.query.from === 'agency' && router.query.agency) {
      const fetchAgency = async () => {
        try {
          const response = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/agencies/${router.query.agency}`
          );
          setPreviousAgency(response.data);
        } catch (err) {
          console.error('Error fetching previous agency:', err);
          // Don't throw error, just log it
        }
      };
      fetchAgency();
    }
  }, [router.query.from, router.query.agency]); // Add specific dependencies

  // Update the back link to use router.push instead of Link component
  const handleBack = (e) => {
    e.preventDefault();
    if (previousAgency) {
      router.push(`/agencies/${previousAgency.slug}`);
    }
  };

  // Add effect to monitor corrections state
  useEffect(() => {
    console.log('Frontend - Corrections state changed:', corrections);
  }, [corrections]);

  if (!titleNumber) return null;
  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;
  if (!title) return <div className="p-4">Title not found</div>;

  return (
    <TitleLayout 
      titleNumber={titleNumber}
      currentPath={[]}
    >
      
      <div className="space-y-6">
        {/* Back Link */}
        {previousAgency && (
          <button 
            onClick={handleBack}
            className="text-sm text-gray-500 hover:text-blue-600"
          >
            ← Back to {previousAgency.name}
          </button>
        )}

        {/* Title Information */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-2">
              Title {title.number}: {title.name}
            </h1>
            <div className="text-sm text-gray-600 space-y-1">
              <p>Latest Issue Date: {new Date(title.latest_issue_date).toLocaleDateString()}</p>
              <p>Up to Date as of: {new Date(title.up_to_date_as_of).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Title Structure */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">Structure</h2>
          </div>
          <div className="p-2">
            <TitleStructure 
              structure={structure} 
              titleNumber={titleNumber}
            />
          </div>
        </div>

        {/* Corrections */}
        {corrections?.ecfr_corrections ? (
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">
                Recent Corrections ({corrections.ecfr_corrections.length})
              </h2>
            </div>
            <div className="divide-y">
              {corrections.ecfr_corrections.map((correction) => {
                console.log('Rendering correction:', correction);
                return (
                  <div key={correction.id} className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">
                          {correction.cfr_references[0]?.cfr_reference}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {correction.corrective_action}
                        </p>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(correction.error_corrected).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      <span className="font-medium">FR Citation:</span> {correction.fr_citation}
                    </div>
                    <div className="mt-1 text-sm text-gray-600">
                      <span className="font-medium">Error Occurred:</span> {new Date(correction.error_occurred).toLocaleDateString()}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-4">
            <p>No corrections found</p>
          </div>
        )}

        {/* Agencies */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">{agencies.length} Responsible Agencies</h2>
          </div>
          <div className="p-4">
            {agencies && agencies.length > 0 ? (
              <ul className="space-y-3">
                {agencies.map((agency) => (
                  <li key={agency.slug} className="border-b pb-2 last:border-b-0">
                    <div className="pl-4">
                      <Link 
                        href={`/agencies/${agency.slug}`}
                        className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {agency.name}
                      </Link>
                      {agency.description && (
                        <p className="text-sm text-gray-600 mt-1">{agency.description}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-600">No agencies found for this title.</p>
            )}
          </div>
        </div>
      </div>
    </TitleLayout>
  );
} 