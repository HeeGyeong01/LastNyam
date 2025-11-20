import React, { useState } from 'react';
import { Button } from './Button';
import { cn } from '@/lib/utils';

export interface TabProps {
  tabLabels: string[];
  onTabChange?: (selectedIndex: number, selectedLabel: string) => void;
  defaultSelectedIndex?: number;
  className?: string;
}

const Tab = React.forwardRef<HTMLDivElement, TabProps>(
  ({ tabLabels, onTabChange, defaultSelectedIndex = 0, className = '' }, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(defaultSelectedIndex);

    const handleTabClick = (index: number) => {
      setSelectedIndex(index);
      if (onTabChange) {
        onTabChange(index, tabLabels[index]);
      }
    };

    return (
      <div 
        ref={ref} 
        className={cn(
          'flex flex-nowrap px-4 py-2 gap-2 bg-bg-0 overflow-x-auto overflow-y-hidden',
          '[&::-webkit-scrollbar]:hidden', // Webkit 브라우저 스크롤바 숨기기
          '[-ms-overflow-style:none]', // IE/Edge 스크롤바 숨기기
          '[scrollbar-width:none]', // Firefox 스크롤바 숨기기
          className
        )}
      >
        {tabLabels.map((label, index) => (
          <Button
            key={index}
            btnStyle={selectedIndex === index ? 'filled-red' : 'filled-default'}
            btnShape="rounded"
            onClick={() => handleTabClick(index)}
          >
            {label}
          </Button>
        ))}
      </div>
    );
  }
);

Tab.displayName = 'Tab';

export { Tab };

