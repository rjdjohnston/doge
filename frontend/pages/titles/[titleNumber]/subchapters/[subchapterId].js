import { useRouter } from 'next/router';
import { TitleLayout } from '../../../../components/TitleLayout';

export default function SubchapterPage() {
  const router = useRouter();
  const { titleNumber, subchapterId } = router.query;

  return (
    <TitleLayout 
      titleNumber={titleNumber}
      currentPath={['subchapters', subchapterId]}
    >
      <div className="bg-white rounded shadow p-4">
        <h1 className="text-xl font-semibold mb-4">
          Subchapter {subchapterId}
        </h1>
        {/* Subchapter content here */}
      </div>
    </TitleLayout>
  );
} 