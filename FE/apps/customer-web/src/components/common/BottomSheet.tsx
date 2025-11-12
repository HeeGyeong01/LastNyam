import React, { useEffect, useRef, useId } from 'react';
import { cn } from '@/lib/utils';
import { useLayout } from '@/contexts/LayoutContext';

interface BottomSheetProps {
  children: React.ReactNode;
  className?: string;
  bottomPadding?: number; // BottomSheet 높이만큼 추가할 padding (기본값: 자동 계산)
}

export default function BottomSheet({ 
  children, 
  className = '',
  bottomPadding,
}: BottomSheetProps) {
  const { registerBottomElement, unregisterBottomElement } = useLayout();
  const sheetRef = useRef<HTMLDivElement>(null);
  const elementId = useId();

  useEffect(() => {
    if (bottomPadding !== undefined) {
      // 명시적으로 padding이 지정된 경우
      registerBottomElement(elementId, bottomPadding);
    } else {
      // 자동으로 높이 계산
      const updatePadding = () => {
        if (sheetRef.current) {
          const height = sheetRef.current.offsetHeight;
          registerBottomElement(elementId, height);
        }
      };

      // 초기 계산 (약간의 지연을 두어 DOM이 완전히 렌더링된 후 계산)
      const timeoutId = setTimeout(updatePadding, 0);

      // ResizeObserver로 높이 변경 감지
      const resizeObserver = new ResizeObserver(updatePadding);
      if (sheetRef.current) {
        resizeObserver.observe(sheetRef.current);
      }

      return () => {
        clearTimeout(timeoutId);
        resizeObserver.disconnect();
        // 컴포넌트 언마운트 시 등록 해제
        unregisterBottomElement(elementId);
      };
    }
  }, [bottomPadding, elementId, registerBottomElement, unregisterBottomElement]);

  return (
    <div
      ref={sheetRef}
      className={cn(
        'fixed bottom-0 left-0 right-0 max-w-[500px] mx-auto px-4 py-4 rounded-t-2xl shadow-[0_-4px_3px_0_rgba(0,0,0,0.04)] bg-bg-0 z-[999]',
        className
      )}
    >
      {children}
    </div>
  );
}

