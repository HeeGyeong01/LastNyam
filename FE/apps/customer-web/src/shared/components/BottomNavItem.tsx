import { useNavigate } from 'react-router-dom';
import type { SVGProps } from 'react';

interface BottomNavItemProps {
  icon: React.ComponentType<SVGProps<SVGSVGElement>>;
  label: string;
  path: string;
  isActive: boolean;
  strokeWidth?: number;
}

export default function BottomNavItem({ icon: Icon, label, path, isActive, strokeWidth }: BottomNavItemProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(path);
  };

  return (
    <button
      onClick={handleClick}
      className="flex flex-col items-center gap-1 h-10.5 w-11"
    >
      <Icon 
        className={`w-7 h-7 ${isActive ? 'text-brand' : 'text-primary'}`}
        strokeWidth={strokeWidth}
      />
      <span className={`caption2 w-12 ${isActive ? 'text-brand-strong' : 'text-primary'}`}>
        {label}
      </span>
    </button>
  );
}

