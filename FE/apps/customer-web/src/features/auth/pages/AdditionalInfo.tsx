import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const foodCategories = [
  '한식',
  '중식',
  '일식',
  '양식',
  '분식',
  '치킨',
  '피자',
  '버거',
  '아시안',
  '디저트',
  '카페',
  '베이커리',
];

export default function AdditionalInfo() {
  const navigate = useNavigate();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handleSubmit = async () => {
    if (selectedCategories.length === 0) {
      alert('최소 1개 이상의 카테고리를 선택해주세요!');
      return;
    }

    try {
      // TODO: 백엔드에 선호 카테고리 전송
      console.log('선택된 카테고리:', selectedCategories);
      
      // 회원가입 완료 페이지로 이동
      navigate('/auth/signup-complete');
    } catch (error) {
      console.error('추가정보 저장 실패:', error);
    }
  };

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-2xl mx-auto py-8">
        <h1 className="text-3xl font-bold mb-2">좋아하는 음식을 선택해주세요</h1>
        <p className="text-gray-600 mb-8">
          선택하신 카테고리를 기반으로 맞춤 상품을 추천해드려요!
        </p>

        <div className="grid grid-cols-3 gap-3 mb-8">
          {foodCategories.map((category) => (
            <button
              key={category}
              onClick={() => toggleCategory(category)}
              className={`py-4 px-4 rounded-lg font-medium transition-colors ${
                selectedCategories.includes(category)
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600">
            선택된 카테고리: {selectedCategories.length}개
          </p>
        </div>

        <button
          onClick={handleSubmit}
          disabled={selectedCategories.length === 0}
          className="w-full bg-primary text-white font-semibold py-4 px-4 rounded-lg hover:bg-primary-dark disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          완료
        </button>
      </div>
    </div>
  );
}

