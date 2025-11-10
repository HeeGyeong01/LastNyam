import { PageHeader } from '@/components/common';
import { Tab } from '@shared/components/Tab';

export default function Foocketing() {
  return (
    <>
      <PageHeader title="푸켓팅" variant="light" />
      <Tab tabLabels={['베이커리', '회/초밥', '김밥/분식', '샐러드/포케', '기타']} />
      <div className="px-4">
        <h1 className="text-2xl font-bold">푸켓팅</h1>
        <p>푸켓팅 페이지</p>
        
        {/* 테스트용 긴 컨텐츠 */}
        {Array.from({ length: 30 }).map((_, i) => (
          <div key={i} className="p-4 mb-4 bg-gray-100 rounded">
            테스트 아이템 {i + 1}
          </div>
        ))}
      </div>
    </>
  );
}
