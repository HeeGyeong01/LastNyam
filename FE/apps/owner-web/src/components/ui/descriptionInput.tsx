import * as React from "react"

import { cn } from "@/lib/utils"

type DescriptionInputVariant = "filled" | "disabled"

export interface DescriptionInputProps extends Omit<React.ComponentProps<"textarea">, "size"> {
  variant?: DescriptionInputVariant
  label?: string
  description?: string
}

const DescriptionInput = React.forwardRef<HTMLTextAreaElement, DescriptionInputProps>(
  ({ className, variant = "filled", label, description, disabled, ...props }, ref) => {
    const variantStyles = {
      filled: "bg-bg-1 text-primary placeholder:text-subtle border-subtle",
      disabled: "bg-bg-3 text-tertiary border-subtle",
    }

    const isDisabled = variant === "disabled" || disabled

    return (
      <div className="w-full space-y-2">
        {label && (
          <label className="block text-sm font-medium text-primary">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={cn(
            "flex w-full min-h-[3.5rem] px-4 py-2 border-b border-input bg-transparent shadow-sm transition-colors resize-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 p1",
            variantStyles[variant],
            className
          )}
          disabled={isDisabled}
          rows={2}
          {...props}
        />
        {description && (
          <p className={cn(
            "text-sm",
            variant === "disabled" ? "text-tertiary" : "text-subtle"
          )}>
            {description}
          </p>
        )}
      </div>
    )
  }
)
DescriptionInput.displayName = "DescriptionInput"

export { DescriptionInput }
