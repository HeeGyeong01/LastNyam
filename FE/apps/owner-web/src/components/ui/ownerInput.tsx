import * as React from "react"

import { cn } from "@/lib/utils"

type InputVariant = "filled" | "disabled"
type InputSize = "sm" | "md"

export interface OwnerInputProps extends Omit<React.ComponentProps<"input">, "size"> {
  variant?: InputVariant
  size?: InputSize
  unit?: string
}

const Input = React.forwardRef<HTMLInputElement, OwnerInputProps>(
  ({ className, variant = "filled", size = "md", unit, type, disabled, ...props }, ref) => {
    const variantStyles = {
      filled: "bg-bg-1 text-primary placeholder:text-subtle border-subtle",
      disabled: "bg-bg-3 text-tertiary border-subtle",
    }

    const sizeStyles = {
      sm: "px-4 py-1 p2",
      md: "px-4 py-2 p1",
    }

    const unitStyles = {
      filled: "text-primary",
      disabled: "text-tertiary",
    }

    const unitSizeStyles = {
      sm: "p2",
      md: "p1",
    }

    const isDisabled = variant === "disabled" || disabled

    const inputElement = (
      <input
        type={type}
        className={cn(
          "flex w-full border-b border-input bg-transparent py-1 shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          variantStyles[variant],
          sizeStyles[size],
          unit && "pr-12",
          className
        )}
        ref={ref}
        disabled={isDisabled}
        {...props}
      />
    )

    if (unit) {
      return (
        <div className="relative w-full">
          {inputElement}
          <span className={cn(
            "absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none",
            unitSizeStyles[size],
            unitStyles[variant]
          )}>
            {unit}
          </span>
        </div>
      )
    }

    return inputElement
  }
)
Input.displayName = "Input"

export { Input }
