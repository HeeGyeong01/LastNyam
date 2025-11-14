import { PageHeader } from '@/shared/components';

export default function MyPage() {
  return (
    <>
      <PageHeader title="마이페이지" variant="light" />
      <div className="px-4">
        <h1 className="text-2xl font-bold">마이페이지</h1>
        <p>마이페이지</p>
      </div>
    </>
  );
}
