import { PageHeader } from '@/components/common';

export default function ShopDetail() {
  return (
    <>
      <PageHeader title="가게 상세" variant="light" />
      <div className="px-4">
        <h1 className="text-2xl font-bold">가게 상세</h1>
        <p>가게 상세 정보</p>
      </div>
    </>
  );
}

