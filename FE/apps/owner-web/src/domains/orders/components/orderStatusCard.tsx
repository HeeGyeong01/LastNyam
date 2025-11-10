import { Button } from "@shared/src/components/Button"
import { cn } from "@/lib/utils"

type OrderStatus = "PENDING_APPROVAL" | "PREPARING_FOOD" | "WAITING_PICKUP"
type TransactionType = "DISCOUNT" | "FOOCKETING"

interface OrderItem {
  name: string
  amount?: number | null
  menuPrice?: number
  subtotal?: number
}

interface OrderStatusCardProps {
  transactionId?: number | string
  status: OrderStatus
  items: OrderItem[]
  title?: string
  description?: string
  actionLabel?: string
  transactionType?: TransactionType
  createdAt?: string | Date
  totalAmount?: number
  className?: string
  onAction?: () => void
}

interface StatusConfig {
  label: string
  description: string
//   highlight: string
  buttonStyle: "filled-yellow" | "filled-red" | "filled-default"
  actionLabel?: string
}

export const ORDER_STATUS_CONFIG: Record<OrderStatus, StatusConfig> = {
  PENDING_APPROVAL: {
    label: "신규 주문",
    description: "주문을 확인하셨다면 주문확인 버튼을 눌러주세요",
    // highlight: "text-brand",
    buttonStyle: "filled-yellow",
    actionLabel: "주문 확인",
  },
  PREPARING_FOOD: {
    label: "진행 중",
    description: "포장이 완료되셨다면 준비완료 버튼을 눌러주세요",
    // highlight: "text-brand",
    buttonStyle: "filled-red",
    actionLabel: "준비 완료",
  },
  WAITING_PICKUP: {
    label: "수령 대기",
    description: "수령확인하기로 QR을 인식해 완료할 수 있어요",
    // highlight: "text-brand",
    buttonStyle: "filled-default",
  },
}

const formatCurrency = (value: number) => new Intl.NumberFormat("ko-KR").format(value)

const formatDateTime = (value: string | Date) => {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value instanceof Date ? value.toLocaleString() : value
  }
  return new Intl.DateTimeFormat("ko-KR", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

const TRANSACTION_TYPE_LABEL: Record<TransactionType, string> = {
  DISCOUNT: "마감세일",
  FOOCKETING: "푸켓팅",
}

export function OrderStatusCard({
  transactionId,
  status,
  items,
  title,
  description,
  actionLabel,
  transactionType,
  createdAt,
  totalAmount,
  className,
  onAction,
}: OrderStatusCardProps) {
  const config = ORDER_STATUS_CONFIG[status]
  const transactionTypeLabel = transactionType ? TRANSACTION_TYPE_LABEL[transactionType] : undefined
  const resolvedTitle = (() => {
    if (title) {
      return title
    }

    if (transactionTypeLabel && transactionId !== undefined) {
      return `${transactionTypeLabel} #${transactionId}`
    }

    if (transactionTypeLabel) {
      return transactionTypeLabel
    }

    if (transactionId !== undefined) {
      return `주문번호 #${transactionId}`
    }

    return config.label
  })()
  const resolvedDescription = description ?? config.description
  const resolvedActionLabel = actionLabel ?? config.actionLabel
  const buttonStyle = config.buttonStyle

  const showQuantity = items.some(
    (item) => item.amount !== undefined && item.amount !== null
  )

  const isFooketing = transactionType === "FOOCKETING"

  const shouldShowTotal = !isFooketing && totalAmount !== undefined
  const shouldShowDescriptionInCard = status === "WAITING_PICKUP" && Boolean(resolvedDescription)

  return (
    <section
      className={cn(
        "flex h-full flex-col bg-bg-0/80 p-5 shadow-sm backdrop-blur",
        shouldShowTotal ? "pb-3" : undefined,
        className
      )}
    >
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-0.5">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className={cn("h4-b text-brand")}>{resolvedTitle}</h3>
          </div>
          {shouldShowDescriptionInCard ? (
            <p className="p3 text-secondary">{resolvedDescription}</p>
          ) : null}
          <div className="flex flex-wrap gap-x-4 p3 text-subtle">
            {createdAt ? <span>접수 {formatDateTime(createdAt)}</span> : null}
          </div>
        </div>
        {resolvedActionLabel ? (
          <Button
            btnStyle={buttonStyle}
            className="ml-auto"
            onClick={onAction}
          >
            {resolvedActionLabel}
          </Button>
        ) : null}
      </header>

      <div className="mt-6 grow">
        <div className={cn("flex items-center justify-between p1-b text-primary", !showQuantity && "justify-start")}
        >
          <span>메뉴명</span>
          {showQuantity ? <span>수량</span> : null}
        </div>
        <ul className="mt-3 space-y-2">
          {items.map((item, index) => (
            <li
              key={`${item.name}-${index}`}
              className="rounded-lg bg-bg-1 px-4 py-3"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <span className="block p2-b text-primary">{item.name}</span>
                  {item.menuPrice !== undefined ? (
                    <span className="block caption1 text-secondary">
                      단가 {formatCurrency(item.menuPrice)}원
                      {item.subtotal !== undefined ? ` · 합계 ${formatCurrency(item.subtotal)}원` : ""}
                    </span>
                  ) : null}
                </div>
                {showQuantity ? (
                  <span className="p2 text-secondary">
                    {item.amount ?? "-"}
                  </span>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {shouldShowTotal ? (
        <div className="mt-4 flex items-center justify-end px-4 py-2 p2-b text-primary">
          총 결제 금액 {formatCurrency(totalAmount)}원
        </div>
      ) : null}
    </section>
  )
}

export type { OrderItem, OrderStatus, OrderStatusCardProps, TransactionType }

