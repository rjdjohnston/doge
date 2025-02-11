import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { TitleList } from '../../components/TitleList';
import { DateRangePicker } from '../../components/DateRangePicker';

export default function AgencyPage() {
  const router = useRouter();
  const { slug } = router.query;

  const [agency, setAgency] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({
    from: new Date(),
    to: new Date()
  });

  useEffect(() => {
    const fetchAgency = async () => {
      if (!slug) return;

      try {
        setLoading(true);
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/agencies/${slug}`);
        setAgency(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching agency:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchAgency();
  }, [slug]);

  if (!slug) return null; // Don't render until we have the slug
  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;
  if (!agency) return <div className="p-4">Agency not found</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">{agency.name}</h1>
            {agency.short_name && (
              <p className="text-gray-600">{agency.short_name}</p>
            )}
          </div>
          <button
            onClick={() => router.push('/')}
            className="text-blue-500 hover:text-blue-600"
          >
            Back to Agencies
          </button>
        </div>
        <DateRangePicker
          dateRange={dateRange}
          onChange={setDateRange}
        />
      </div>

      <TitleList 
        agencySlug={slug}
        agencyName={agency.name}
        dateRange={dateRange}
      />
    </div>
  );
} 