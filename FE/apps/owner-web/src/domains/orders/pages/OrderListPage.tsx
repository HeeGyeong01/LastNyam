import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@shared/src/components/Button";
import { cn } from "@/lib/utils";

import {
  OrderStatusBoard,
  type OrderStatusBoardTransaction,
} from "../components/orderStatusBoard";
import {
  ORDER_STATUS_CONFIG,
  type OrderStatus,
} from "../components/orderStatusCard";

const STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus> = {
  PENDING_APPROVAL: "PREPARING_FOOD",
  PREPARING_FOOD: "WAITING_PICKUP",
  WAITING_PICKUP: "WAITING_PICKUP",
};

const TRANSACTION_TABS = [
  { key: "DISCOUNT", label: "마감세일" },
  { key: "FOOCKETING", label: "푸켓팅" },
] as const;

type TransactionFilter = (typeof TRANSACTION_TABS)[number]["key"];

const MOCK_TRANSACTIONS: OrderStatusBoardTransaction[] = [
  {
    transactionId: "D-25001",
    transactionKey: "discount-25001",
    transactionStatus: "PENDING_APPROVAL",
    transactionType: "DISCOUNT",
    createdAt: "2025-01-21T09:05:00+09:00",
    totalAmount: 12800,
    itemDtos: [
      {
        menuName: "크림치즈 베이글",
        amount: 2,
        menuPrice: 3200,
        subtotal: 6400,
      },
      {
        menuName: "버터 프레첼",
        amount: 1,
        menuPrice: 6400,
        subtotal: 6400,
      },
    ],
  },
  {
    transactionId: "D-25002",
    transactionKey: "discount-25002",
    transactionStatus: "PREPARING_FOOD",
    transactionType: "DISCOUNT",
    createdAt: "2025-01-21T09:35:00+09:00",
    totalAmount: 15400,
    itemDtos: [
      {
        menuName: "시나몬롤 세트",
        amount: 2,
        menuPrice: 5500,
        subtotal: 11000,
      },
      {
        menuName: "마카롱 박스 (4개)",
        amount: 1,
        menuPrice: 4400,
        subtotal: 4400,
      },
    ],
  },
  {
    transactionId: "F-25011",
    transactionKey: "foocketing-25011",
    transactionStatus: "WAITING_PICKUP",
    transactionType: "FOOCKETING",
    createdAt: "2025-01-21T08:40:00+09:00",
    itemDtos: [
      {
        menuName: "모닝 샌드위치",
        menuPrice: 3800,
        subtotal: 3800,
      },
    ],
  },
  {
    transactionId: "F-25012",
    transactionKey: "foocketing-25012",
    transactionStatus: "PREPARING_FOOD",
    transactionType: "FOOCKETING",
    createdAt: "2025-01-21T09:10:00+09:00",
    itemDtos: [
      {
        menuName: "에그 커스터드 타르트",
        menuPrice: 4200,
        subtotal: 4200,
      },
      {
        menuName: "헤이즐넛 라떼",
        menuPrice: 4500,
        subtotal: 4500,
      },
    ],
  },
];

export default function OrderListPage() {
  const navigate = useNavigate();
  const [transactions, setTransactions] =
    useState<OrderStatusBoardTransaction[]>(MOCK_TRANSACTIONS);
  const [activeFilter, setActiveFilter] = useState<TransactionFilter>("DISCOUNT");

  const filteredTransactions = useMemo(
    () =>
      transactions.filter(
        (transaction) => transaction.transactionType === activeFilter,
      ),
    [transactions, activeFilter],
  );

  const filteredCountByType = useMemo(() => {
    return TRANSACTION_TABS.reduce(
      (acc, tab) => {
        acc[tab.key] = transactions.filter(
          (transaction) => transaction.transactionType === tab.key,
        ).length;
        return acc;
      },
      {} as Record<TransactionFilter, number>,
    );
  }, [transactions]);

  const handleAdvanceStatus = (target: OrderStatusBoardTransaction) => {
    setTransactions((previous) =>
      previous.map((transaction) => {
        const isSameTransaction =
          transaction.transactionId === target.transactionId &&
          transaction.transactionType === target.transactionType;

        if (!isSameTransaction) {
          return transaction;
        }

        const nextStatus = STATUS_TRANSITIONS[transaction.transactionStatus];

        return {
          ...transaction,
          transactionStatus: nextStatus,
        };
      }),
    );
  };

  const headerDescription =
    ORDER_STATUS_CONFIG.WAITING_PICKUP.description ??
    "수령확인하기로 QR을 인식해 완료할 수 있어요";

  return (
    <div className="flex flex-col bg-bg-0">
      <section className="px-4 pt-6">
        <div className="mx-auto flex w-full max-w-[480px] flex-col gap-4">
          <div className="space-y-2">
            <h1 className="h5-b text-primary">수령 처리하기</h1>
            <p className="p2 text-secondary">{headerDescription}</p>
          </div>

          <Button
            btnStyle="filled-red"
            size="lg"
            className="w-full"
            onClick={() => navigate("/owner/orders/qr-scan")}
          >
            QR 찍기
          </Button>
        </div>
      </section>

      <section className="mt-4 pb-6">
        <div className="mx-auto flex w-full max-w-[480px] flex-col gap-4">
          <div className="mx-auto inline-flex items-center gap-1 rounded-full border border-stroke-3 bg-bg-0 p-1 shadow-sm">
            {TRANSACTION_TABS.map((tab) => {
              const isActive = tab.key === activeFilter;
              const count = filteredCountByType[tab.key];
              return (
                <Button
                  key={tab.key}
                  type="button"
                  btnStyle="ghost"
                  btnShape="rounded"
                  className={cn(
                    "min-w-[128px] justify-center gap-2 py-2 text-p2-b transition-colors",
                    isActive
                      ? "bg-brand text-inverse shadow-[0_2px_8px_rgba(240,83,26,0.25)]"
                      : "text-secondary hover:text-primary",
                  )}
                  onClick={() => setActiveFilter(tab.key)}
                >
                  <span>{tab.label}</span>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 caption2-b",
                      isActive ? "bg-inverse/20 text-inverse" : "bg-bg-2 text-secondary",
                    )}
                  >
                    {count}
                  </span>
                </Button>
              );
            })}
          </div>

          <OrderStatusBoard
            transactions={filteredTransactions}
            className="bg-bg-0 pb-6"
            onAdvanceStatus={handleAdvanceStatus}
          />
        </div>
      </section>
    </div>
  );
}
