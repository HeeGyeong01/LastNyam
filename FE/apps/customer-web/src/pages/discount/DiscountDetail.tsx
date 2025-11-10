import { useParams } from 'react-router-dom';

export default function DiscountDetail() {
  const { id } = useParams();

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">마감세일 상세</h1>
      <p>상품 ID: {id}</p>
    </div>
  );
}

