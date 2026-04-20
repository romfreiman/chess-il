import { useParams } from 'react-router-dom';

export function PlayerPage() {
  const { id } = useParams<{ id: string }>();
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 text-center">
      <p className="text-gray-500">טוען... (שחקן {id})</p>
    </div>
  );
}
