import './App.css'
// import { Button } from '../../../shared/src/components/Button'
// import { Badge } from '../../../shared/src/components/Badge'
import { useState } from 'react';
import { Tab } from '@shared/components/Tab';
import { Input } from '@shared/components/Input';

// 예시 1: 기본 사용법
function App() {
  const [selectedTab, setSelectedTab] = useState('마감세일');

  const handleTabChange = (index: number, label: string) => {
    setSelectedTab(label);
    // 여기서 API 호출 등을 수행할 수 있습니다
    console.log(`Selected tab: ${label} (index: ${index})`);
  };

  return (
    <div className="bg-bg-3">
      <Input placeholder="Search" />
      <h1>제목</h1>
      <Tab 
        tabLabels={['마감세일', '푸켓팅']} 
        onTabChange={handleTabChange}
      />
      
      {/* 선택된 탭에 따라 다른 컴포넌트 렌더링 */}
      <div className="mt-4">
        {selectedTab === '마감세일' && (
          <div>마감세일 관련 카드들...</div>
        )}
        {selectedTab === '푸켓팅' && (
          <div>푸켓팅 관련 카드들...</div>
        )}
      </div>
    </div>
  );
}

export default App
