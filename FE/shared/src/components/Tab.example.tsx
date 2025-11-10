/**
 * Tab 컴포넌트 사용 예시
 * 
 * 이 파일은 Tab 컴포넌트를 어떻게 사용하는지 보여주는 예시입니다.
 * 실제 프로젝트에서는 이 파일을 삭제하고 아래 패턴을 참고하여 사용하세요.
 */

import { useState } from 'react';
import { Tab } from './Tab';

// 예시 1: 기본 사용법
export function BasicTabExample() {
  const [selectedTab, setSelectedTab] = useState('마감예일');

  const handleTabChange = (index: number, label: string) => {
    setSelectedTab(label);
    // 여기서 API 호출 등을 수행할 수 있습니다
    console.log(`Selected tab: ${label} (index: ${index})`);
  };

  return (
    <div>
      <h1>제목</h1>
      <Tab 
        tabLabels={['마감예일', '푸팅']} 
        onTabChange={handleTabChange}
      />
      
      {/* 선택된 탭에 따라 다른 컴포넌트 렌더링 */}
      <div className="mt-4">
        {selectedTab === '마감예일' && (
          <div>마감예일 관련 카드들...</div>
        )}
        {selectedTab === '푸팅' && (
          <div>푸팅 관련 카드들...</div>
        )}
      </div>
    </div>
  );
}

// 예시 2: 인덱스 기반으로 컴포넌트 렌더링
export function IndexBasedTabExample() {
  const [selectedIndex, setSelectedIndex] = useState(0);

  return (
    <div>
      <h1>베이커리</h1>
      <Tab 
        tabLabels={['회/초밥', '김밥/분식', '샐러드/포케', '기타']} 
        onTabChange={(index) => setSelectedIndex(index)}
      />
      
      {/* 인덱스로 조건부 렌더링 */}
      <div className="mt-4">
        {selectedIndex === 0 && <div>회/초밥 카드들...</div>}
        {selectedIndex === 1 && <div>김밥/분식 카드들...</div>}
        {selectedIndex === 2 && <div>샐러드/포케 카드들...</div>}
        {selectedIndex === 3 && <div>기타 카드들...</div>}
      </div>
    </div>
  );
}

// 예시 3: API 호출과 함께 사용
export function ApiTabExample() {
  const [data] = useState([]);

  const fetchData = async (category: string) => {
    // API 호출 예시
    // const response = await fetch(`/api/products?category=${category}`);
    // const result = await response.json();
    // setData(result);
    console.log(`Fetching data for category: ${category}`);
  };

  const handleTabChange = (_index: number, label: string) => {
    fetchData(label);
  };

  return (
    <div>
      <h1>제목</h1>
      <Tab 
        tabLabels={['마감예일', '푸팅']} 
        onTabChange={handleTabChange}
      />
      
      {/* API 응답으로 받은 데이터로 카드 렌더링 */}
      <div className="mt-4">
        {data.map((item: any) => (
          <div key={item.id}>Card Component</div>
        ))}
      </div>
    </div>
  );
}

