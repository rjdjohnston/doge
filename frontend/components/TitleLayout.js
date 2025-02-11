import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Link from 'next/link';
import { TitleStructure } from './TitleStructure';

export function TitleLayout({ children, titleNumber, currentPath = [], agency = null }) {
  const [structure, setStructure] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStructure = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/titles/${titleNumber}/structure`,
          {
            params: { date: new Date().toISOString().split('T')[0] }
          }
        );
        setStructure(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching structure:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    if (titleNumber) {
      fetchStructure();
    }
  }, [titleNumber]);

  // Build breadcrumb items
  const breadcrumbs = currentPath.map((item, index) => {
    const path = currentPath.slice(0, index + 1);
    const href = `/titles/${titleNumber}/${path.join('/')}`;
    return { label: item.toUpperCase(), href };
  });

  if (loading) return <div className="p-2">Loading...</div>;
  if (error) return <div className="p-2 text-red-500">Error: {error}</div>;

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Breadcrumb navigation */}
      <nav className="mb-6">
        <ol className="flex flex-wrap gap-2 items-center text-sm">
          <li>
            <Link 
              href="/"
              className="text-blue-600 hover:text-blue-800"
            >
              Home
            </Link>
          </li>
          {agency && (
            <>
              <span className="mx-2 text-gray-500">/</span>
              <li>
                <Link
                  href={`/agencies/${agency.slug}`}
                  className="text-blue-600 hover:text-blue-800"
                >
                  {agency.name}
                </Link>
              </li>
            </>
          )}
          <span className="mx-2 text-gray-500">/</span>
          <li>
            <Link 
              href={`/titles/${titleNumber}`}
              className="text-blue-600 hover:text-blue-800"
            >
              Title {titleNumber}
            </Link>
          </li>
          {breadcrumbs.map((crumb, index) => (
            <li key={index} className="flex items-center">
              <span className="mx-2 text-gray-500">/</span>
              <Link
                href={crumb.href}
                className="text-blue-600 hover:text-blue-800"
              >
                {crumb.label}
              </Link>
            </li>
          ))}
        </ol>
      </nav>

      {/* Main content area */}
      <div>
        {children}
      </div>
    </div>
  );
} 