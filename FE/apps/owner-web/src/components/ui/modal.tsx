import * as React from "react"
import { X, CheckCircle } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Spinner } from "./spinner"

export interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  detail?: string
  icon?: LucideIcon | "check-circle" | "loading" | null
  iconShow?: boolean
  xButton?: boolean
  xButtonShow?: boolean
  buttonShow?: boolean
  modalBodyShow?: boolean
  variant?: "single-button" | "two-button"
  primaryButtonText?: string
  secondaryButtonText?: string
  onPrimaryClick?: () => void
  onSecondaryClick?: () => void
  className?: string
}

const Modal = React.forwardRef<HTMLDivElement, ModalProps>(
  ({
    open,
    onClose,
    title,
    detail,
    icon,
    iconShow = true,
    xButton = true,
    xButtonShow = true,
    buttonShow = true,
    modalBodyShow = true,
    variant = "two-button",
    primaryButtonText = "확인",
    secondaryButtonText = "취소",
    onPrimaryClick,
    onSecondaryClick,
    className,
  }, ref) => {
    const [isVisible, setIsVisible] = React.useState(false)

    React.useEffect(() => {
      if (open) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }, [open])

    if (!open && !isVisible) return null

    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) {
        onClose()
      }
    }

    const handlePrimaryClick = () => {
      onPrimaryClick?.() || onClose()
    }

    const handleSecondaryClick = () => {
      onSecondaryClick?.() || onClose()
    }

    const getIcon = () => {
      if (!iconShow || !icon) return null
      
      if (icon === "check-circle") {
        return (
          <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
        )
      }
      
      if (icon === "loading") {
        return (
          <div className="w-16 h-16 flex items-center justify-center mb-4">
            <Spinner className="w-8 h-8 text-orange-500" />
          </div>
        )
      }
      
      if (typeof icon !== "string") {
        const IconComponent = icon
        return (
          <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center mb-4">
            <IconComponent className="w-8 h-8 text-white" />
          </div>
        )
      }
      
      return null
    }

    return (
      <div
        ref={ref}
        className={cn(
          "fixed inset-0 z-[100] flex items-center justify-center",
          open ? "opacity-100" : "opacity-0 pointer-events-none",
          "transition-opacity duration-200"
        )}
        onClick={handleOverlayClick}
      >
        {/* 오버레이 배경 */}
        <div 
          className="absolute inset-0 bg-black/50"
          onClick={handleOverlayClick}
        />
        
        {/* 모달 컨테이너 */}
        <div
          className={cn(
            "relative bg-white rounded-lg shadow-lg",
            "w-full mx-4",
            buttonShow ? "max-w-md" : "max-w-xs",
            "flex flex-col items-center",
            buttonShow ? "px-6 py-8" : "px-4 py-6",
            open ? "scale-100" : "scale-95",
            "transition-transform duration-200",
            className
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* X 버튼 */}
          {xButton && xButtonShow && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
              aria-label="닫기"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          {/* 아이콘 */}
          {getIcon()}

          {/* 제목 */}
          {title && (
            <h2 className="h4-b text-primary mb-2 text-center">
              {title}
            </h2>
          )}

          {/* 설명 텍스트 */}
          {modalBodyShow && detail && (
            <p className="p2 text-secondary mb-6 text-center whitespace-pre-line">
              {detail}
            </p>
          )}

          {/* 버튼 영역 */}
          {buttonShow && (
            <div className={cn(
              "w-full flex gap-3",
              variant === "single-button" ? "justify-center" : "justify-between"
            )}>
              {variant === "two-button" && (
                <button
                  onClick={handleSecondaryClick}
                  className={cn(
                    "flex-1 px-6 py-3 rounded-lg",
                    "bg-gray-100 text-gray-900",
                    "hover:bg-gray-200",
                    "transition-colors duration-200",
                    "font-medium"
                  )}
                >
                  {secondaryButtonText}
                </button>
              )}
              <button
                onClick={handlePrimaryClick}
                className={cn(
                  variant === "single-button" ? "px-8" : "flex-1",
                  "px-6 py-3 rounded-lg",
                  "bg-brand text-inverse",
                  "hover:bg-orange-600",
                  "transition-colors duration-200",
                  "font-medium"
                )}
              >
                {primaryButtonText}
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }
)

Modal.displayName = "Modal"

export { Modal }

