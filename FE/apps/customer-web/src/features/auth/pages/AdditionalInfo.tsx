import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import catImage from '@/shared/assets/lastnyam-cat.png';
import { Button } from '@shared/components/Button';

// 음식 카테고리 타입 정의 (1-19)
export type FoodCategory = 
  | 1  // 빵
  | 2  // 샌드위치
  | 3  // 디저트
  | 4  // 음료
  | 5  // 케이크
  | 6  // 회
  | 7  // 초밥
  | 8  // 육회
  | 9  // 해산물
  | 10 // 김밥
  | 11 // 떡볶이
  | 12 // 튀김
  | 13 // 철판,그릴
  | 14 // 떡
  | 15 // 샐러드
  | 16 // 포케
  | 17 // 반찬
  | 18 // 국,탕,찌개
  | 19; // 스프

interface FoodCategoryItem {
  id: FoodCategory;
  label: string;
}

const foodCategories: FoodCategoryItem[] = [
  { id: 1, label: '빵' },
  { id: 2, label: '샌드위치' },
  { id: 3, label: '디저트' },
  { id: 4, label: '음료' },
  { id: 5, label: '케이크' },
  { id: 6, label: '회' },
  { id: 7, label: '초밥' },
  { id: 8, label: '육회' },
  { id: 9, label: '해산물' },
  { id: 10, label: '김밥' },
  { id: 11, label: '떡볶이' },
  { id: 12, label: '튀김' },
  { id: 13, label: '철판·그릴' },
  { id: 14, label: '떡' },
  { id: 15, label: '샐러드' },
  { id: 16, label: '포케' },
  { id: 17, label: '반찬' },
  { id: 18, label: '국·탕·찌개' },
  { id: 19, label: '스프' },
];

export default function AdditionalInfo() {
  const navigate = useNavigate();
  const [selectedCategories, setSelectedCategories] = useState<FoodCategory[]>([]);

  const toggleCategory = (categoryId: FoodCategory) => {
    setSelectedCategories((prev) => {
      if (prev.includes(categoryId)) {
        // 이미 선택된 경우 제거
        return prev.filter((id) => id !== categoryId);
      } else {
        // 최대 5개까지만 선택 가능
        if (prev.length >= 5) {
          return prev;
        }
        return [...prev, categoryId];
      }
    });
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
    <div className="flex flex-col items-center min-h-screen bg-white px-4 pt-24">
      <div className="flex flex-col items-center w-full max-w-md">
        {/* 고양이 이미지 - 원형 배경 */}
        <div className="relative mb-4">
          <img 
            src={catImage} 
            alt="Last Nyam Cat" 
            className="w-28 h-28 object-contain"
          />
        </div>

        {/* 질문 */}
        <h1 className="h4-b text-brand text-center">
          어떤 음식을 좋아하시나요?
        </h1>

        {/* 안내 문구 */}
        <p className="text-tertiary p3 mb-8 text-center">
          1개 선택 필수, 최대 5개까지 선택 가능합니다
        </p>

        {/* 음식 카테고리 그리드 */}
        <div className="flex flex-wrap gap-2 w-full mb-8 px-6">
          {foodCategories.map((category) => {
            const isSelected = selectedCategories.includes(category.id);
            return (
              <Button
                key={category.id}
                onClick={() => toggleCategory(category.id)}
                btnStyle={isSelected ? 'outlined-red' : 'outlined-default'}
                size="default"
                className="flex-1 min-w-[calc(25%-0.375rem)]"
              >
                {category.label}
              </Button>
            );
          })}
        </div>

        {/* 회원가입 완료 버튼 */}
        <div className="w-full px-4 mt-auto">
          <Button
            onClick={handleSubmit}
            disabled={selectedCategories.length === 0}
            btnStyle={selectedCategories.length === 0 ? 'filled-default' : 'filled-yellow'}
            size="lg"
            className="w-full"
          >
            회원가입 완료하기
          </Button>
        </div>
      </div>
    </div>
  );
}
