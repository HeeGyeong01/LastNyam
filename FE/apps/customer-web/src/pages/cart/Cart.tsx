import { PageHeader } from '@/components/common';

export default function Cart() {
  return (
    <>
      <PageHeader title="장바구니" variant="light" />
      <div className="px-4">
        <h1 className="text-2xl font-bold">장바구니</h1>
        <p>장바구니 페이지</p>
      </div>
    </>
  );
}
