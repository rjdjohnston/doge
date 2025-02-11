import { useRouter } from 'next/router';
import { SubtitleView } from '../../../../components/SubtitleView';

export default function SubtitlePage() {
  const router = useRouter();
  const { titleNumber, subtitle } = router.query;
  const date = new Date().toISOString().split('T')[0]; // Current date as default

  if (!titleNumber || !subtitle) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <SubtitleView 
        titleNumber={titleNumber}
        subtitle={subtitle}
        date={date}
      />
    </div>
  );
} 