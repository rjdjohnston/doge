import { useState, useEffect } from 'react';
import axios from 'axios';

export function SubtitleView({ titleNumber, subtitle, date }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSubtitleData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/titles/${titleNumber}/structure`,
          {
            params: {
              date,
              subtitle
            }
          }
        );
        setData(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching subtitle data:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    if (titleNumber && subtitle) {
      fetchSubtitleData();
    }
  }, [titleNumber, subtitle, date]);

  if (loading) return <div className="p-4">Loading subtitle data...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;
  if (!data) return <div className="p-4">No data found for this subtitle.</div>;

  return (
    <div className="space-y-4">
      <div className="bg-white p-6 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-2">
          Title {titleNumber}, Subtitle {subtitle}
        </h1>
        <div className="text-sm text-gray-600">
          {data.heading && <p className="font-semibold">{data.heading}</p>}
        </div>
      </div>

      {/* Display chapters */}
      {data.chapters && data.chapters.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Chapters</h2>
          <div className="grid gap-4">
            {data.chapters.map(chapter => (
              <div key={chapter.number} className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-2">
                  Chapter {chapter.number}
                </h3>
                {chapter.heading && (
                  <p className="text-gray-600">{chapter.heading}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 