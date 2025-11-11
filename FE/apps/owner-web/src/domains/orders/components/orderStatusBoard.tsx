import { useMemo } from "react"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./accordion"
import { ORDER_STATUS_CONFIG, OrderStatusCard, type OrderStatus, type TransactionType } from "./orderStatusCard"

type OrderStatusBoardTransactionItem = {
  menuName: string
  menuPrice?: number
  amount?: number
  subtotal?: number
}

export type OrderStatusBoardTransaction = {
  transactionId: number | string
  transactionStatus: OrderStatus
  createdAt: string | Date
  transactionType: TransactionType
  itemDtos: OrderStatusBoardTransactionItem[]
  totalAmount?: number
  transactionKey?: string
}

export interface OrderStatusBoardProps {
  transactions: OrderStatusBoardTransaction[]
  className?: string
  accordionType?: "single" | "multiple"
  onAdvanceStatus?: (transaction: OrderStatusBoardTransaction) => void
}

const STATUS_ORDER: OrderStatus[] = ["PENDING_APPROVAL", "PREPARING_FOOD", "WAITING_PICKUP"]

const EMPTY_MESSAGE: Partial<Record<OrderStatus, string>> = {
  PENDING_APPROVAL: "현재 새로운 주문이 없습니다.",
  PREPARING_FOOD: "현재 조리중인 주문이 없습니다.",
  WAITING_PICKUP: "현재 수령 대기 중인 주문이 없습니다.",
}

export function OrderStatusBoard({
  transactions,
  className,
  accordionType = "multiple",
  onAdvanceStatus,
}: OrderStatusBoardProps) {
  const sections = useMemo(() => {
    return STATUS_ORDER.map((status) => {
      const sectionTransactions = transactions.filter((transaction) => transaction.transactionStatus === status)

      return {
        status,
        label: ORDER_STATUS_CONFIG[status].label,
        description: ORDER_STATUS_CONFIG[status].description,
        actionLabel: ORDER_STATUS_CONFIG[status].actionLabel,
        transactions: sectionTransactions,
      }
    })
  }, [transactions])

  return (
    <div className={className}>
      <Accordion type={accordionType} collapsible={accordionType === "single" ? true : undefined}>
        {sections.map((section) => (
          <AccordionItem key={section.status} value={section.status}>
            <AccordionTrigger items={section.transactions}>{section.label}</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 px-4 pb-4 pt-3">
                <p className="text-p2 text-secondary">{section.description}</p>
                {section.transactions.length > 0 ? (
                  <div className="space-y-4">
                    {section.transactions.map((transaction, index) => (
                      <OrderStatusCard
                        key={transaction.transactionKey ?? `${transaction.transactionId}-${transaction.transactionType}-${index}`}
                        transactionId={transaction.transactionId}
                        status={transaction.transactionStatus}
                        transactionType={transaction.transactionType}
                        createdAt={transaction.createdAt}
                        totalAmount={transaction.totalAmount}
                        items={transaction.itemDtos.map((item) => ({
                          name: item.menuName,
                          amount: transaction.transactionType === "FOOCKETING" ? undefined : item.amount,
                          menuPrice: item.menuPrice,
                          subtotal: item.subtotal,
                        }))}
                        onAction={
                          section.actionLabel && onAdvanceStatus
                            ? () => onAdvanceStatus(transaction)
                            : undefined
                        }
                      />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl bg-bg-2/60 p-4 text-center text-p2 text-secondary">
                  {EMPTY_MESSAGE[section.status] ?? "현재 상태의 주문이 없습니다."}
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}


