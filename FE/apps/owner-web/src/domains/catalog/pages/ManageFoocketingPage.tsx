import * as React from "react"

import { Button } from "@shared/src/components/Button"
import { Plus } from "lucide-react"

import { MenuListItem } from "@/components/ui/menuListItem"
import { useOwnerStore } from "@/store/useOwnerStore"
import { foocketingApi } from "@/domains/catalog/apis/foocketing.api"

interface FoocketingMenuItem {
  id: number
  menuName: string
  price: number
  categoryName: string
  imageUrl?: string
  foocketingQuantity: number
  foocketingTime: string
}

export default function ManageFoocketingPage() {
  const [menus, setMenus] = React.useState<FoocketingMenuItem[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  
  const { ownerId, accessToken, shops, getMenuById } = useOwnerStore()
  const shopId = shops[0]?.shopId

  // 푸켓팅 목록 조회
  React.useEffect(() => {
    const fetchFoocketings = async () => {
      if (!ownerId || !shopId || !accessToken) {
        setError("인증 정보가 없습니다.")
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)
        
        const response = await foocketingApi.getFoocketings(
          ownerId,
          shopId,
          accessToken
        )

        if (response.data?.foocketings) {
          const foocketingMenus: FoocketingMenuItem[] = response.data.foocketings.map(
            (foocketing) => {
              // store에서 menuId로 카테고리 정보 가져오기
              const menuInfo = getMenuById(foocketing.menuId)
              
              // foocketingTime을 시간만 표시 (HH:mm 형식)
              const foocketingTimeDisplay = foocketing.foocketingTime
                ? new Date(foocketing.foocketingTime).toLocaleTimeString('ko-KR', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false,
                  })
                : "00:00"

              return {
                id: foocketing.foocketingId,
                menuName: foocketing.menuName,
                price: foocketing.menuPrice,
                categoryName: menuInfo?.categoryName || "미분류",
                imageUrl: foocketing.menuImage,
                foocketingQuantity: foocketing.foocketingAmount,
                foocketingTime: foocketingTimeDisplay,
              }
            }
          )
          
          setMenus(foocketingMenus)
        }
      } catch (err) {
        console.error("푸켓팅 목록 조회 실패:", err)
        setError(err instanceof Error ? err.message : "푸켓팅 목록을 불러오는데 실패했습니다.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchFoocketings()
  }, [ownerId, shopId, accessToken, getMenuById])

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
          <div className="flex flex-col gap-5 pb-4">
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
              {isLoading ? (
                <div className="flex items-center justify-center py-10">
                  <p className="p2 text-secondary">푸켓팅 목록을 불러오는 중...</p>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center py-10">
                  <p className="p2 text-error">{error}</p>
                </div>
              ) : menus.length === 0 ? (
                <div className="flex items-center justify-center py-10">
                  <p className="p2 text-secondary">등록된 푸켓팅 메뉴가 없습니다.</p>
                </div>
              ) : (
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
    </div>
  )
}
