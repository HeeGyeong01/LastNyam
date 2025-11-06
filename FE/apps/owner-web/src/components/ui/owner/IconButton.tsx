import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon;
  iconClassName?: string;
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, icon: Icon, iconClassName, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "flex items-center justify-center p-2",
          "hover:bg-bg-1 active:bg-bg-2",
          "rounded-full transition-all duration-200 group",
          className
        )}
        {...props}
      >
        <Icon
          className={cn(
            "w-6 h-6 text-stroke-1",
            "group-hover:text-stroke-2 group-active:text-brand",
            "transition-colors duration-200",
            iconClassName
          )}
        />
      </button>
    );
  }
);

IconButton.displayName = "IconButton";

export { IconButton };
