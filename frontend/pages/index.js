import { useState, useEffect } from 'react';
import axios from 'axios';
import { AgencyList } from '../components/AgencyList';
import { DateRangePicker } from '../components/DateRangePicker';

export default function Home() {
  const [agencies, setAgencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({
    from: new Date(),
    to: new Date()
  });

  useEffect(() => {
    const fetchAgencies = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/agencies`);
        setAgencies(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching agencies:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchAgencies();
  }, []);

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h1 className="text-3xl font-bold mb-2">eCFR Corrections Explorer</h1>
        <p className="text-gray-600 mb-4">
          Explore corrections and changes across {agencies.length} federal agencies
        </p>
        <DateRangePicker
          dateRange={dateRange}
          onChange={setDateRange}
        />
      </div>
      <AgencyList agencies={agencies} dateRange={dateRange} />
    </div>
  );
} 