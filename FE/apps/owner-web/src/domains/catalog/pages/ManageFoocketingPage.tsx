import * as React from "react"

import { Button } from "@shared/src/components/Button"
import { Plus } from "lucide-react"

import { MenuListItem } from "@/components/ui/menuListItem"
// TODO: 푸켓팅 API 연결 시 사용
// import { useOwnerStore } from "@/store/useOwnerStore"

interface FoocketingMenuItem {
  id: number
  menuName: string
  price: number
  categoryName: string
  imageUrl?: string
  foocketingQuantity: number
  foocketingTime: string
}

const SAMPLE_FOOCKETING_MENUS: FoocketingMenuItem[] = [
  {
    id: 1,
    menuName: "에그타르트",
    price: 4800,
    categoryName: "디저트",
    imageUrl: "https://picsum.photos/seed/egg/112/112",
    foocketingQuantity: 12,
    foocketingTime: "00:00",
  },
  {
    id: 2,
    menuName: "메뉴이름",
    price: 8500,
    categoryName: "카테고리",
    imageUrl: "https://picsum.photos/seed/menu1/112/112",
    foocketingQuantity: 8,
    foocketingTime: "00:00",
  },
  {
    id: 3,
    menuName: "메뉴이름",
    price: 5200,
    categoryName: "카테고리",
    imageUrl: "https://picsum.photos/seed/menu2/112/112",
    foocketingQuantity: 15,
    foocketingTime: "00:00",
  },
]

export default function ManageFoocketingPage() {
  const [menus, setMenus] = React.useState(SAMPLE_FOOCKETING_MENUS)
  // TODO: 푸켓팅 API 연결 시 getMenuById를 사용하여 카테고리 정보 채우기
  // const { getMenuById } = useOwnerStore()

  const handleAddMenu = React.useCallback(() => {
    // TODO: 연결된 모달/페이지로 이동
    window.alert("새 푸켓팅 메뉴를 추가하는 동작이 연결될 예정입니다.")
  }, [])

  const handleEditMenu = React.useCallback((menu: FoocketingMenuItem) => {
    // TODO: 수정 모달/페이지로 이동
    window.alert(`${menu.menuName} 수정`)
  }, [])

  const handleDeleteMenu = React.useCallback((menuId: number) => {
    setMenus((prevMenus) => prevMenus.filter((menu) => menu.id !== menuId))
  }, [])

  const handleSaveMenus = React.useCallback(() => {
    // TODO: 저장 API 연동
    window.alert("푸켓팅 메뉴 구성이 저장되는 동작이 연결될 예정입니다.")
  }, [])

  return (
    <div className="flex h-full w-full justify-center bg-bg-2">
      <div className="flex h-full w-full max-w-[412px] flex-col">
        <div className="flex-1 overflow-y-auto px-4 pt-6">
          <div className="flex flex-col gap-5">
            <section className="rounded-2xl bg-bg-0 p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <p className="h3-b text-brand">푸켓팅 관리</p>
                  <p className="p2 text-secondary">
                    푸켓팅 메뉴를 등록하고 편집하세요
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
              <div className="flex flex-col">
                {menus.map((menu) => (
                  <MenuListItem
                    key={menu.id}
                    variant="foocketing"
                    menuName={menu.menuName}
                    price={menu.price}
                    categoryName={menu.categoryName}
                    imageUrl={menu.imageUrl}
                    foocketingQuantity={menu.foocketingQuantity}
                    foocketingTime={menu.foocketingTime}
                    reorderable={false}
                    onEdit={() => handleEditMenu(menu)}
                    onDelete={() => handleDeleteMenu(menu.id)}
                  />
                ))}
              </div>
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
