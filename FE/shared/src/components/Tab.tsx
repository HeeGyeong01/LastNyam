import React, { useState } from 'react';
import { Button } from './Button';

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
      <div ref={ref} className={`flex px-4 py-2 gap-2 bg-bg-0 ${className}`}>
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

