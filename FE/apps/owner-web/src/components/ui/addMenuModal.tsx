import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@shared/src/components/Button"
import { ImageUpload, type UploadedFileInfo } from "./imageUpload"
import { Input } from "./ownerInput"

export interface AddMenuModalProps {
  open: boolean
  onClose: () => void
  onSave?: (data: MenuFormData) => void
  categories?: Array<{ value: string; label: string }>
  className?: string
}

export interface MenuFormData {
  image: UploadedFileInfo | null
  name: string
  price: string
  description: string
  category: string | string[]
}

const AddMenuModal = React.forwardRef<HTMLDivElement, AddMenuModalProps>(
  (
    {
      open,
      onClose,
      onSave,
      categories = [
        { value: "label1", label: "label" },
        { value: "label2", label: "label" },
        { value: "label3", label: "label" },
        { value: "label4", label: "label" },
      ],
      className,
    },
    ref
  ) => {
    const [isVisible, setIsVisible] = React.useState(false)
    const [formData, setFormData] = React.useState<MenuFormData>({
      image: null,
      name: "",
      price: "",
      description: "",
      category: "",
    })

    React.useEffect(() => {
      if (open) {
        setIsVisible(true)
      } else {
        const timer = setTimeout(() => setIsVisible(false), 200)
        return () => clearTimeout(timer)
      }
    }, [open])

    if (!open && !isVisible) return null

    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) {
        onClose()
      }
    }

    const handleSave = () => {
      onSave?.(formData)
      onClose()
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
          className="absolute inset-0 bg-bg-dimmed-1 backdrop-blur-sm z-0"
          onClick={handleOverlayClick}
        />

        {/* 모달 컨테이너 */}
        <div
          className={cn(
            "relative z-10 bg-bg-0 rounded-md",
            "border border-stroke-subtle",
            "shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)]",
            "w-[340px] h-[614px]",
            "flex flex-col",
            "p-4",
            open ? "scale-100" : "scale-95",
            "transition-transform duration-200",
            className
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* X 버튼 */}
          <button
            onClick={onClose}
            className="absolute top-4 right-3 text-subtle hover:text-primary transition-colors z-10"
            aria-label="닫기"
          >
            <X className="w-5 h-5" />
          </button>

          {/* 헤더 */}
          <div className="pt-6 pb-4 flex flex-col items-center gap-0 shrink-0">
            <h2 className="h3-b text-brand text-center">
              새로운 메뉴 등록하기
            </h2>
            <p className="p3 text-subtle text-center">
              판매가의 메뉴를 등록하세요
            </p>
          </div>

          {/* 폼 필드 영역 - 스크롤 가능 */}
          <div className="py-3 flex flex-col gap-3 flex-1 overflow-y-auto">
            {/* 이미지 업로드 */}
            <div className="flex flex-col items-center gap-2">
              <ImageUpload
                value={formData.image}
                onChange={(file) =>
                  setFormData((prev) => ({ ...prev, image: file }))
                }
                fileType="MENU_IMAGE"
                className="w-full"
              />
            </div>

            {/* 메뉴 이름 */}
            <div className="flex flex-row gap-2 items-center">
              <div className="h5-b text-primary w-[110px] shrink-0">
                메뉴 이름
              </div>
              <Input
                variant="filled"
                placeholder="메뉴 이름을 입력하세요"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                className="flex-1 min-w-[120px]"
              />
            </div>

            {/* 메뉴 가격 */}
            <div className="flex flex-row gap-2 items-center">
              <div className="h5-b text-primary w-[110px] shrink-0">
                메뉴 가격
              </div>
              <Input
                variant="filled"
                placeholder="가격을 입력하세요"
                unit="원"
                value={formData.price}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, price: e.target.value }))
                }
                inputMode="numeric"
                className="flex-1 min-w-[120px]"
              />
            </div>

            {/* 메뉴 설명 */}
            <div className="flex flex-col gap-2">
              <div className="h5-b text-primary">메뉴 설명</div>
              <textarea
                placeholder="메뉴 설명을 입력하세요"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                className={cn(
                  "w-full h-20 px-4 py-2",
                  "bg-bg-1 border-b border-subtle",
                  "text-p1 text-primary placeholder:text-subtle",
                  "focus:outline-none focus:border-primary",
                  "resize-none"
                )}
              />
            </div>

            {/* 메뉴 카테고리 */}
            <div className="flex flex-row gap-2 items-center">
              <div className="h5-b text-primary w-[110px] shrink-0 whitespace-nowrap">
                메뉴 카테고리
              </div>
              <div
                className={cn(
                  "flex-1 flex gap-1 overflow-x-auto py-1",
                  "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                )}
              >
                {categories.map((option) => {
                  const isSelected =
                    typeof formData.category === "string"
                      ? formData.category === option.value
                      : formData.category.includes(option.value)

                  return (
                    <Button
                      key={option.value}
                      type="button"
                      btnStyle={isSelected ? "filled-red" : "filled-default"}
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          category: option.value,
                        }))
                      }
                      className="shrink-0 px-3.5"
                    >
                      {option.label}
                    </Button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* 저장하기 버튼 - 하단 고정 */}
          <div className="pt-0 shrink-0">
            <Button
              onClick={handleSave}
              btnStyle="filled-red"
              className="w-full py-2.5 px-5"
            >
              저장하기
            </Button>
          </div>
        </div>
      </div>
    )
  }
)

AddMenuModal.displayName = "AddMenuModal"

export { AddMenuModal }

