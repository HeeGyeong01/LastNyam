import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { LargeHeader } from "@/components/ui/owner/LargeHeader";
import { Button } from "@shared/src/components/Button";
import { Modal } from "@/components/ui/modal";
import { useOwnerStore } from "@/store/useOwnerStore";
import {
  orderApi,
  type TransactionType,
  type DiscountItem,
  type FoocketingDetail,
} from "../apis/order.api";

interface OrderItem {
  name: string;
  menuPrice: number;
  amount: number;
  subtotal: number;
}

const TRANSACTION_TYPE_LABEL: Record<TransactionType, string> = {
  DISCOUNT: "마감세일",
  FOOCKETING: "푸켓팅",
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("ko-KR").format(value);

// API 응답을 OrderItem 형식으로 변환하는 함수
const convertDiscountItemsToOrderItems = (items: DiscountItem[]): OrderItem[] => {
  return items.map((item) => ({
    name: item.menuName,
    menuPrice: item.menuPrice,
    amount: item.transactionAmount,
    subtotal: item.discountPrice * item.transactionAmount,
  }));
};

const convertFoocketingToOrderItems = (detail: FoocketingDetail): OrderItem[] => {
  return [
    {
      name: detail.menuName,
      menuPrice: detail.menuPrice,
      amount: detail.foocketingAmount,
      subtotal: detail.menuPrice * detail.foocketingAmount,
    },
  ];
};

export default function ReceiptConfirmPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { ownerId, accessToken } = useOwnerStore();
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState<number | null>(null);
  const [transactionType, setTransactionType] = useState<TransactionType>("DISCOUNT");
  const [items, setItems] = useState<OrderItem[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    const fetchTransactionDetail = async () => {
      try {
        // URL 파라미터에서 transactionId와 type 가져오기
        const transactionIdParam = searchParams.get("transactionId");
        const typeParam = searchParams.get("type") as TransactionType | null;

        if (!transactionIdParam || !typeParam) {
          setError("거래 정보가 없습니다.");
          setIsLoading(false);
          return;
        }

        if (!ownerId || !accessToken) {
          setError("인증 정보가 없습니다.");
          setIsLoading(false);
          return;
        }

        const txId = parseInt(transactionIdParam, 10);
        setTransactionId(txId);
        setTransactionType(typeParam);

        // API 호출
        const response = await orderApi.getTransactionDetail(
          ownerId,
          txId,
          typeParam,
          accessToken
        );

        if (!response.data) {
          throw new Error("거래 데이터를 불러올 수 없습니다.");
        }

        // 데이터 변환
        let orderItems: OrderItem[] = [];
        let total = 0;

        if (typeParam === "DISCOUNT" && response.data.discountItems) {
          orderItems = convertDiscountItemsToOrderItems(response.data.discountItems);
          total = orderItems.reduce((sum, item) => sum + item.subtotal, 0);
        } else if (typeParam === "FOOCKETING" && response.data.foocketingDetail) {
          orderItems = convertFoocketingToOrderItems(response.data.foocketingDetail);
          total = orderItems.reduce((sum, item) => sum + item.subtotal, 0);
        }

        setItems(orderItems);
        setTotalAmount(total);
        setIsLoading(false);
      } catch (err) {
        console.error("거래 상세 조회 실패:", err);
        setError(err instanceof Error ? err.message : "거래 정보를 불러오는데 실패했습니다.");
        setIsLoading(false);
      }
    };

    fetchTransactionDetail();
  }, [searchParams, ownerId, accessToken]);

  const handleConfirm = () => {
    setIsConfirmModalOpen(true);
  };

  const handleConfirmReceipt = async () => {
    if (!transactionId || !ownerId || !accessToken) {
      return;
    }

    try {
      setIsConfirming(true);
      
      // 주문 상태를 WAITING_PICKUP으로 변경 (수령 확인)
      await orderApi.updateOrderStatus(
        ownerId,
        transactionId,
        {
          transactionType: transactionType,
          status: "WAITING_PICKUP",
        },
        accessToken
      );
      
      // 수령 확인 후 주문 목록 페이지로 이동
      setIsConfirmModalOpen(false);
      navigate("/orders");
    } catch (err) {
      console.error("수령 확인 실패:", err);
      alert(err instanceof Error ? err.message : "수령 확인에 실패했습니다.");
      setIsConfirmModalOpen(false);
    } finally {
      setIsConfirming(false);
    }
  };

  const transactionTypeLabel = transactionType ? TRANSACTION_TYPE_LABEL[transactionType] : "";
  const title = transactionId ? `${transactionTypeLabel} ${transactionId}` : "";

  // 로딩 중
  if (isLoading) {
    return (
      <div className="flex flex-col h-full bg-bg-2">
        <LargeHeader
          pageName="주문 상세보기"
          pageExplanation="포장된 음식을 확인 후 수령확인 버튼을 누루세요"
        />
        <div className="flex-1 flex items-center justify-center">
          <p className="p2 text-secondary">로딩 중...</p>
        </div>
      </div>
    );
  }

  // 에러 발생
  if (error) {
    return (
      <div className="flex flex-col h-full bg-bg-2">
        <LargeHeader
          pageName="주문 상세보기"
          pageExplanation="포장된 음식을 확인 후 수령확인 버튼을 누루세요"
        />
        <div className="flex-1 flex items-center justify-center">
          <p className="p2 text-error">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-bg-2">
      {/* 헤더 */}
      <LargeHeader
        pageName="주문 상세보기"
        pageExplanation="포장된 음식을 확인 후 수령확인 버튼을 누루세요"
      />

      {/* 메인 콘텐츠 */}
      <div className="flex-1 bg-bg-2 px-4 py-3 pb-[180px] min-h-[calc(100vh-200px)]">
        <div className="bg-bg-0 p-5 space-y-5">
          {/* 타이틀 및 설명 */}
          <div className="space-y-1">
            <h3 className="h4-b text-brand">{title}</h3>
            <p className="p3 text-tertiary">
              포장된 음식을 건네 주셨다면 수령확인을 진행해주세요
            </p>
          </div>

          {/* 메뉴 목록 테이블 */}
          <div className="space-y-2.5">
            {/* 테이블 헤더 */}
            <div className="flex gap-4 p1-b text-primary">
              <span className="flex-1">메뉴명</span>
              <span className="flex-1 min-w-[80px]">단가</span>
              <span className="flex-1 min-w-[50px]">수량</span>
              <span className="flex-1 min-w-[80px]">금액</span>
            </div>

            {/* 테이블 바디 */}
            <div className="space-y-1">
              {items.map((item, index) => (
                <div
                  key={`${item.name}-${index}`}
                  className="flex gap-4 p2 text-primary"
                >
                  <span className="flex-1">{item.name}</span>
                  <span className="flex-1 min-w-[80px]">
                    {formatCurrency(item.menuPrice)}
                  </span>
                  <span className="flex-1 min-w-[50px]">{item.amount}</span>
                  <span className="flex-1 min-w-[80px]">
                    {formatCurrency(item.subtotal)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 하단 고정 영역 */}
      <div className="fixed bottom-20 left-0 right-0 bg-bg-0 px-4 py-3 space-y-2.5 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
        {/* 총 판매액 */}
        <div className="flex items-center justify-between px-3">
          <span className="p1-b text-primary">총 판매액</span>
          <div className="flex items-center gap-2.5">
            <span className="p2 text-secondary">₩</span>
            <span className="p2 text-secondary">
              {formatCurrency(totalAmount)}
            </span>
          </div>
        </div>

        {/* 수령 확인 버튼 */}
        <Button
          btnStyle="filled-red"
          size="lg"
          className="w-full"
          onClick={handleConfirm}
        >
          수령 확인
        </Button>
      </div>

      {/* 수령 확인 모달 */}
      <Modal
        open={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        title="수령 확인"
        detail="수령 확인 시 되돌릴 수 없습니다.&#10;수령 확인하시겠습니까?"
        icon="exclamation"
        variant="two-button"
        primaryButtonText="확인"
        secondaryButtonText="취소"
        onPrimaryClick={handleConfirmReceipt}
        onSecondaryClick={() => setIsConfirmModalOpen(false)}
        primaryButtonDisabled={isConfirming}
      />
    </div>
  );
}