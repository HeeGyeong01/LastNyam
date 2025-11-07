import { PageHeader } from '@/components/common';

export default function Likes() {
  return (
    <>
      <PageHeader title="찜" variant="light" />
      <div className="px-4">
        <h1 className="text-2xl font-bold">찜</h1>
        <p>찜한 상품 목록</p>
      </div>
    </>
  );
}

