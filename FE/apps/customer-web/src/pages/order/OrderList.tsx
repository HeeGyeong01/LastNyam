import { PageHeader } from '@/components/common';

export default function OrderList() {
  return (
    <>
      <PageHeader title="주문내역" variant="light" />
      <div className="px-4">
        <h1 className="text-2xl font-bold">주문내역</h1>
        <p>주문내역 페이지</p>
      </div>
    </>
  );
}
