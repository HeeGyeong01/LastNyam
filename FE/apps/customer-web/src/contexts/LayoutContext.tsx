/* LayoutContext - MainLayout의 bottom padding을 동적으로 관리하는 Context

 * 1. 문제 상황: 
 *    - MainLayout의 스크롤 컨테이너는 하단에 BottomNavBar(80px)가 있어서 기본 padding이 필요함
 *    - BottomSheet 같은 fixed 요소가 추가되면 그 높이만큼 추가 padding이 필요함
 *    - 여러 BottomSheet가 동시에 있을 수 있고, 각각 다른 높이를 가질 수 있음

 * 2. 해결 방법:
 *    - 각 하단 요소(BottomSheet 등)가 자신의 고유 ID와 높이를 Context에 등록
 *    - Context는 등록된 모든 높이 중 최대값을 계산

 * 3. 자동 관리:
 *    - 요소가 마운트되면 자동으로 등록 (registerBottomElement)
 *    - 요소가 언마운트되면 자동으로 해제 (unregisterBottomElement)
 *    - 높이가 변경되면 ResizeObserver로 자동 업데이트
 */
import { createContext, useContext, useState, useCallback, useRef } from 'react';
import type { ReactNode } from 'react';
import type { ShopDetailDiscount } from '@/features/shop/type';

export type SortBottomSheetType = 'discount' | 'foocketing' | null;

interface SortBottomSheetData {
  currentSort: string;
  onSortSelect: (sort: string) => void;
}

interface LayoutContextType {
  bottomPadding: number;
  registerBottomElement: (id: string, height: number) => void;
  unregisterBottomElement: (id: string) => void;

  // MenuDetail BottomSheet 관련
  selectedDiscount: ShopDetailDiscount | null;
  isMenuDetailOpen: boolean;
  openMenuDetail: (discount: ShopDetailDiscount) => void;
  closeMenuDetail: () => void;
  
  // Sort BottomSheet 관련
  sortBottomSheetType: SortBottomSheetType;
  sortBottomSheetData: SortBottomSheetData | null;
  openSortBottomSheet: (
    type: 'discount' | 'foocketing',
    data: SortBottomSheetData
  ) => void;
  closeSortBottomSheet: () => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

const BOTTOM_NAVBAR_HEIGHT = 80; // BottomNavBar 높이 (pb-20 = 80px)

export function LayoutProvider({ children }: { children: ReactNode }) {
  const [bottomPadding, setBottomPadding] = useState(BOTTOM_NAVBAR_HEIGHT);
  const elementsRef = useRef<Map<string, number>>(new Map());

  
  // MenuDetail BottomSheet 상태
  const [selectedDiscount, setSelectedDiscount] = useState<ShopDetailDiscount | null>(null);
  const [isMenuDetailOpen, setIsMenuDetailOpen] = useState(false);


  // Sort BottomSheet 상태
  const [sortBottomSheetType, setSortBottomSheetType] = useState<SortBottomSheetType>(null);
  const [sortBottomSheetData, setSortBottomSheetData] = useState<SortBottomSheetData | null>(null);

  const updatePadding = useCallback(() => {
    const heights = Array.from(elementsRef.current.values());
    const maxHeight = heights.length > 0 ? Math.max(...heights) : 0;
    setBottomPadding(BOTTOM_NAVBAR_HEIGHT + maxHeight);
  }, []);

  const registerBottomElement = useCallback((id: string, height: number) => {
    elementsRef.current.set(id, height);
    updatePadding();
  }, [updatePadding]);

  const unregisterBottomElement = useCallback((id: string) => {
    elementsRef.current.delete(id);
    updatePadding();
  }, [updatePadding]);


  // 마감세일 메뉴 상세(장바구니 담기) BottomSheet
  const openMenuDetail = useCallback((discount: ShopDetailDiscount) => {
    setSelectedDiscount(discount);
    setIsMenuDetailOpen(true);
  }, []);

  const closeMenuDetail = useCallback(() => {
    setIsMenuDetailOpen(false);
    setSelectedDiscount(null);
  }, []);


  // 정렬 BottomSheet
  const openSortBottomSheet = useCallback((
    type: 'discount' | 'foocketing',
    data: SortBottomSheetData
  ) => {
    setSortBottomSheetType(type);
    setSortBottomSheetData(data);
  }, []);

  const closeSortBottomSheet = useCallback(() => {
    setSortBottomSheetType(null);
    setSortBottomSheetData(null);
  }, []);

  return (
    <LayoutContext.Provider 
      value={{ 
        bottomPadding, 
        registerBottomElement, 
        unregisterBottomElement,
        selectedDiscount,
        isMenuDetailOpen,
        openMenuDetail,
        closeMenuDetail,
        sortBottomSheetType,
        sortBottomSheetData,
        openSortBottomSheet,
        closeSortBottomSheet,
      }}
    >
      {children}
    </LayoutContext.Provider>
  );
}

export function useLayout() {
  const context = useContext(LayoutContext);
  if (context === undefined) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
}

/**
 * LayoutContext - MainLayout의 bottom padding을 동적으로 관리하는 Context
 * 
 * ## 작동 원리
 * 
 * 1. 문제 상황: 
 *    - MainLayout의 스크롤 컨테이너는 하단에 BottomNavBar(80px)가 있어서 기본 padding이 필요함
 *    - BottomSheet 같은 fixed 요소가 추가되면 그 높이만큼 추가 padding이 필요함
 *    - 여러 BottomSheet가 동시에 있을 수 있고, 각각 다른 높이를 가질 수 있음
 * 
 * 2. 해결 방법:
 *    - 각 하단 요소(BottomSheet 등)가 자신의 고유 ID와 높이를 Context에 등록
 *    - Context는 등록된 모든 높이 중 최대값을 계산
 *    - MainLayout은 BottomNavBar 높이(80px) + 최대 높이를 padding으로 사용
 * 
 * 3. 자동 관리:
 *    - 요소가 마운트되면 자동으로 등록 (registerBottomElement)
 *    - 요소가 언마운트되면 자동으로 해제 (unregisterBottomElement)
 *    - 높이가 변경되면 ResizeObserver로 자동 업데이트
 * 
 * ## 사용 방법
 * 
 * ### 1. App.tsx에서 Provider로 감싸기
 * ```tsx
 * import { LayoutProvider } from './contexts/LayoutContext';
 * 
 * function App() {
 *   return (
 *     <LayoutProvider>
 *       <RouterProvider router={router} />
 *     </LayoutProvider>
 *   );
 * }
 * ```
 * 
 * ### 2. MainLayout에서 padding 사용
 * ```tsx
 * import { useLayout } from '@/contexts/LayoutContext';
 * 
 * export default function MainLayout() {
 *   const { bottomPadding } = useLayout();
 *   
 *   return (
 *     <div style={{ paddingBottom: `${bottomPadding}px` }}>
 *       <Outlet />
 *     </div>
 *   );
 * }
 * ```
 * 
 * ## 예시 시나리오
 * 
 * - **시나리오 1**: BottomNavBar만 있는 경우
 *   - 등록된 요소: 없음
 *   - padding = 80px (BottomNavBar만)
 * 
 * - **시나리오 2**: BottomSheet 하나 추가 (높이 150px)
 *   - 등록된 요소: BottomSheet (150px)
 *   - padding = 80px + 150px = 230px
 * 
 * - **시나리오 3**: BottomSheet 두 개 (높이 100px, 200px)
 *   - 등록된 요소: BottomSheet1 (100px), BottomSheet2 (200px)
 *   - padding = 80px + max(100px, 200px) = 280px
 * 
 * - **시나리오 4**: BottomSheet 하나 제거
 *   - 등록된 요소: 없음
 *   - padding = 80px (자동으로 기본값으로 복원)
 */