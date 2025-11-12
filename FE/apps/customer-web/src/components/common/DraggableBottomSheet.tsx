import { useState, useRef, useCallback, useMemo, useEffect } from 'react';

interface DraggableBottomSheetProps {
  children: React.ReactNode;
  minHeight?: number;
  headerOffset?: number; // Header와 Tab 높이
  defaultHeightRatio?: number; // 기본 높이 비율 (0.4 = 40%)
  className?: string;
}

export default function DraggableBottomSheet({
  children,
  minHeight = 144,
  headerOffset = 96,
  defaultHeightRatio = 0.4,
  className = '',
}: DraggableBottomSheetProps) {
  // 화면 높이 상태 (리사이즈 대응)
  const [windowHeight, setWindowHeight] = useState(() => {
    if (typeof window === 'undefined') return 800;
    return window.innerHeight;
  });

  // 화면 리사이즈 감지
  useEffect(() => {
    const handleResize = () => {
      setWindowHeight(window.innerHeight);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 바텀시트 상태
  const maxHeight = useMemo(() => {
    return windowHeight - headerOffset;
  }, [windowHeight, headerOffset]);

  const [bottomSheetHeight, setBottomSheetHeight] = useState(() => {
    if (typeof window === 'undefined') return 536;
    const maxH = windowHeight - headerOffset;
    return Math.min(536, maxH * defaultHeightRatio);
  });

  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [startHeight, setStartHeight] = useState(0);
  const bottomSheetRef = useRef<HTMLDivElement>(null);

  // 드래그 시작
  const handleTouchStart = useCallback((e: TouchEvent) => {
    setIsDragging(true);
    setStartY(e.touches[0].clientY);
    setStartHeight(bottomSheetHeight);
  }, [bottomSheetHeight]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartY(e.clientY);
    setStartHeight(bottomSheetHeight);
  };

  // 드래그 중
  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (e.cancelable) {
      e.preventDefault();
    }
    
    if (startY === 0) return;
    
    const currentY = e.touches[0].clientY;
    const deltaY = startY - currentY;
    const newHeight = Math.max(minHeight, Math.min(maxHeight, startHeight + deltaY));
    
    setBottomSheetHeight(newHeight);
  }, [startY, startHeight, minHeight, maxHeight]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    
    const currentY = e.clientY;
    const deltaY = startY - currentY;
    const newHeight = Math.max(minHeight, Math.min(maxHeight, startHeight + deltaY));
    
    setBottomSheetHeight(newHeight);
  }, [isDragging, startY, startHeight, minHeight, maxHeight]);

  // 스냅 로직
  const snapToNearest = useCallback((currentHeight: number) => {
    const midPoint = (minHeight + maxHeight) / 2;
    
    if (currentHeight < midPoint) {
      setBottomSheetHeight(minHeight);
    } else {
      setBottomSheetHeight(maxHeight);
    }
  }, [minHeight, maxHeight]);

  // 드래그 종료
  const handleTouchEnd = useCallback(() => {
    if (isDragging) {
      snapToNearest(bottomSheetHeight);
    }
    setIsDragging(false);
    setStartY(0);
    setStartHeight(0);
  }, [isDragging, bottomSheetHeight, snapToNearest]);

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      snapToNearest(bottomSheetHeight);
    }
    setIsDragging(false);
    setStartY(0);
    setStartHeight(0);
  }, [isDragging, bottomSheetHeight, snapToNearest]);

  // 터치 이벤트 리스너
  useEffect(() => {
    const handleElement = bottomSheetRef.current;
    if (!handleElement) return;

    handleElement.addEventListener('touchstart', handleTouchStart, { passive: false });
    handleElement.addEventListener('touchmove', handleTouchMove, { passive: false });
    handleElement.addEventListener('touchend', handleTouchEnd, { passive: false });
    
    return () => {
      handleElement.removeEventListener('touchstart', handleTouchStart);
      handleElement.removeEventListener('touchmove', handleTouchMove);
      handleElement.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  // 마우스 이벤트 리스너
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div
      className={`fixed left-0 right-0 bg-white rounded-t-2xl shadow-lg z-10 ${className}`}
      style={{
        bottom: 0,
        height: `${bottomSheetHeight}px`,
        maxHeight: `calc(100vh - ${headerOffset}px)`,
        touchAction: 'none',
        transition: isDragging ? 'none' : 'height 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {/* 드래그 핸들 */}
      <div
        ref={bottomSheetRef}
        className="w-full py-3 flex justify-center cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        style={{ touchAction: 'none' }}
      >
        {/* <div className="w-12 h-1 bg-bg-3 rounded-full" /> */}
      </div>

      {/* 바텀시트 내용 */}
      {children}
    </div>
  );
}

