import React from 'react';
import { cn } from '@/lib/utils';

interface BottomSheetProps {
  children: React.ReactNode;
  className?: string;
}

export default function BottomSheet({ children, className = '' }: BottomSheetProps) {
  return (
    <div
      className={cn(
        'fixed left-0 right-0 max-w-[500px] mx-auto px-4 py-4 rounded-t-2xl shadow-[0_-4px_3px_0_rgba(0,0,0,0.04)] bg-bg-0 z-40',
        className
      )}
      style={{ bottom: '80px' }} // BottomNavBar 높이만큼 위에 배치
    >
      {children}
    </div>
  );
}

