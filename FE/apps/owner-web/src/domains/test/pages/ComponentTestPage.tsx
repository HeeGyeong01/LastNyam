import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '../../orders/components/accordion';
import { Input } from '../../../components/ui/ownerInput';
import { DescriptionInput } from '../../../components/ui/descriptionInput';
import { TimeInput } from '../../../components/ui/timeInput';
import { ImageUpload } from '../../../components/ui/imageUpload';
import { Spinner } from '../../../components/ui/spinner';
import { Modal } from '../../../components/ui/modal';
import { MenuFormField } from '../../../components/ui/menuFormField';
import { MenuListItem, type MenuSelectState } from '../../../components/ui/menuListItem';
import { type OrderStatus, type TransactionType } from '../../orders/components/orderStatusCard';
import { OrderStatusBoard, type OrderStatusBoardTransaction } from '../../orders/components/orderStatusBoard';
import { Info, ExternalLink } from 'lucide-react';

function reorderById<T extends { id: number }>(list: T[], sourceId: number, targetId: number) {
  const next = [...list];
  const sourceIndex = next.findIndex((item) => item.id === sourceId);
  const targetIndex = next.findIndex((item) => item.id === targetId);
  if (sourceIndex === -1 || targetIndex === -1) return list;

  const [removed] = next.splice(sourceIndex, 1);
  next.splice(targetIndex, 0, removed);
  return next;
}

// 메뉴 타입 정의
interface Menu {
  menuId: number;
  menuName: string;
  menuDescription: string;
  menuImage: string;
  menuPrice: number;
  categoryName: string;
}

const ownerRoutes = [
  { path: '/owner/login', label: '로그인' },
  { path: '/owner/signup', label: '회원가입' },
  { path: '/owner/orders/list', label: '주문 리스트' },
  { path: '/owner/orders/qr-scan', label: 'QR 스캔' },
  { path: '/owner/orders/receipt-confirm', label: '영수증 확인' },
  { path: '/owner/catalog/menu', label: '메뉴 관리' },
  { path: '/owner/catalog/foocketing', label: '푸켓팅' },
  { path: '/owner/catalog/closeout-sale', label: '마감 세일' },
  { path: '/owner/insights/report', label: '주간 레포트' },
  { path: '/owner/settings', label: '가게 설정' },
  { path: '/owner/store-information/step1-input', label: '가게 정보 입력 1단계 - 기본 정보' },
  { path: '/owner/store-information/step1-document', label: '가게 정보 입력 1단계 - 서류 업로드' },
  { path: '/owner/store-information/step2', label: '가게 정보 입력 2단계' },
];

export default function ComponentTestPage() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    description: '',
  });
  const [timeValue, setTimeValue] = useState('');
  const [timeValue30, setTimeValue30] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('signature');
  const [menuSelectState, setMenuSelectState] = useState<MenuSelectState>('unselected');
  const [discountInfo, setDiscountInfo] = useState<{ discountPrice?: number; discountRate?: number }>({});
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [modalOpen1, setModalOpen1] = useState(false);
  const [modalOpen2, setModalOpen2] = useState(false);
  const [modalOpen3, setModalOpen3] = useState(false);
  const [modalOpen4, setModalOpen4] = useState(false);
  const [modalOpen5, setModalOpen5] = useState(false);
  const [modalOpen6, setModalOpen6] = useState(false);
  const [loadingModalOpen, setLoadingModalOpen] = useState(false);
  const [loadingModalOpen2, setLoadingModalOpen2] = useState(false);

  const menuBasePrice = 12000;

  const [menuCards, setMenuCards] = useState(() => [
    {
      id: 1,
      menuName: '메뉴이름',
      price: 12000,
      categoryName: '카테고리',
      imageUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=200&q=80',
    },
    {
      id: 2,
      menuName: '메뉴이름 (이미지 없음)',
      price: 11800,
      categoryName: '카테고리',
    },
    {
      id: 3,
      menuName: '메뉴이름',
      price: 12000,
      categoryName: '카테고리',
      variant: 'closeout-sale' as const,
      saleQuantity: 20,
      discountRate: 30,
      discountPrice: 8400,
      originalPrice: 12000,
    },
    {
      id: 4,
      menuName: '메뉴이름',
      price: 9500,
      categoryName: '카테고리',
      variant: 'foocketing' as const,
      foocketingQuantity: 12,
      foocketingTime: '17:30',
    },
  ]);
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [dragOverId, setDragOverId] = useState<number | null>(null);

  const handleDragStart = (id: number) => (event: React.DragEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setDraggingId(id);
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', String(id));
    event.dataTransfer.setDragImage(event.currentTarget, 10, 10);
  };

  const handleDragOverCard = (id: number) => (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (dragOverId !== id) {
      setDragOverId(id);
    }
    if (draggingId && draggingId !== id) {
      setMenuCards((prev) => reorderById(prev, draggingId, id));
    }
  };

  const handleDropCard = (id: number) => (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const sourceId = draggingId ?? Number(event.dataTransfer.getData('text/plain'));
    if (!sourceId || sourceId === id) return;

    setMenuCards((prev) => reorderById(prev, sourceId, id));
    setDraggingId(null);
    setDragOverId(null);
  };

  const handleDragEnd = () => {
    setDraggingId(null);
    setDragOverId(null);
  };

  interface Transaction extends OrderStatusBoardTransaction {
    totalAmount: number;
    transactionKey: string;
  }

  const sampleApiResponse = {
    data: {
      transactions: [
        {
          transactionId: 1,
          transactionStatus: 'PENDING_APPROVAL' as OrderStatus,
          createdAt: '2025-11-05T16:00:00',
          transactionType: 'DISCOUNT' as TransactionType,
          itemDtos: [
            {
              menuName: '불고기 덮밥',
              menuPrice: 8000,
              amount: 12,
              subtotal: 96000,
            },
            {
              menuName: '불고기 덮밥',
              menuPrice: 8000,
              amount: 123,
              subtotal: 984000,
            },
          ],
          totalAmount: 1080000,
        },
        {
          transactionId: 2,
          transactionStatus: 'PENDING_APPROVAL' as OrderStatus,
          createdAt: '2025-11-05T16:00:00',
          transactionType: 'FOOCKETING' as TransactionType,
          itemDtos: [
            {
              menuName: '불고기 덮밥',
              menuPrice: 9500,
              subtotal: 9500,
            },
          ],
          totalAmount: 9500,
        },
        {
          transactionId: 3,
          transactionStatus: 'PREPARING_FOOD' as OrderStatus,
          createdAt: '2025-11-05T16:30:00',
          transactionType: 'DISCOUNT' as TransactionType,
          itemDtos: [
            {
              menuName: '김치찌개',
              menuPrice: 8000,
              amount: 4,
              subtotal: 32000,
            },
            {
              menuName: '된장찌개',
              menuPrice: 7500,
              amount: 2,
              subtotal: 15000,
            },
          ],
          totalAmount: 47000,
        },
        {
          transactionId: 4,
          transactionStatus: 'WAITING_PICKUP' as OrderStatus,
          createdAt: '2025-11-05T17:05:00',
          transactionType: 'FOOCKETING' as TransactionType,
          itemDtos: [
            {
              menuName: '시그니처 샌드위치',
              menuPrice: 6800,
              subtotal: 6800,
            },
            {
              menuName: '아이스 아메리카노',
              menuPrice: 4300,
              subtotal: 4300,
            },
          ],
          totalAmount: 0,
        },
        {
          transactionId: 5,
          transactionStatus: 'PREPARING_FOOD' as OrderStatus,
          createdAt: '2025-11-05T17:20:00',
          transactionType: 'FOOCKETING' as TransactionType,
          itemDtos: [
            {
              menuName: '망고 스무디',
              menuPrice: 5200,
              subtotal: 5200,
            },
            {
              menuName: '트러플 감자칩',
              menuPrice: 3900,
              subtotal: 3900,
            },
          ],
          totalAmount: 0,
        },
        {
          transactionId: 6,
          transactionStatus: 'WAITING_PICKUP' as OrderStatus,
          createdAt: '2025-11-05T17:45:00',
          transactionType: 'DISCOUNT' as TransactionType,
          itemDtos: [
            {
              menuName: '크림 파스타',
              menuPrice: 11500,
              amount: 2,
              subtotal: 23000,
            },
            {
              menuName: '갈릭 브레드',
              menuPrice: 4500,
              amount: 2,
              subtotal: 9000,
            },
          ],
          totalAmount: 32000,
        },
      ],
    },
  };

  const [transactions, setTransactions] = useState<Transaction[]>(() =>
    sampleApiResponse.data.transactions.map((transaction, index) => ({
      ...transaction,
      transactionKey: `${transaction.transactionId}-${transaction.transactionType}-${index}`,
    }))
  );

  const nextStatusMap: Partial<Record<OrderStatus, OrderStatus>> = {
    PENDING_APPROVAL: 'PREPARING_FOOD',
    PREPARING_FOOD: 'WAITING_PICKUP',
  };

  const handleAdvanceStatus = (transaction: OrderStatusBoardTransaction) => {
    const nextStatus = nextStatusMap[transaction.transactionStatus];
    if (!nextStatus) {
      return;
    }

    const transactionKey = 'transactionKey' in transaction ? transaction.transactionKey : undefined;
    if (!transactionKey) {
      return;
    }

    setTransactions((prev) =>
      prev.map((prevTransaction) =>
        prevTransaction.transactionKey === transactionKey
          ? { ...prevTransaction, transactionStatus: nextStatus }
          : prevTransaction
      )
    );
  };

  // 예시 메뉴 데이터 (API 응답 형태)
  const menuData: Menu[] = [
    {
      menuId: 1,
      menuName: "불고기 덮밥",
      menuDescription: "신선한 소고기를 사용해 달콤짭짤하게 볶은 불고기 덮밥입니다.",
      menuImage: "https://lastnyam.co.kr/images/menu/bulgogi_rice.jpg",
      menuPrice: 9500,
      categoryName: "김밥/분식"
    },
    {
      menuId: 2,
      menuName: "순대",
      menuDescription: "신선한 소고기를 사용해 달콤짭짤하게 볶은 불고기 덮밥입니다.",
      menuImage: "https://lastnyam.co.kr/images/menu/bulgogi_rice.jpg",
      menuPrice: 9500,
      categoryName: "김밥/분식"
    },
    {
      menuId: 3,
      menuName: "떡볶이",
      menuDescription: "쫄깃한 떡과 매콤한 양념이 일품인 떡볶이입니다.",
      menuImage: "https://lastnyam.co.kr/images/menu/tteokbokki.jpg",
      menuPrice: 6000,
      categoryName: "김밥/분식"
    },
    {
      menuId: 4,
      menuName: "김치찌개",
      menuDescription: "얼큰하고 시원한 김치찌개입니다.",
      menuImage: "https://lastnyam.co.kr/images/menu/kimchi_jjigae.jpg",
      menuPrice: 8000,
      categoryName: "찌개/국물"
    },
    {
      menuId: 5,
      menuName: "된장찌개",
      menuDescription: "구수한 된장으로 끓인 된장찌개입니다.",
      menuImage: "https://lastnyam.co.kr/images/menu/doenjang_jjigae.jpg",
      menuPrice: 7500,
      categoryName: "찌개/국물"
    },
    {
      menuId: 6,
      menuName: "제육볶음",
      menuDescription: "고소한 돼지고기 볶음 요리입니다.",
      menuImage: "https://lastnyam.co.kr/images/menu/jeyuk_bokkeum.jpg",
      menuPrice: 12000,
      categoryName: "메인요리"
    },
  ];

  // 카테고리별로 메뉴 그룹화
  const menusByCategory = menuData.reduce((acc, menu) => {
    if (!acc[menu.categoryName]) {
      acc[menu.categoryName] = [];
    }
    acc[menu.categoryName].push(menu);
    return acc;
  }, {} as Record<string, Menu[]>);

  const categories = Object.keys(menusByCategory);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // 로딩 시뮬레이션
    setTimeout(() => {
      setLoading(false);
      alert('제출되었습니다!');
    }, 2000);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-8">
      <h1 className="text-3xl font-bold mb-8">컴포넌트 테스트 페이지</h1>

      {/* Order Status Board */}
      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold">Accordion 주문 목록</h2>
          <p className="text-sm text-gray-600">
            각 주문 상태별 아코디언 안에서 `OrderStatusCard` 컴포넌트를 바로 확인할 수 있습니다.
          </p>
        </div>

        <OrderStatusBoard
          className="rounded-2xl bg-bg-0"
          transactions={transactions}
          onAdvanceStatus={handleAdvanceStatus}
        />
      </section>

      {/* MenuListItem showcase */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">MenuListItem 컴포넌트</h2>
        <p className="text-sm text-gray-600">
          메뉴 관리, 마감 세일, 푸켓팅, 메뉴 선택 화면에서 사용할 수 있는 카드 형태 컴포넌트입니다.
        </p>
        <div className="rounded-3xl border border-stroke-3 bg-bg-0 p-6 shadow-[0_32px_80px_-50px_rgba(15,23,42,0.18)]">
          <div className="flex flex-col gap-3">
            {menuCards.map((card) => (
              <MenuListItem
                key={card.id}
                menuName={card.menuName}
                price={card.price}
                categoryName={card.categoryName}
                imageUrl={card.imageUrl}
                variant={card.variant ?? "default"}
                saleQuantity={card.saleQuantity}
                discountRate={card.discountRate}
                discountPrice={card.discountPrice}
                originalPrice={card.originalPrice}
                foocketingQuantity={card.foocketingQuantity}
                foocketingTime={card.foocketingTime}
                dragHandleProps={{
                  onDragStart: handleDragStart(card.id),
                  onDragEnd: handleDragEnd,
                }}
                containerProps={{
                  onDragOver: handleDragOverCard(card.id),
                  onDrop: handleDropCard(card.id),
                  onDragLeave: (event) => {
                    if (!event.currentTarget.contains(event.relatedTarget as Node)) {
                      setDragOverId((prev) => (prev === card.id ? null : prev));
                    }
                  },
                }}
                isDragging={draggingId === card.id}
                isDragOver={dragOverId === card.id}
              />
            ))}
            <MenuListItem
              menuName="메뉴이름"
              price={11000}
              categoryName="카테고리"
              variant="select-menu"
              selectState={menuSelectState}
              onToggleSelect={(checked) =>
                setMenuSelectState(checked ? "selected" : "unselected")
              }
            />
            <MenuListItem
              menuName="메뉴이름"
              price={11000}
              categoryName="카테고리"
              variant="select-menu"
              selectState="selected"
            />
          </div>
        </div>
      </section>

      {/* Route 네비게이션 */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Owner Router 경로 모음</h2>
        <p className="text-sm text-gray-600">
          아래 링크를 클릭하면 각 페이지로 이동해 실제 화면을 확인할 수 있습니다.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {ownerRoutes.map((route) => (
            <Link
              key={route.path}
              to={route.path}
              className="group flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3 transition-colors hover:border-brand hover:bg-brand-bg-3"
            >
              <span className="text-sm font-medium text-gray-900 group-hover:text-brand-strong">
                {route.label}
              </span>
              <span className="flex items-center gap-2 text-xs text-gray-500 group-hover:text-brand">
                {route.path}
                <ExternalLink className="h-4 w-4" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Accordion 섹션 - 메뉴 카테고리별 표시 */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Accordion 컴포넌트 (메뉴 예제)</h2>
        <div className="rounded-lg">
          <Accordion type="multiple" className="w-full">
            {categories.map((category, index) => {
              const menus = menusByCategory[category];
              return (
                <AccordionItem key={category} value={`category-${index}`}>
                  <AccordionTrigger items={menus}>{category}</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3">
                      {menus.map((menu) => (
                        <div key={menu.menuId} className="border rounded-md p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg mb-1">{menu.menuName}</h3>
                              <p className="text-sm text-gray-600 mb-2">{menu.menuDescription}</p>
                              <p className="text-base font-medium text-orange-600">
                                {formatPrice(menu.menuPrice)}원
                              </p>
                            </div>
                            {menu.menuImage && (
                              <img 
                                src={menu.menuImage} 
                                alt={menu.menuName}
                                className="w-20 h-20 object-cover rounded-md"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>
      </section>

      {/* Input 섹션 */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Input 컴포넌트</h2>
        
        {/* Variant 및 Unit 예시 */}
        <div className="border rounded-lg p-6 space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Variant 및 Unit 예시</h3>
            
            {/* Filled 상태 */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-600">filled 상태</h4>
              <div className="space-y-2">
                <Input
                  placeholder="입력해보시지"
                  variant="filled"
                />
                <Input
                  placeholder="text"
                  variant="filled"
                  unit="원"
                />
              </div>
            </div>

            {/* Disabled 상태 */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-600">disabled 상태</h4>
              <div className="space-y-2">
                <Input
                  placeholder="text"
                  variant="disabled"
                />
                <Input
                  placeholder="text"
                  variant="disabled"
                  unit="원"
                />
              </div>
            </div>
          </div>

          {/* Size 예시 */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Size 예시</h3>
            
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-600">small (sm) 사이즈</h4>
              <div className="space-y-2">
                <Input
                  placeholder="작은 사이즈 입력"
                  size="sm"
                  variant="filled"
                />
                <Input
                  placeholder="작은 사이즈 + 단위"
                  size="sm"
                  variant="filled"
                  unit="원"
                />
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-600">medium (md) 사이즈 (기본값)</h4>
              <div className="space-y-2">
                <Input
                  placeholder="기본 사이즈 입력"
                  size="md"
                  variant="filled"
                />
                <Input
                  placeholder="기본 사이즈 + 단위"
                  size="md"
                  variant="filled"
                  unit="원"
                />
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-600">Size 비교</h4>
              <div className="space-y-2">
                <Input
                  placeholder="small 사이즈"
                  size="sm"
                  variant="filled"
                />
                <Input
                  placeholder="medium 사이즈 (기본)"
                  size="md"
                  variant="filled"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 기본 폼 예제 */}
        <form onSubmit={handleSubmit} className="space-y-4 border rounded-lg p-6">
          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-medium">
              이름
            </label>
            <Input
              id="name"
              type="text"
              placeholder="이름을 입력하세요"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium">
              이메일
            </label>
            <Input
              id="email"
              type="email"
              placeholder="email@example.com"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium">
              비밀번호
            </label>
            <Input
              id="password"
              type="password"
              placeholder="비밀번호를 입력하세요"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="phone" className="block text-sm font-medium">
              전화번호
            </label>
            <Input
              id="phone"
              type="tel"
              placeholder="010-1234-5678"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="price" className="block text-sm font-medium">
              가격 (원 단위 예시)
            </label>
            <Input
              id="price"
              type="number"
              placeholder="가격을 입력하세요"
              unit="원"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="block text-sm font-medium">
              설명
            </label>
            <Input
              id="description"
              type="text"
              placeholder="추가 설명을 입력하세요"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="number" className="block text-sm font-medium">
              숫자 입력
            </label>
            <Input
              id="number"
              type="number"
              placeholder="숫자를 입력하세요"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="date" className="block text-sm font-medium">
              날짜 선택
            </label>
            <Input
              id="date"
              type="date"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="time" className="block text-sm font-medium">
              시간 선택 (기본)
            </label>
            <Input
              id="time"
              type="time"
              placeholder="시간을 선택하세요"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="custom-time" className="block text-sm font-medium">
              커스텀 시간 입력 (시/분/AM-PM 분리)
            </label>
            <TimeInput
              value={timeValue}
              onChange={(value) => {
                console.log('시간 입력 (기본):', value);
                setTimeValue(value);
              }}
            />
            {timeValue && (
              <p className="text-sm text-gray-600">선택된 시간: {timeValue}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="custom-time-30" className="block text-sm font-medium">
              커스텀 시간 입력 (30분 단위)
            </label>
            <TimeInput
              value={timeValue30}
              onChange={(value) => {
                console.log('시간 입력 (30분 단위):', value);
                setTimeValue30(value);
              }}
              interval30={true}
            />
            {timeValue30 && (
              <p className="text-sm text-gray-600">선택된 시간: {timeValue30}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="datetime" className="block text-sm font-medium">
              날짜 및 시간 선택
            </label>
            <Input
              id="datetime"
              type="datetime-local"
              placeholder="날짜와 시간을 선택하세요"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Spinner className="size-5" />
                <span>제출 중...</span>
              </>
            ) : (
              '제출하기'
            )}
          </button>
        </form>

        <div className="border rounded-lg p-6 space-y-6">
          <h3 className="text-lg font-medium">MenuFormField 컴포넌트</h3>

          <div className="space-y-4">
            <MenuFormField
              title="메뉴 가격"
              required
              inputProps={{
                placeholder: '메뉴 가격을 입력하세요',
                unit: '원',
              }}
            />

            <MenuFormField
              title="메뉴 설명"
              variant="explanation"
              helperText="최대 200자까지 입력 가능합니다."
              textareaProps={{
                placeholder: '메뉴에 대한 설명을 입력하세요',
                rows: 4,
              }}
            />

            <MenuFormField
              title="카테고리"
              variant="category"
              options={[
                { value: 'signature', label: '대표 메뉴' },
                { value: 'rice', label: '식사류' },
                { value: 'noodle', label: '면/분식' },
              ]}
              value={selectedCategory}
              onChange={(value) => {
                if (typeof value === 'string') {
                  setSelectedCategory(value);
                }
              }}
            />

            <MenuFormField
              title="판매 시작 시간"
              variant="time"
              helperText="더블클릭 시 직접 입력할 수 있습니다."
              timeInputProps={{
                value: timeValue,
                onChange: (value) => setTimeValue(value),
              }}
            />

            <MenuFormField
              title="할인 정보"
              variant="discount"
              basePrice={menuBasePrice}
              defaultValue={discountInfo}
              onChange={(value) => setDiscountInfo(value)}
              helperText={`정상가 ${menuBasePrice.toLocaleString()}원 기준으로 자동 계산됩니다.`}
              pricePlaceholder="할인가"
              ratePlaceholder="할인율"
            />

            <div className="rounded-md border border-dashed border-subtle bg-bg-1 p-4 text-sm text-secondary">
              <p>
                선택된 카테고리: <span className="text-primary">{selectedCategory}</span>
              </p>
              <p>
                현재 할인가:{' '}
                <span className="text-primary">
                  {discountInfo.discountPrice !== undefined
                    ? `${discountInfo.discountPrice.toLocaleString()}원`
                    : '-'}
                </span>
              </p>
              <p>
                현재 할인율:{' '}
                <span className="text-primary">
                  {discountInfo.discountRate !== undefined ? `${discountInfo.discountRate}%` : '-'}
                </span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ImageUpload 섹션 */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">ImageUpload 컴포넌트</h2>
        <div className="border rounded-lg p-6 space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">기본 예시</h3>
            
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-600">Filled 상태</h4>
              <ImageUpload
                value={imageFile}
                onChange={(file) => {
                  console.log('이미지 업로드:', file);
                  setImageFile(file);
                }}
                variant="filled"
              />
            </div>

          </div>

          {/* 실제 사용 예시 */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">실제 사용 예시</h3>
            <div className="space-y-4">
              <ImageUpload
                value={imageFile}
                onChange={(file) => {
                  console.log('선택된 이미지:', file);
                  setImageFile(file);
                }}
                variant="filled"
                maxSize={10 * 1024 * 1024} // 10MB
              />
            </div>
          </div>
        </div>
      </section>

      {/* DescriptionInput 섹션 */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">DescriptionInput 컴포넌트</h2>
        <div className="border rounded-lg p-6 space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">기본 예시</h3>
            
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-600">Label만 있는 경우</h4>
              <DescriptionInput
                label="메뉴 설명"
                placeholder="메뉴에 대한 상세 설명을 입력하세요"
                variant="filled"
              />
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-600">Label과 Description이 있는 경우</h4>
              <DescriptionInput
                label="상품 설명"
                description="최대 500자까지 입력 가능합니다. 상품의 특징과 장점을 자세히 설명해주세요."
                placeholder="상품에 대한 상세 설명을 입력하세요"
                variant="filled"
              />
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-600">Disabled 상태</h4>
              <DescriptionInput
                label="비활성화된 설명 입력"
                description="이 입력란은 비활성화되어 있습니다."
                placeholder="입력할 수 없습니다"
                variant="disabled"
                value="이미 입력된 텍스트입니다."
              />
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-600">Filled 상태</h4>
              <DescriptionInput
                label="활성화된 설명 입력"
                description="자유롭게 입력할 수 있습니다."
                placeholder="여기에 설명을 입력하세요"
                variant="filled"
              />
            </div>
          </div>

          {/* 실제 사용 예시 */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">실제 사용 예시</h3>
            <form className="space-y-4">
              <DescriptionInput
                label="메뉴 상세 설명"
                description="고객에게 보여질 메뉴 설명을 입력해주세요. (최대 200자)"
                placeholder="예: 신선한 재료로 만든 특제 양념의 불고기 덮밥입니다. 부드러운 고기와 달콤한 양념이 잘 어우러져 맛있습니다."
                variant="filled"
                maxLength={200}
              />
              
              <DescriptionInput
                label="영업 시간 안내"
                description="영업 시간과 휴무일 등 안내 사항을 입력해주세요."
                placeholder="예: 평일 09:00 - 21:00, 주말 10:00 - 22:00"
                variant="filled"
              />
            </form>
          </div>
        </div>
      </section>

      {/* Spinner 섹션 */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Spinner 컴포넌트</h2>
        <div className="border rounded-lg p-6 space-y-6">
          <div className="space-y-2">
            <h3 className="text-lg font-medium">기본 스피너</h3>
            <div className="flex items-center gap-4">
              <Spinner />
              <span className="text-gray-600">로딩 중...</span>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-medium">다양한 크기의 스피너</h3>
            <div className="flex items-center gap-6">
              <div className="flex flex-col items-center gap-2">
                <Spinner className="size-4" />
                <span className="text-xs text-gray-600">작은 크기</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Spinner className="size-6" />
                <span className="text-xs text-gray-600">중간 크기</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Spinner className="size-8" />
                <span className="text-xs text-gray-600">큰 크기</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Spinner className="size-12" />
                <span className="text-xs text-gray-600">매우 큰 크기</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-medium">버튼 내 스피너</h3>
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setLoading(true);
                  setTimeout(() => setLoading(false), 2000);
                }}
                disabled={loading}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50 flex items-center gap-2"
              >
                {loading && <Spinner className="size-4" />}
                <span>데이터 로드</span>
              </button>
              <button
                onClick={() => {
                  setLoading(true);
                  setTimeout(() => setLoading(false), 2000);
                }}
                disabled={loading}
                className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 disabled:opacity-50 flex items-center gap-2"
              >
                {loading && <Spinner className="size-4" />}
                <span>저장하기</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Modal 컴포넌트 */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Modal 컴포넌트</h2>
        <div className="border rounded-lg p-6 space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">단일 버튼 모달</h3>
            <button
              onClick={() => setModalOpen1(true)}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              모달 열기 (단일 버튼)
            </button>
            <Modal
              open={modalOpen1}
              onClose={() => setModalOpen1(false)}
              title="회원가입 완료"
              detail="가게를 등록한 뒤 서비스 이용이 가능합니다."
              variant="single-button"
              primaryButtonText="등록하기"
              icon="check-circle"
              iconShow={true}
              xButtonShow={true}
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">두 개 버튼 모달</h3>
            <button
              onClick={() => setModalOpen2(true)}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              모달 열기 (두 개 버튼)
            </button>
            <Modal
              open={modalOpen2}
              onClose={() => setModalOpen2(false)}
              title="회원가입 완료"
              detail="가게를 등록한 뒤 서비스 이용이 가능합니다. 가게를 바로 등록하시겠어요?"
              variant="two-button"
              primaryButtonText="확인"
              secondaryButtonText="취소"
              icon="check-circle"
              iconShow={true}
              xButtonShow={true}
              onPrimaryClick={() => {
                console.log('확인 버튼 클릭');
                setModalOpen2(false);
              }}
              onSecondaryClick={() => {
                console.log('취소 버튼 클릭');
                setModalOpen2(false);
              }}
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">아이콘 없는 모달</h3>
            <button
              onClick={() => setModalOpen3(true)}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              모달 열기 (아이콘 없음)
            </button>
            <Modal
              open={modalOpen3}
              onClose={() => setModalOpen3(false)}
              title="알림"
              detail="이 작업을 계속하시겠습니까?"
              variant="two-button"
              primaryButtonText="확인"
              secondaryButtonText="취소"
              iconShow={false}
              xButtonShow={true}
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">커스텀 아이콘 모달</h3>
            <button
              onClick={() => setModalOpen5(true)}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              모달 열기 (커스텀 아이콘)
            </button>
            <Modal
              open={modalOpen5}
              onClose={() => setModalOpen5(false)}
              title="정보 안내"
              detail="icon prop에 Lucide 아이콘 컴포넌트를 전달해도 정상적으로 렌더링됩니다."
              variant="two-button"
              primaryButtonText="확인"
              secondaryButtonText="닫기"
              icon={Info}
              iconShow={true}
              iconWrapperClassName="flex h-12 w-12 items-center justify-center rounded-full bg-brand-bg-3"
              iconClassName="h-6 w-6 text-brand"
              xButtonShow={true}
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">경고색 아이콘 모달</h3>
            <button
              onClick={() => setModalOpen6(true)}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              모달 열기 (경고 아이콘)
            </button>
            <Modal
              open={modalOpen6}
              onClose={() => setModalOpen6(false)}
              title="주의가 필요해요"
              detail="iconWrapperClassName과 iconClassName으로 색상을 자유롭게 변경할 수 있습니다."
              variant="two-button"
              primaryButtonText="확인"
              secondaryButtonText="닫기"
              icon="exclamation"
              iconShow={true}
              xButtonShow={true}
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">X 버튼 없는 모달</h3>
            <button
              onClick={() => setModalOpen4(true)}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              모달 열기 (X 버튼 없음)
            </button>
            <Modal
              open={modalOpen4}
              onClose={() => setModalOpen4(false)}
              title="중요 알림"
              detail="이 작업은 되돌릴 수 없습니다. 정말로 진행하시겠습니까?"
              variant="two-button"
              primaryButtonText="진행"
              secondaryButtonText="취소"
              icon="check-circle"
              iconShow={true}
              xButtonShow={false}
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">로딩 모달 (버튼 없음)</h3>
            <button
              onClick={() => {
                setLoadingModalOpen(true);
                // 3초 후 자동으로 닫히는 예시
                setTimeout(() => {
                  setLoadingModalOpen(false);
                }, 3000);
              }}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              로딩 모달 열기
            </button>
            <Modal
              open={loadingModalOpen}
              onClose={() => setLoadingModalOpen(false)}
              title="처리 중..."
              detail="잠시만 기다려주세요."
              icon="loading"
              iconShow={true}
              xButtonShow={false}
              buttonShow={false}
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">로딩 모달 (제목/설명 없음)</h3>
            <button
              onClick={() => {
                setLoadingModalOpen2(true);
                setTimeout(() => {
                  setLoadingModalOpen2(false);
                }, 3000);
              }}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              로딩 모달 열기 (제목/설명 없음)
            </button>
            <Modal
              open={loadingModalOpen2}
              onClose={() => setLoadingModalOpen2(false)}
              icon="loading"
              iconShow={true}
              xButtonShow={false}
              buttonShow={false}
              modalBodyShow={false}
            />
          </div>
        </div>
      </section>

    </div>
  );
}

