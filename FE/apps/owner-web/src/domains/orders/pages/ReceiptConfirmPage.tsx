import { LargeHeader } from "@/components/ui/owner/LargeHeader";
import { Button } from "@shared/src/components/Button";

type TransactionType = "DISCOUNT" | "FOOCKETING";

interface OrderItem {
  name: string;
  menuPrice: number;
  amount: number;
  subtotal: number;
}

interface ReceiptConfirmPageProps {
  transactionId?: number;
  transactionType?: TransactionType;
  items?: OrderItem[];
  totalAmount?: number;
  onConfirm?: () => void;
}

const TRANSACTION_TYPE_LABEL: Record<TransactionType, string> = {
  DISCOUNT: "마감세일",
  FOOCKETING: "푸켓팅",
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("ko-KR").format(value);

export default function ReceiptConfirmPage({
  transactionId = 1,
  transactionType = "DISCOUNT",
  items = [
    { name: "메뉴명", menuPrice: 10000, amount: 2, subtotal: 20000 },
    { name: "메뉴명", menuPrice: 15000, amount: 1, subtotal: 15000 },
    { name: "메뉴명", menuPrice: 8000, amount: 3, subtotal: 24000 },
  ],
  totalAmount = 59000,
  onConfirm,
}: ReceiptConfirmPageProps) {
  const transactionTypeLabel = TRANSACTION_TYPE_LABEL[transactionType];
  const title = `${transactionTypeLabel} ${transactionId}`;

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
          onClick={onConfirm}
        >
          수령 확인
        </Button>
      </div>
    </div>
  );
}