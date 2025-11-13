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
import { AddMenuModal, type MenuFormData } from "@/components/ui/addMenuModal"
import { useOwnerStore, type Menu } from "@/store/useOwnerStore"
import { menuApi } from "../apis/menu.api"

interface MenuItem {
  id: number
  menuName: string
  price: number
  categoryName: string
  imageUrl?: string
}

function SortableMenuItem({ menu }: { menu: MenuItem }) {
  const {
    attributes,
    listeners,
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
        variant="default"
        menuName={menu.menuName}
        price={menu.price}
        categoryName={menu.categoryName}
        imageUrl={menu.imageUrl}
        isDragging={isDragging}
        dragHandleProps={{
          ...attributes,
          ...listeners,
        }}
        onEdit={() => window.alert(`${menu.menuName} 수정`)}
        onDelete={() => window.alert(`${menu.menuName} 삭제`)}
      />
    </div>
  )
}

export default function ManageMenuPage() {
  const [isAddMenuModalOpen, setIsAddMenuModalOpen] = React.useState(false)
  const { 
    shops, 
    ownerId, 
    accessToken, 
    menus: storeMenus,
    isMenusLoading,
    setMenus,
    setMenusLoading,
    addMenu,
  } = useOwnerStore()
  
  // 첫 번째 shop의 ID를 사용 (실제로는 선택된 shop을 사용해야 함)
  const currentShopId = shops[0]?.shopId

  // MenuItem 형식으로 변환
  const menus: MenuItem[] = React.useMemo(() => 
    storeMenus.map((menu) => ({
      id: menu.menuId,
      menuName: menu.menuName,
      price: menu.menuPrice,
      categoryName: menu.categoryName,
      imageUrl: menu.menuImage,
    })),
    [storeMenus]
  )

  // 메뉴 목록 조회
  React.useEffect(() => {
    const fetchMenus = async () => {
      console.log('🔍 메뉴 조회 시작')
      console.log('ownerId:', ownerId)
      console.log('currentShopId:', currentShopId)
      console.log('accessToken:', accessToken ? '있음' : '없음')
      
      if (!ownerId || !currentShopId || !accessToken) {
        console.log('❌ 필수 정보 없음 - 조회 중단')
        setMenusLoading(false)
        return
      }

      try {
        setMenusLoading(true)
        const response = await menuApi.getMenus(ownerId, currentShopId, accessToken)
        console.log('📦 API 응답:', response)
        
        if (response.data?.menus) {
          console.log('📝 받은 메뉴 개수:', response.data.menus.length)
          console.log('📝 원본 메뉴 데이터:', response.data.menus)
          
          // Store에 메뉴 저장
          setMenus(response.data.menus)
          console.log('✅ Store에 메뉴 저장 완료')
        } else {
          console.log('⚠️ 응답에 메뉴 데이터 없음')
        }
      } catch (error) {
        console.error('❌ 메뉴 목록 조회 실패:', error)
        window.alert(error instanceof Error ? error.message : '메뉴 목록을 불러오는데 실패했습니다.')
      } finally {
        setMenusLoading(false)
        console.log('✨ 메뉴 조회 완료')
      }
    }

    fetchMenus()
  }, [ownerId, currentShopId, accessToken, setMenus, setMenusLoading])

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

  const handleDragEnd = React.useCallback((event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = storeMenus.findIndex((item) => item.menuId === active.id)
      const newIndex = storeMenus.findIndex((item) => item.menuId === over.id)

      if (oldIndex !== -1 && newIndex !== -1) {
        const reorderedMenus = arrayMove(storeMenus, oldIndex, newIndex)
        setMenus(reorderedMenus)
      }
    }
  }, [storeMenus, setMenus])

  const handleAddMenu = React.useCallback(() => {
    setIsAddMenuModalOpen(true)
  }, [])

  const handleSaveNewMenu = React.useCallback((menuId: number, data: MenuFormData) => {
    console.log('➕ 새 메뉴 추가')
    console.log('menuId:', menuId)
    console.log('폼 데이터:', data)
    
    // API에서 받은 menuId를 사용하여 새 메뉴 생성 (Store 형식)
    const newMenu: Menu = {
      menuId,
      menuName: data.name,
      menuPrice: parseInt(data.price, 10) || 0,
      categoryName: typeof data.category === 'string' ? data.category : data.category[0] || '기타',
      menuImage: data.image?.fileUrl || '',
      menuDescription: data.description || '',
    }

    console.log('생성된 메뉴:', newMenu)
    addMenu(newMenu)
    console.log('✅ Store에 메뉴 추가 완료')
  }, [addMenu])

  const handleSaveMenus = React.useCallback(() => {
    // TODO: 저장 API 연동
    window.alert("메뉴 구성이 저장되는 동작이 연결될 예정입니다.")
  }, [])

  return (
    <div className="flex h-full w-full justify-center bg-bg-2">
      <div className="flex h-full w-full max-w-[412px] flex-col">
        <div className="flex-1 overflow-y-auto px-4 pt-6">
          <div className="flex flex-col gap-5 pb-4">
            <section className="rounded-2xl bg-bg-0 p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <p className="h3-b text-brand">메뉴관리</p>
                  <p className="p2 text-secondary">
                    판매가 메뉴를 등록하고 편집하세요
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
              {isMenusLoading ? (
                <div className="flex items-center justify-center py-20">
                  <p className="p2 text-secondary">메뉴 목록을 불러오는 중...</p>
                </div>
              ) : menus.length === 0 ? (
                <div className="flex items-center justify-center py-20">
                  <p className="p2 text-secondary">등록된 메뉴가 없습니다.</p>
                </div>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={menus.map((m) => m.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="flex flex-col">
                      {menus.map((menu) => (
                        <SortableMenuItem key={menu.id} menu={menu} />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </section>
          </div>
        </div>

        <div className="shrink-0 px-4 pb-4 pt-3 bg-bg-0">
          <Button
            btnStyle="filled-red"
            size="lg"
            className="w-full"
            onClick={handleSaveMenus}
          >
            저장하기
          </Button>
        </div>
      </div>

      {/* 메뉴 추가 모달 */}
      <AddMenuModal
        open={isAddMenuModalOpen}
        onClose={() => setIsAddMenuModalOpen(false)}
        onSave={handleSaveNewMenu}
        shopId={currentShopId}
        categories={[
          { value: '베이커리', label: '베이커리' },
          { value: '회/초밥', label: '회/초밥' },
          { value: '김밥/분식', label: '김밥/분식' },
          { value: '샐러드/포케', label: '샐러드/포케' },
          { value: '기타', label: '기타' },
        ]}
      />
    </div>
  )
}