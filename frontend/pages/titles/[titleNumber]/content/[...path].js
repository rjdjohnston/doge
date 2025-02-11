import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Link from 'next/link';

export default function TitleContent() {
  const router = useRouter();
  const { titleNumber, path } = router.query;
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchContent = async () => {
      if (!titleNumber || !path) return;

      try {
        setLoading(true);
        // Parse the path to get the hierarchy
        const [subtitle, chapter, subchapter, part, subpart] = path;
        
        // Format parameters according to eCFR API requirements
        const params = {
          date: new Date().toISOString().split('T')[0],
          ...(subtitle && { subtitle: subtitle.toUpperCase() }),
          ...(chapter && { chapter: chapter.toUpperCase() }), // For roman numerals
          ...(subchapter && { subchapter: subchapter.toUpperCase() }),
          ...(part && { part: part.toString() }),
          ...(subpart && { subpart: subpart.toString() })
        };

        console.log('Fetching content with params:', params);

        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/titles/${titleNumber}/full`, {
          params
        });

        setContent(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching content:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchContent();
  }, [titleNumber, path]);

  // Build breadcrumb items with proper formatting
  const breadcrumbs = path ? path.map((item, index) => {
    let label = item;
    // Format the label based on the level
    switch (index) {
      case 0: // subtitle
      case 1: // chapter
      case 2: // subchapter
        label = item.toUpperCase();
        break;
      default:
        label = item;
    }
    return {
      label,
      path: `/titles/${titleNumber}/content/${path.slice(0, index + 1).join('/')}`
    };
  }) : [];

  if (loading) return <div className="p-4">Loading content...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb navigation */}
      <nav className="mb-6">
        <ol className="flex flex-wrap gap-2 items-center text-sm">
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
                href={crumb.path}
                className="text-blue-600 hover:text-blue-800"
              >
                {crumb.label}
              </Link>
            </li>
          ))}
        </ol>
      </nav>

      {/* Content display */}
      <div className="bg-white rounded-lg shadow p-6">
        <div 
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
    </div>
  );
} 