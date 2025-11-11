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

interface MenuItem {
  id: number
  menuName: string
  price: number
  categoryName: string
  imageUrl?: string
}

const SAMPLE_MENUS: MenuItem[] = [
  {
    id: 1,
    menuName: "에그타르트",
    price: 4800,
    categoryName: "디저트",
    imageUrl: "https://picsum.photos/seed/egg/112/112",
  },
  {
    id: 2,
    menuName: "크리스피 치킨 샌드위치",
    price: 8500,
    categoryName: "시그니처",
    imageUrl: "https://picsum.photos/seed/chicken/112/112",
  },
  {
    id: 3,
    menuName: "상큼 과일 에이드",
    price: 5200,
    categoryName: "음료",
    imageUrl: "https://picsum.photos/seed/drink/112/112",
  },
]

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
  const [menus, setMenus] = React.useState(SAMPLE_MENUS)

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
      setMenus((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)

        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }, [])

  const handleAddMenu = React.useCallback(() => {
    // TODO: 연결된 모달/페이지로 이동
    window.alert("새 메뉴를 추가하는 동작이 연결될 예정입니다.")
  }, [])

  const handleSaveMenus = React.useCallback(() => {
    // TODO: 저장 API 연동
    window.alert("메뉴 구성이 저장되는 동작이 연결될 예정입니다.")
  }, [])

  return (
    <div className="flex h-full w-full justify-center bg-bg-2">
      <div className="flex h-full w-full max-w-[412px] flex-col">
        <div className="flex-1 overflow-y-auto px-4 pt-6">
          <div className="flex flex-col gap-5">
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
    </div>
  )
}