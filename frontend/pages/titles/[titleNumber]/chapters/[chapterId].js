import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { TitleStructure } from '../../../../components/TitleStructure';

export default function ChapterPage() {
  const router = useRouter();
  const { titleNumber, chapterId } = router.query;
  const [chapterStructure, setChapterStructure] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStructure = async () => {
      if (!titleNumber || !chapterId) return;

      try {
        setLoading(true);
        const date = new Date().toISOString().split('T')[0];
        
        // Fetch full title structure
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/titles/${titleNumber}/structure`,
          {
            params: { date }
          }
        );

        // Find the specific chapter in the structure
        const findChapter = (node) => {
          if (node.identifier === chapterId && node.label?.toLowerCase().includes('chapter')) {
            return node;
          }
          if (node.children) {
            for (const child of node.children) {
              const found = findChapter(child);
              if (found) return found;
            }
          }
          return null;
        };

        const chapter = findChapter(response.data);
        if (!chapter) {
          throw new Error('Chapter not found');
        }

        setChapterStructure(chapter);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching structure:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchStructure();
  }, [titleNumber, chapterId]);

  if (loading) return <div className="p-4">Loading chapter...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;
  if (!chapterStructure) return <div className="p-4">Chapter not found</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500">
          <Link href={`/titles/${titleNumber}`} className="hover:text-blue-600">
            Title {titleNumber}
          </Link>
          {' > '}
          <span>Chapter {chapterId}</span>
        </nav>

        {/* Chapter Header */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h1 className="text-2xl font-bold mb-2">{chapterStructure.label}</h1>
        </div>

        {/* Chapter Structure */}
        <div className="bg-white rounded-lg shadow">
          <TitleStructure 
            structure={chapterStructure} 
            titleNumber={titleNumber}
            currentPath={['chapters', chapterId]}
          />
        </div>
      </div>
    </div>
  );
} 