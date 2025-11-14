import * as React from "react"

import { Button } from "@shared/src/components/Button"
import { Plus } from "lucide-react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

import { MenuListItem } from "@/components/ui/menuListItem"
import { AddMenuModal, type MenuData, type MenuFormData } from "@/components/ui/addMenuModal"
import { menuApi } from "@/domains/catalog/apis/menu.api"
import { useOwnerStore } from "@/store/useOwnerStore"

interface CloseoutMenuItem {
  id: number
  menuName: string
  price: number
  categoryName: string
  imageUrl?: string
  saleQuantity: number
  discountRate: number
  discountPrice: number
  originalPrice: number
}

function SortableCloseoutMenuItem({ menu }: { menu: CloseoutMenuItem }) {
  const {
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: menu.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div ref={setNodeRef} style={style}>
      <MenuListItem
        variant="closeout-sale"
        menuName={menu.menuName}
        price={menu.price}
        categoryName={menu.categoryName}
        imageUrl={menu.imageUrl}
        saleQuantity={menu.saleQuantity}
        discountRate={menu.discountRate}
        discountPrice={menu.discountPrice}
        originalPrice={menu.originalPrice}
        isDragging={isDragging}
        reorderable={false}
        onEdit={() => window.alert(`${menu.menuName} 수정`)}
        onDelete={() => window.alert(`${menu.menuName} 삭제`)}
      />
    </div>
  )
}

export default function ManageCloseoutSalePage() {
  const [discountMenus, setDiscountMenus] = React.useState<CloseoutMenuItem[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [closeoutSaleModalOpen, setCloseoutSaleModalOpen] = React.useState(false)
  const { ownerId, accessToken, shops, getMenuById, menus, setMenus, setMenusLoading } = useOwnerStore()

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  // 메뉴 데이터 로드 (store에 없으면)
  React.useEffect(() => {
    const fetchMenus = async () => {
      // 이미 메뉴가 있으면 스킵
      if (menus.length > 0) {
        return
      }

      if (!ownerId || !accessToken || shops.length === 0) {
        return
      }

      try {
        console.log('📋 마감세일 페이지에서 메뉴 로드 중...')
        setMenusLoading(true)
        const shopId = shops[0].shopId
        const response = await menuApi.getMenus(ownerId, shopId, accessToken)
        
        if (response.data?.menus) {
          setMenus(response.data.menus)
          console.log('✅ 메뉴 로드 완료:', response.data.menus.length, '개')
        }
      } catch (error) {
        console.error('❌ 메뉴 로드 실패:', error)
      } finally {
        setMenusLoading(false)
      }
    }

    fetchMenus()
  }, [ownerId, accessToken, shops, menus.length, setMenus, setMenusLoading])

  // 마감세일 목록 조회
  React.useEffect(() => {
    const fetchDiscounts = async () => {
      if (!ownerId || !accessToken || shops.length === 0) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        const shopId = shops[0].shopId
        const response = await menuApi.getDiscounts(ownerId, shopId, accessToken)

        if (response.data?.discounts) {
          // Store의 메뉴 정보를 활용하여 카테고리 정보 채우기
          const mappedMenus: CloseoutMenuItem[] = response.data.discounts.map((discount) => {
            const menuInfo = getMenuById(discount.menuId)
            return {
              id: discount.discountId,
              menuName: discount.menuName,
              price: discount.discountPrice,
              categoryName: menuInfo?.categoryName || "기타",
              imageUrl: discount.menuImage,
              saleQuantity: discount.discountMenuAmount,
              discountRate: discount.discountRate,
              discountPrice: discount.discountPrice,
              originalPrice: discount.menuPrice,
            }
          })
          setDiscountMenus(mappedMenus)
        }
      } catch (error) {
        console.error("마감세일 목록 조회 실패:", error)
        window.alert(error instanceof Error ? error.message : "마감세일 목록을 불러오는데 실패했습니다.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchDiscounts()
  }, [ownerId, accessToken, shops, getMenuById])

  const handleDragEnd = React.useCallback((event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setDiscountMenus((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)

        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }, [])

  // Store의 메뉴를 availableMenus 형식으로 변환
  const availableMenus: MenuData[] = React.useMemo(() => {
    return menus.map((menu) => ({
      menuId: menu.menuId,
      name: menu.menuName,
      price: menu.menuPrice,
      image: menu.menuImage,
      description: menu.menuDescription,
      category: menu.categoryName,
    }))
  }, [menus])

  const handleAddMenu = React.useCallback(() => {
    setCloseoutSaleModalOpen(true)
  }, [])

  const handleSaveCloseout = React.useCallback(async (_menuId: number, data: MenuFormData) => {
    if (!ownerId || !accessToken || shops.length === 0 || !data.selectedMenu) {
      window.alert("필수 정보가 누락되었습니다.")
      return
    }

    try {
      const shopId = shops[0].shopId
      await menuApi.createDiscount(
        ownerId,
        shopId,
        {
          menuId: data.selectedMenu.menuId!,
          discountPrice: parseInt(data.discountPrice || "0", 10),
          discountMenuAmount: parseInt(data.quantity || "0", 10),
        },
        accessToken
      )

      // 마감세일 목록 새로고침
      const response = await menuApi.getDiscounts(ownerId, shopId, accessToken)
      if (response.data?.discounts) {
        const mappedMenus: CloseoutMenuItem[] = response.data.discounts.map((discount) => {
          const menuInfo = getMenuById(discount.menuId)
          return {
            id: discount.discountId,
            menuName: discount.menuName,
            price: discount.discountPrice,
            categoryName: menuInfo?.categoryName || "기타",
            imageUrl: discount.menuImage,
            saleQuantity: discount.discountMenuAmount,
            discountRate: discount.discountRate,
            discountPrice: discount.discountPrice,
            originalPrice: discount.menuPrice,
          }
        })
        setDiscountMenus(mappedMenus)
      }

      setCloseoutSaleModalOpen(false)
      window.alert("마감세일 메뉴가 등록되었습니다.")
    } catch (error) {
      console.error("마감세일 등록 실패:", error)
      window.alert(error instanceof Error ? error.message : "마감세일 등록에 실패했습니다.")
    }
  }, [ownerId, accessToken, shops, getMenuById])

  // const handleSaveMenus = React.useCallback(() => {
  //   // TODO: 저장 API 연동
  //   window.alert("마감세일 메뉴 구성이 저장되는 동작이 연결될 예정입니다.")
  // }, [])

  return (
    <div className="flex h-full w-full justify-center bg-bg-2">
      <div className="flex h-full w-full max-w-[412px] flex-col">
        <div className="flex-1 overflow-y-auto px-4 pt-6">
          <div className="flex flex-col gap-5 pb-4">
            <section className="rounded-2xl bg-bg-0 p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <p className="h3-b text-brand">마감세일 관리</p>
                  <p className="p2 text-secondary">
                    마감세일 메뉴를 등록하고 편집하세요
                  </p>
                </div>
                <Button
                  btnStyle="filled-red"
                  className="gap-1.5 px-4 py-2"
                  onClick={handleAddMenu}
                >
                  <Plus className="h-4 w-4" />
                  메뉴추가
                </Button>
              </div>
            </section>

            <section className="bg-bg-0 rounded-2xl shadow-sm overflow-hidden pb-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-10">
                  <p className="p2 text-secondary">마감세일 목록을 불러오는 중...</p>
                </div>
              ) : discountMenus.length === 0 ? (
                <div className="flex items-center justify-center py-10">
                  <p className="p2 text-secondary">등록된 마감세일 메뉴가 없습니다.</p>
                </div>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={discountMenus.map((m) => m.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="flex flex-col">
                      {discountMenus.map((menu) => (
                        <SortableCloseoutMenuItem key={menu.id} menu={menu} />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </section>
          </div>
        </div>

        {/* <div className="shrink-0 px-4 pb-4 pt-3 bg-bg-0">
          <Button
            btnStyle="filled-red"
            size="lg"
            className="w-full"
            onClick={handleSaveMenus}
          >
            저장하기
          </Button>
        </div> */}
      </div>

      {/* 마감세일 등록 모달 */}
      <AddMenuModal
        open={closeoutSaleModalOpen}
        onClose={() => setCloseoutSaleModalOpen(false)}
        variant="create-closeout"
        onSave={handleSaveCloseout}
        availableMenus={availableMenus}
        shopId={shops.length > 0 ? shops[0].shopId : undefined}
      />
    </div>
  )
}
