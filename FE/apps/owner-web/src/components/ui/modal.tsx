import * as React from "react"
import { X } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { CheckCircleIcon, ExclamationTriangleIcon } from "@heroicons/react/24/solid"
import { Button } from "@shared/src/components/Button"
import { Spinner } from "./spinner"

export interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  detail?: React.ReactNode
  icon?: LucideIcon | "check-circle" | "exclamation" | "loading" | null
  iconShow?: boolean
  iconWrapperClassName?: string
  iconClassName?: string
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
    iconWrapperClassName,
    iconClassName,
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
          <div className={cn(
            "flex h-12 w-12 items-center justify-center",
            iconWrapperClassName
          )}>
            <CheckCircleIcon className={cn("h-full w-full text-success", iconClassName)} />
          </div>
        )
      }
      
      if (icon === "exclamation") {
        return (
          <div className={cn(
            "flex h-12 w-12 items-center justify-center",
            iconWrapperClassName
          )}>
            <ExclamationTriangleIcon className={cn("h-full w-full text-warning", iconClassName)} />
          </div>
        )
      }
      
      if (icon === "loading") {
        return (
          <div className={cn(
            "flex h-12 w-12 items-center justify-center",
            iconWrapperClassName
          )}>
            <Spinner className={cn("h-6 w-6 text-orange-500", iconClassName)} />
          </div>
        )
      }
      
      if (typeof icon !== "string") {
        const IconComponent = icon
        return (
          <div className={cn(
            "flex items-center justify-center",
            iconWrapperClassName
          )}>
            <IconComponent className={cn(iconClassName)} />
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
        style={{ margin: 0 }}
        onClick={handleOverlayClick}
      >
        {/* 오버레이 배경 */}
        <div 
          className="absolute inset-0 bg-black/50 backdrop-blur-sm z-0"
          onClick={handleOverlayClick}
        />
        
        {/* 모달 컨테이너 */}
        <div
          className={cn(
            "relative z-10 bg-white rounded-lg shadow-lg",
            "w-[336px]",
            "flex flex-col items-center gap-4 p-6",
            buttonShow ? "max-w-md" : "max-w-xs",
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
          <div className="flex w-full max-w-[288px] flex-col items-center gap-2">
            {/* 아이콘 */}
            {getIcon()}

            {/* 제목 */}
            {title && (
              <h2 className="h4-b text-primary text-center">
                {title}
              </h2>
            )}

            {/* 설명 텍스트 */}
            {modalBodyShow && detail && (
              <p className="p2 text-secondary text-center whitespace-pre-line">
                {detail}
              </p>
            )}
          </div>

          {/* 버튼 영역 */}
          {buttonShow && (
            <div className={cn(
              "w-full max-w-[288px] flex gap-1.5",
              variant === "single-button" ? "justify-center" : "justify-between"
            )}>
              {variant === "two-button" && (
                <Button
                  onClick={handleSecondaryClick}
                  btnStyle="filled-gray"
                  size="lg"
                  className={cn("flex-1 gap-2 hover:bg-gray-200")}
                >
                  {secondaryButtonText}
                </Button>
              )}
              <Button
                onClick={handlePrimaryClick}
                btnStyle="filled-red"
                size="lg"
                className={cn(
                  "gap-2 hover:bg-brand-strong",
                  variant === "single-button" ? "w-full" : "flex-1"
                )}
              >
                {primaryButtonText}
              </Button>
            </div>
          )}
        </div>
      </div>
    )
  }
)

Modal.displayName = "Modal"

export { Modal }

