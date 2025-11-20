import * as React from "react"

import { Button } from "@shared/src/components/Button"
import { Plus } from "lucide-react"

import { MenuListItem } from "@/components/ui/menuListItem"
import { AddMenuModal, type MenuData, type MenuFormData } from "@/components/ui/addMenuModal"
import { useOwnerStore } from "@/store/useOwnerStore"
import { foocketingApi } from "@/domains/catalog/apis/foocketing.api"
import { menuApi } from "@/domains/catalog/apis/menu.api"

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
  const [foocketingModalOpen, setFoocketingModalOpen] = React.useState(false)
  
  const { 
    ownerId, 
    accessToken, 
    shops, 
    getMenuById, 
    menus: storeMenus,
    setMenus: setStoreMenus,
    setMenusLoading 
  } = useOwnerStore()
  const shopId = shops[0]?.shopId

  // 메뉴 데이터 로드 (store에 없으면)
  React.useEffect(() => {
    const fetchMenus = async () => {
      // 이미 메뉴가 있으면 스킵
      if (storeMenus.length > 0) {
        return
      }

      if (!ownerId || !shopId || !accessToken) {
        return
      }

      try {
        console.log('📋 푸켓팅 페이지에서 메뉴 로드 중...')
        setMenusLoading(true)
        const response = await menuApi.getMenus(ownerId, shopId, accessToken)
        
        if (response.data?.menus) {
          setStoreMenus(response.data.menus)
          console.log('✅ 메뉴 로드 완료:', response.data.menus.length, '개')
        }
      } catch (err) {
        console.error('❌ 메뉴 로드 실패:', err)
      } finally {
        setMenusLoading(false)
      }
    }

    fetchMenus()
  }, [ownerId, shopId, accessToken, storeMenus.length, setStoreMenus, setMenusLoading])

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
    setFoocketingModalOpen(true)
  }, [])

  const handleEditMenu = React.useCallback((menu: FoocketingMenuItem) => {
    // TODO: 수정 모달/페이지로 이동
    window.alert(`${menu.menuName} 수정`)
  }, [])

  const handleDeleteMenu = React.useCallback((menuId: number) => {
    setMenus((prevMenus) => prevMenus.filter((menu) => menu.id !== menuId))
  }, [])

  // const handleSaveMenus = React.useCallback(() => {
  //   // TODO: 저장 API 연동
  //   window.alert("푸켓팅 메뉴 구성이 저장되는 동작이 연결될 예정입니다.")
  // }, [])

  const handleSaveFoocketing = React.useCallback(async (menuId: number, data: MenuFormData) => {
    if (!ownerId || !shopId || !accessToken) {
      window.alert("인증 정보가 없습니다.")
      return
    }

    try {
      // 푸켓팅 시간 형식 변환: "HH:mm" -> "HH:mm:ss"
      const foocketingTime = data.foocketingTime 
        ? `${data.foocketingTime}:00` 
        : "00:00:00"
      
      // 푸켓팅 등록 API 호출
      await foocketingApi.createFoocketing(
        ownerId,
        shopId,
        {
          foocketingTime,
          foocketingAmount: parseInt(data.quantity || "0", 10),
          menuId,
        },
        accessToken
      )

      // 등록 성공 후 목록 새로고침
      const response = await foocketingApi.getFoocketings(
        ownerId,
        shopId,
        accessToken
      )
      
      if (response.data?.foocketings) {
        const foocketingMenus: FoocketingMenuItem[] = response.data.foocketings.map(
          (foocketing) => {
            const menuInfo = getMenuById(foocketing.menuId)
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

      setFoocketingModalOpen(false)
      window.alert("푸켓팅 메뉴가 등록되었습니다.")
    } catch (err) {
      console.error("푸켓팅 등록 실패:", err)
      window.alert(err instanceof Error ? err.message : "푸켓팅 등록에 실패했습니다.")
    }
  }, [ownerId, shopId, accessToken, getMenuById])

  // store의 메뉴를 MenuData 형태로 변환
  const availableMenus: MenuData[] = React.useMemo(() => {
    return storeMenus.map((menu) => ({
      menuId: menu.menuId,
      name: menu.menuName,
      price: menu.menuPrice,
      image: menu.menuImage,
      description: menu.menuDescription,
      category: menu.categoryName,
    }))
  }, [storeMenus])

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
                    푸켓팅 메뉴를 등록하세요
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

      <AddMenuModal
        open={foocketingModalOpen}
        onClose={() => setFoocketingModalOpen(false)}
        variant="create-foocketing"
        onSave={handleSaveFoocketing}
        availableMenus={availableMenus}
      />
    </div>
  )
}
