import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@shared/src/components/Button";
import { cn } from "@/lib/utils";
import { useOwnerStore } from "@/store/useOwnerStore";

const NYAMCAT_IMAGE_SRC = `${import.meta.env.BASE_URL}nyamcat.png`;

import {
  OrderStatusBoard,
  type OrderStatusBoardTransaction,
} from "../components/orderStatusBoard";
import {
  ORDER_STATUS_CONFIG,
  type OrderStatus,
  type TransactionType,
} from "../components/orderStatusCard";
import { orderApi } from "../apis/order.api";

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

const isValidTransactionType = (value: string): value is TransactionType => {
  return TRANSACTION_TABS.some((tab) => tab.key === value);
};

const VALID_STATUSES: OrderStatus[] = [
  "PENDING_APPROVAL",
  "PREPARING_FOOD",
  "WAITING_PICKUP",
];

const isValidStatus = (value: string): value is OrderStatus => {
  return VALID_STATUSES.includes(value as OrderStatus);
};

export default function OrderListPage() {
  const navigate = useNavigate();
  const ownerId = useOwnerStore((state) => state.ownerId);
  const accessToken = useOwnerStore((state) => state.accessToken);
  const shops = useOwnerStore((state) => state.shops);
  const [transactions, setTransactions] = useState<OrderStatusBoardTransaction[]>([]);
  const [activeFilter, setActiveFilter] = useState<TransactionFilter>("DISCOUNT");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const selectedShopId = shops[0]?.shopId;

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

  const fetchTransactions = useCallback(async () => {
    if (!ownerId || !accessToken || !selectedShopId) {
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await orderApi.getTransactions(ownerId, selectedShopId, accessToken);
      const apiTransactions = response.data?.transactions ?? [];

      const sanitisedTransactions = apiTransactions
        .filter(
          (transaction): transaction is typeof apiTransactions[number] =>
            Boolean(transaction) &&
            isValidStatus(transaction.transactionStatus) &&
            isValidTransactionType(transaction.transactionType),
        )
        .map<OrderStatusBoardTransaction>((transaction) => ({
          transactionId: transaction.transactionId,
          transactionStatus: transaction.transactionStatus,
          createdAt: transaction.createdAt,
          transactionType: transaction.transactionType,
          itemDtos: Array.isArray(transaction.itemDtos) ? transaction.itemDtos : [],
          totalAmount: transaction.totalAmount,
          transactionKey: `${transaction.transactionId}-${transaction.transactionType}`,
        }));

      setTransactions(sanitisedTransactions);
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("주문 목록을 불러오는 중 문제가 발생했습니다.");
      }
      setTransactions([]);
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, ownerId, selectedShopId]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleManageMenu = () => {
    navigate("/owner/catalog/menu");
  };

  const handleAdvanceStatus = async (target: OrderStatusBoardTransaction) => {
    if (!ownerId || !accessToken) {
      setErrorMessage("인증 정보가 없습니다.");
      return;
    }

    const nextStatus = STATUS_TRANSITIONS[target.transactionStatus];

    try {
      // API 호출
      await orderApi.updateOrderStatus(
        ownerId,
        target.transactionId,
        {
          transactionType: target.transactionType,
          status: nextStatus,
        },
        accessToken,
      );

      // 성공하면 로컬 상태 업데이트
      setTransactions((previous) =>
        previous.map((transaction) => {
          const isSameTransaction =
            transaction.transactionId === target.transactionId &&
            transaction.transactionType === target.transactionType;

          if (!isSameTransaction) {
            return transaction;
          }

          return {
            ...transaction,
            transactionStatus: nextStatus,
          };
        }),
      );
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("주문 상태를 변경하는 중 문제가 발생했습니다.");
      }
    }
  };

  const headerDescription =
    ORDER_STATUS_CONFIG.WAITING_PICKUP.description ??
    "수령확인하기로 QR을 인식해 완료할 수 있어요";

  // Empty state 조건 확장
  const hasNoShop = !selectedShopId;
  const hasNoOrders = !isLoading && !errorMessage && selectedShopId && transactions.length === 0;
  const shouldShowEmptyState = hasNoShop || isLoading || hasNoOrders;

  if (shouldShowEmptyState) {
    let title = "현재 마감세일·푸켓팅 주문이 없어요";
    let description = "가게 메뉴를 관리할까요?";
    let buttonText = "메뉴 관리";
    let buttonAction = handleManageMenu;

    if (hasNoShop) {
      title = "등록된 가게 정보가 없어요";
      description = "가게 정보를 등록할까요?";
      buttonText = "가게 정보 등록";
      buttonAction = () => navigate("/owner/store-information/step1-document");
    } else if (isLoading) {
      title = "주문을 불러오고 있어요";
      description = "잠시만 기다려주세요";
      buttonText = "메뉴 관리";
      buttonAction = handleManageMenu;
    }

    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-bg-0 px-6 pb-20">
        <div className="relative mb-6 h-[106px] w-[108px] overflow-hidden rounded-full bg-[#FFF1C7]">
          <img
            src={NYAMCAT_IMAGE_SRC}
            alt="고양이"
            className="h-[106px] w-[108px] translate-x-2 translate-y-3"
          />
        </div>

        <div className="mb-3 space-y-2 text-center">
          <h2 className="p2-b text-primary">{title}</h2>
          <p className="p3 text-secondary">{description}</p>
        </div>

        <Button btnStyle="filled-gray" onClick={buttonAction}>
          {buttonText}
        </Button>
      </div>
    );
  }

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

      <section className="mt-4 pb-20">
        <div className="mx-auto flex w-full max-w-[480px] flex-col gap-4">
          <div className="mx-auto inline-flex items-center gap-1 rounded-full border border-stroke-3 bg-bg-0 p-1 shadow-sm">
            {TRANSACTION_TABS.map((tab) => {
              const isActive = tab.key === activeFilter;
              const count = filteredCountByType[tab.key] ?? 0;
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

          {errorMessage ? (
            <div className="rounded-xl border border-error bg-error/10 px-4 py-3 text-p2 text-error">
              {errorMessage}
            </div>
          ) : (
            <OrderStatusBoard
              transactions={filteredTransactions}
              className="bg-bg-0 pb-6"
              onAdvanceStatus={handleAdvanceStatus}
            />
          )}
        </div>
      </section>
    </div>
  );
}
