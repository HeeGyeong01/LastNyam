import * as React from "react"
import { X, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@shared/src/components/Button"
import { ImageUpload, type UploadedFileInfo } from "./imageUpload"
import { Input } from "./ownerInput"
import { Modal } from "./modal"
import { useOwnerStore } from "@/store/useOwnerStore"
import { menuApi } from "@/domains/catalog/apis/menu.api"
import { TimeInput } from "./timeInput"
import { MenuListItem } from "./menuListItem"

export type AddMenuModalVariant = 
  | "create-menu" 
  | "edit-menu" 
  | "create-closeout" 
  | "edit-closeout"
  | "create-foocketing"
  | "edit-foocketing"
  | "select-menu"

export interface MenuData {
  menuId?: number
  name: string
  price: number
  image?: string | null
  description?: string
  category?: string
}

export interface AddMenuModalProps {
  open: boolean
  onClose: () => void
  onSave?: (menuId: number, data: MenuFormData) => void
  variant?: AddMenuModalVariant
  shopId?: number
  categories?: Array<{ value: string; label: string }>
  className?: string
  initialData?: Partial<MenuFormData>
  availableMenus?: MenuData[]
  onMenuSelect?: (menu: MenuData) => void
}

export interface MenuFormData {
  image: UploadedFileInfo | null
  name: string
  price: string
  description: string
  category: string | string[]
  // 마감세일 필드
  selectedMenu?: MenuData | null
  quantity?: string
  discountPrice?: string
  discountRate?: string
  // 푸켓팅 필드
  foocketingTime?: string
}

const AddMenuModal = React.forwardRef<HTMLDivElement, AddMenuModalProps>(
  (
    {
      open,
      onClose,
      onSave,
      variant = "create-menu",
      shopId,
      categories = [
        { value: "label1", label: "label" },
        { value: "label2", label: "label" },
        { value: "label3", label: "label" },
        { value: "label4", label: "label" },
      ],
      className,
      initialData,
      availableMenus = [],
      onMenuSelect,
    },
    ref
  ) => {
    const [isVisible, setIsVisible] = React.useState(false)
    const [isLoading, setIsLoading] = React.useState(false)
    const [showMenuSelectModal, setShowMenuSelectModal] = React.useState(false)
    const [selectedMenuForList, setSelectedMenuForList] = React.useState<string | null>(null)
    const [showConfirmModal, setShowConfirmModal] = React.useState(false)
    const [formData, setFormData] = React.useState<MenuFormData>({
      image: null,
      name: "",
      price: "",
      description: "",
      category: "",
      selectedMenu: null,
      quantity: "",
      discountPrice: "",
      discountRate: "",
      foocketingTime: "",
    })
    
    const { ownerId, accessToken } = useOwnerStore()

    // initialData를 formData에 반영
    React.useEffect(() => {
      if (initialData && open) {
        setFormData(prev => ({ ...prev, ...initialData }))
      }
    }, [initialData, open])

    React.useEffect(() => {
      if (open) {
        setIsVisible(true)
      } else {
        // 모달이 닫힐 때 폼 데이터 초기화
        const timer = setTimeout(() => {
          setIsVisible(false)
          setFormData({
            image: null,
            name: "",
            price: "",
            description: "",
            category: "",
            selectedMenu: null,
            quantity: "",
            discountPrice: "",
            discountRate: "",
            foocketingTime: "",
          })
          setSelectedMenuForList(null)
        }, 200)
        return () => clearTimeout(timer)
      }
    }, [open])

    if (!open && !isVisible) return null

    // variant에 따른 텍스트 설정
    const getModalConfig = () => {
      switch (variant) {
        case "create-menu":
          return {
            title: "새로운 메뉴 등록하기",
            subtitle: "판매가의 메뉴를 등록하세요",
            buttonText: "저장하기"
          }
        case "edit-menu":
          return {
            title: "메뉴 수정하기",
            subtitle: "등록된 메뉴를 수정하세요",
            buttonText: "수정하기"
          }
        case "create-closeout":
          return {
            title: "새로운 마감세일 등록하기",
            subtitle: "마감세일할 메뉴를 등록하세요",
            buttonText: "저장하기"
          }
        case "edit-closeout":
          return {
            title: "마감세일 수정하기",
            subtitle: "마감세일 중인 메뉴를 수정하세요",
            buttonText: "수정하기"
          }
        case "create-foocketing":
          return {
            title: "새로운 푸켓팅 등록하기",
            subtitle: "푸켓팅에 올릴 메뉴를 등록하세요",
            buttonText: "저장하기"
          }
        case "edit-foocketing":
          return {
            title: "푸켓팅 수정하기",
            subtitle: "푸켓팅 중인 메뉴를 수정하세요",
            buttonText: "수정하기"
          }
        case "select-menu":
          return {
            title: "메뉴선택하기",
            subtitle: "메뉴 관리는 가게관리 > 메뉴관리에서 가능합니다.",
            buttonText: "선택하기"
          }
        default:
          return {
            title: "새로운 메뉴 등록하기",
            subtitle: "판매가의 메뉴를 등록하세요",
            buttonText: "저장하기"
          }
      }
    }

    const modalConfig = getModalConfig()
    const isMenuVariant = variant === "create-menu" || variant === "edit-menu"
    const isCloseoutVariant = variant === "create-closeout" || variant === "edit-closeout"
    const isFoocketingVariant = variant === "create-foocketing" || variant === "edit-foocketing"
    const isSelectMenuVariant = variant === "select-menu"
    const isEditMode = variant === "edit-menu" || variant === "edit-closeout" || variant === "edit-foocketing"

    // 할인가/할인율 계산 로직
    const handleDiscountPriceChange = (value: string) => {
      const sanitized = value.replace(/[^0-9]/g, "")
      if (!sanitized) {
        setFormData(prev => ({ ...prev, discountPrice: "", discountRate: "" }))
        return
      }
      
      const numericPrice = parseInt(sanitized, 10)
      const basePrice = formData.selectedMenu?.price || 0
      
      if (basePrice > 0) {
        const rate = Math.round(((basePrice - numericPrice) / basePrice) * 100)
        const clampedRate = Math.max(0, Math.min(100, rate))
        setFormData(prev => ({ 
          ...prev, 
          discountPrice: numericPrice.toString(), 
          discountRate: clampedRate.toString() 
        }))
      } else {
        setFormData(prev => ({ ...prev, discountPrice: numericPrice.toString() }))
      }
    }

    const handleDiscountRateChange = (value: string) => {
      const sanitized = value.replace(/[^0-9]/g, "")
      if (!sanitized) {
        setFormData(prev => ({ ...prev, discountPrice: "", discountRate: "" }))
        return
      }
      
      const numericRate = Math.max(0, Math.min(100, parseInt(sanitized, 10)))
      const basePrice = formData.selectedMenu?.price || 0
      
      if (basePrice > 0) {
        const price = Math.round(basePrice * (1 - numericRate / 100))
        setFormData(prev => ({ 
          ...prev, 
          discountPrice: price.toString(), 
          discountRate: numericRate.toString() 
        }))
      } else {
        setFormData(prev => ({ ...prev, discountRate: numericRate.toString() }))
      }
    }

    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) {
        onClose()
      }
    }

    const handleMenuSelect = (menu: MenuData) => {
      setFormData(prev => ({ 
        ...prev, 
        selectedMenu: menu,
        name: menu.name,
        price: menu.price.toString()
      }))
      setShowMenuSelectModal(false)
      onMenuSelect?.(menu)
    }

    const handleSave = async () => {
      // 메뉴 선택 모달인 경우
      if (isSelectMenuVariant) {
        if (selectedMenuForList) {
          const selectedMenu = availableMenus.find(m => m.menuId?.toString() === selectedMenuForList)
          if (selectedMenu) {
            handleMenuSelect(selectedMenu)
          }
        }
        return
      }

      // 메뉴 등록/수정 필드 검증
      if (isMenuVariant) {
        if (!formData.name.trim()) {
          alert('메뉴 이름을 입력해주세요.')
          return
        }
        
        if (!formData.price || parseInt(formData.price, 10) <= 0) {
          alert('메뉴 가격을 입력해주세요.')
          return
        }
        
        if (!formData.description.trim()) {
          alert('메뉴 설명을 입력해주세요.')
          return
        }
        
        if (!formData.category) {
          alert('메뉴 카테고리를 선택해주세요.')
          return
        }
      }

      // 마감세일/푸켓팅 필드 검증
      if (isCloseoutVariant || isFoocketingVariant) {
        if (!formData.selectedMenu) {
          alert('메뉴를 선택해주세요.')
          return
        }

        if (!formData.quantity || parseInt(formData.quantity, 10) <= 0) {
          alert('수량을 입력해주세요.')
          return
        }

        if (isCloseoutVariant) {
          if (!formData.discountPrice || !formData.discountRate) {
            alert('할인가와 할인율을 입력해주세요.')
            return
          }
        }

        if (isFoocketingVariant) {
          if (!formData.foocketingTime) {
            alert('푸켓팅 시간을 입력해주세요.')
            return
          }
          
          // 푸켓팅 등록 시 무료 등록 동의 모달 띄우기
          if (variant === "create-foocketing") {
            setShowConfirmModal(true)
            return
          }
        }
      }
      
      // API 호출을 위한 필수 데이터 검증 (메뉴 등록만)
      if (isMenuVariant && variant === "create-menu") {
        if (!ownerId || !shopId || !accessToken) {
          alert('로그인 정보가 없습니다. 다시 로그인해주세요.')
          return
        }
        
        setIsLoading(true)
        
        try {
          const response = await menuApi.createMenu(
            ownerId,
            shopId,
            {
              menuName: formData.name,
              menuDescription: formData.description,
              menuImage: formData.image?.fileUrl || '',
              menuPrice: parseInt(formData.price, 10),
              category: typeof formData.category === 'string' 
                ? formData.category 
                : formData.category[0] || '',
            },
            accessToken
          )
          
          if (response.data?.menuId) {
            onSave?.(response.data.menuId, formData)
            // 폼 초기화
            setFormData({
              image: null,
              name: "",
              price: "",
              description: "",
              category: "",
              selectedMenu: null,
              quantity: "",
              discountPrice: "",
              discountRate: "",
              foocketingTime: "",
            })
            onClose()
          }
        } catch (error) {
          console.error('메뉴 등록 실패:', error)
          alert(error instanceof Error ? error.message : '메뉴 등록에 실패했습니다.')
        } finally {
          setIsLoading(false)
        }
      } else {
        // 다른 variant들은 onSave 콜백으로 처리
        onSave?.(formData.selectedMenu?.menuId || 0, formData)
        onClose()
      }
    }

    const handleConfirmSave = () => {
      setShowConfirmModal(false)
      // 푸켓팅 등록 실행
      onSave?.(formData.selectedMenu?.menuId || 0, formData)
      onClose()
    }

    return (
      <>
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
            "w-[340px] max-h-[calc(100vh-200px)]",
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
              {modalConfig.title}
            </h2>
            <p className="p3 text-subtle text-center">
              {modalConfig.subtitle}
            </p>
          </div>

          {/* 폼 필드 영역 - 스크롤 가능 */}
          <div className="py-3 flex flex-col gap-3 flex-1 overflow-y-auto">
            {/* 메뉴 선택 모달인 경우 */}
            {isSelectMenuVariant && (
              <div className="flex flex-col gap-2">
                {availableMenus.map((menu) => (
                  <MenuListItem
                    key={menu.menuId}
                    menuName={menu.name}
                    price={menu.price}
                    categoryName={menu.category || "카테고리"}
                    variant="select-menu"
                    selectState={selectedMenuForList === menu.menuId?.toString() ? "selected" : "unselected"}
                    onToggleSelect={(checked) => {
                      setSelectedMenuForList(checked ? menu.menuId?.toString() || null : null)
                    }}
                  />
                ))}
              </div>
            )}

            {/* 메뉴 등록/수정 variant */}
            {isMenuVariant && (
              <>
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
              </>
            )}

            {/* 마감세일/푸켓팅 variant */}
            {(isCloseoutVariant || isFoocketingVariant) && (
              <>
                {/* 메뉴 선택 */}
                <div className="flex justify-between items-center gap-2">
                  <div className="h5-b text-primary">메뉴 선택</div>
                  <Button
                    type="button"
                    btnStyle="filled-red"
                    onClick={() => setShowMenuSelectModal(true)}
                    className="flex items-center justify-center gap-2"
                  >
                    <span>{isEditMode ? "다시선택하기" : "메뉴선택하기"}</span>
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </div>

                {/* 선택된 메뉴 정보 표시 */}
                <div className="flex flex-row gap-2 items-center">
                  {/* 선택된 메뉴 이름 */}
                  <div className="flex-[50]">
                    <Input
                      variant="disabled"
                      size="sm"
                      value={formData.selectedMenu?.name || ""}
                      placeholder="선택된 메뉴 이름"
                      disabled
                    />
                  </div>
                  {/* 메뉴 단가 */}
                  <div className="flex-[50]">
                    <Input
                      variant="disabled"
                      size="sm"
                      unit="원"
                      value={formData.selectedMenu?.price.toLocaleString() || ""}
                      placeholder="메뉴 단가"
                      disabled
                    />
                  </div>
                </div>

                {/* 수량 */}
                <div className="flex flex-row gap-2 items-center">
                  <div className="h5-b text-primary w-[80px] shrink-0">
                    수량
                  </div>
                  <Input
                    variant="filled"
                    placeholder="수량을 입력하세요"
                    value={formData.quantity}
                    onChange={(e) => {
                      const sanitized = e.target.value.replace(/[^0-9]/g, "")
                      setFormData((prev) => ({ ...prev, quantity: sanitized }))
                    }}
                    inputMode="numeric"
                    className="flex-1 min-w-[120px]"
                  />
                </div>

                {/* 마감세일: 할인가/할인율 */}
                {isCloseoutVariant && (
                  <div className="flex flex-row gap-2 items-center">
                    <div className="h5-b text-primary w-[80px] shrink-0">
                      할인가
                    </div>
                    <div className="flex-1 flex gap-2">
                      <Input
                        variant="filled"
                        placeholder="할인가"
                        unit="원"
                        value={formData.discountPrice}
                        onChange={(e) => handleDiscountPriceChange(e.target.value)}
                        inputMode="numeric"
                        className="flex-1"
                      />
                      <Input
                        variant="filled"
                        placeholder="할인율"
                        unit="%"
                        value={formData.discountRate}
                        onChange={(e) => handleDiscountRateChange(e.target.value)}
                        inputMode="numeric"
                        className="flex-1"
                      />
                    </div>
                  </div>
                )}

                {/* 푸켓팅: 푸켓팅 시간 */}
                {isFoocketingVariant && (
                  <div className="flex flex-row gap-2 items-center">
                    <div className="h5-b text-primary w-[110px] shrink-0">
                      푸켓팅 시간
                    </div>
                    <TimeInput
                      value={formData.foocketingTime}
                      onChange={(value) => setFormData((prev) => ({ ...prev, foocketingTime: value }))}
                      variant="filled"
                      interval30={true}
                      className="flex-1"
                    />
                  </div>
                )}
              </>
            )}
          </div>

          {/* 저장하기 버튼 - 하단 고정 */}
          <div className="pt-2 shrink-0">
            <Button
              onClick={handleSave}
              btnStyle="filled-red"
              size="lg"
              className="w-full"
              disabled={isLoading}
            >
              {modalConfig.buttonText}
            </Button>
          </div>
        </div>
      </div>

      {/* 로딩 모달 */}
      <Modal
        open={isLoading}
        onClose={() => {}}
        title="메뉴 등록 중..."
        detail="잠시만 기다려주세요."
        icon="loading"
        iconShow={true}
        xButtonShow={false}
        buttonShow={false}
      />

      {/* 메뉴 선택 모달 (마감세일/푸켓팅용) */}
      {(isCloseoutVariant || isFoocketingVariant) && showMenuSelectModal && (
        <AddMenuModal
          open={showMenuSelectModal}
          onClose={() => setShowMenuSelectModal(false)}
          variant="select-menu"
          availableMenus={availableMenus}
          onMenuSelect={handleMenuSelect}
        />
      )}

      {/* 무료 등록 동의 모달 (푸켓팅용) */}
      <Modal
        open={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="무료 등록 동의"
        detail={`이 물건은 ${formData.foocketingTime}에 무료로 공개됩니다.\n이에 동의하신다면 진행해주세요.`}
        icon="exclamation"
        variant="two-button"
        primaryButtonText="확인"
        secondaryButtonText="취소"
        onPrimaryClick={handleConfirmSave}
        onSecondaryClick={() => setShowConfirmModal(false)}
      />
      </>
    )
  }
)

AddMenuModal.displayName = "AddMenuModal"

export { AddMenuModal }

