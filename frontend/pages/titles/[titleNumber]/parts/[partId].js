import { useRouter } from 'next/router';
import { TitleLayout } from '../../../../components/TitleLayout';

export default function PartPage() {
  const router = useRouter();
  const { titleNumber, partId } = router.query;

  return (
    <TitleLayout 
      titleNumber={titleNumber}
      currentPath={['parts', partId]}
    >
      <div className="bg-white rounded shadow p-4">
        <h1 className="text-xl font-semibold mb-4">
          Part {partId}
        </h1>
        {/* Part content here */}
      </div>
    </TitleLayout>
  );
} 