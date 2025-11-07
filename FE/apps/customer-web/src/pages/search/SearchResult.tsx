import { useSearchParams } from 'react-router-dom';

export default function SearchResult() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q');

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">검색 결과</h1>
      <p>검색어: {query}</p>
    </div>
  );
}

