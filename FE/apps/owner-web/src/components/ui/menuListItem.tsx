import * as React from "react"

import { cn } from "@/lib/utils"
import { Check, Clock, GripVertical, Pencil, X } from "lucide-react"

export type MenuListItemVariant =
  | "default"
  | "closeout-sale"
  | "foocketing"
  | "select-menu"

export type MenuSelectState = "default" | "unselected" | "selected"

interface MenuListItemProps {
  variant?: MenuListItemVariant
  selectState?: MenuSelectState
  menuName: string
  price: number
  categoryName?: string
  imageUrl?: string | null
  saleQuantity?: number
  discountRate?: number
  discountPrice?: number
  originalPrice?: number
  foocketingTime?: string
  foocketingQuantity?: number
  onEdit?: () => void
  onDelete?: () => void
  onToggleSelect?: (checked: boolean) => void
  reorderable?: boolean
  className?: string
  actionsClassName?: string
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>
  containerProps?: React.HTMLAttributes<HTMLDivElement>
  isDragging?: boolean
}

export function MenuListItem(props: MenuListItemProps) {
  const {
    variant = "default",
    selectState = "default",
    menuName,
    price,
    categoryName = "카테고리",
    imageUrl,
    saleQuantity,
    discountRate,
    discountPrice,
    originalPrice,
    foocketingTime,
    foocketingQuantity,
    onEdit,
    onDelete,
    onToggleSelect,
    reorderable = true,
    className,
    actionsClassName,
    dragHandleProps,
    containerProps,
    isDragging = false,
  } = props

  const formattedPrice = React.useMemo(() => formatCurrency(price), [price])
  const formattedDiscountPrice = React.useMemo(
    () => formatCurrency(discountPrice),
    [discountPrice],
  )
  const formattedOriginalPrice = React.useMemo(
    () => formatCurrency(originalPrice),
    [originalPrice],
  )
  const formattedSaleQuantity = React.useMemo(
    () => formatQuantity(saleQuantity),
    [saleQuantity],
  )
  const formattedFoocketingQuantity = React.useMemo(
    () => formatQuantity(foocketingQuantity),
    [foocketingQuantity],
  )

  if (variant === "select-menu") {
    return (
      <SelectMenuItem
        menuName={menuName}
        formattedPrice={formattedPrice}
        categoryName={categoryName}
        selectState={selectState}
        onToggleSelect={onToggleSelect}
        className={className}
      />
    )
  }

  return (
    <div
      {...containerProps}
      className={cn(
        "border-b border-stroke-3 bg-bg-0 transition-all duration-150",
        isDragging ? "opacity-50" : "",
        containerProps?.className,
      )}
    >
      <div
        className={cn(
          "flex w-full items-center gap-2 py-3 px-4 text-primary",
          className,
        )}
      >
        {variant === "default" && reorderable ? (
          <DragHandle dragHandleProps={dragHandleProps} />
        ) : null}

        {variant === "closeout-sale" ? (
          <CloseoutSaleSummary quantity={formattedSaleQuantity} />
        ) : null}

        {variant === "foocketing" ? (
          <FoocketingSummary quantity={formattedFoocketingQuantity} />
        ) : null}

        <div className="flex flex-1 flex-col justify-center gap-1">
          <div className="flex items-center justify-between gap-2">
            <span className="h5-b leading-6 text-primary line-clamp-1">
              {menuName}
            </span>
            <span className="shrink-0 rounded-full px-2 py-1 caption2 text-inverse bg-brand-subtle">
              {categoryName}
            </span>
          </div>
          {variant === "default" ? (
            <span className="p2 text-secondary">{formattedPrice}원</span>
          ) : null}
          {variant === "foocketing" ? (
            <span className="flex items-center text-sm font-semibold text-brand">
              <Clock className="h-4 w-4" />
              <span className="ml-1 p2-b">{foocketingTime ?? "00:00"}</span>
              <span className="ml-2 caption2 text-tertiary line-through">
                {formattedPrice}원
              </span>
            </span>
          ) : null}
          {variant === "closeout-sale" ? (
            <div className="flex flex-wrap items-center gap-1">
              {discountRate !== undefined ? (
                <span className="p2-b text-brand">
                  {discountRate}
                  <span className="align-top p2-b text-secondary">%</span>
                </span>
              ) : null}
              {discountPrice !== undefined ? (
                <span className="p2-b text-brand">
                  {formattedDiscountPrice}원
                </span>
              ) : null}
              {originalPrice !== undefined ? (
                <span className="caption2 text-tertiary line-through">
                  {formattedOriginalPrice}원
                </span>
              ) : null}
            </div>
          ) : null}
        </div>

        {imageUrl ? (
          <div className="relative h-14 w-14 overflow-hidden rounded-xl border border-stroke-3 bg-bg-1">
            <img
              src={imageUrl}
              alt={`${menuName} 이미지`}
              className="h-full w-full object-cover"
            />
          </div>
        ) : null}

        <div
          className={cn(
            "flex items-center gap-2 text-secondary",
            actionsClassName,
          )}
        >
          <ActionIconButton
            icon={Pencil}
            label="메뉴 수정"
            onClick={onEdit}
            size="compact"
          />
          <ActionIconButton
            icon={X}
            label="메뉴 삭제"
            onClick={onDelete}
            size="compact"
          />
        </div>
      </div>
    </div>
  )
}

interface InternalDragHandleProps {
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>
}

function DragHandle({ dragHandleProps }: InternalDragHandleProps) {
  const { className, ...restProps } = dragHandleProps ?? {}

  return (
    <div
      {...restProps}
      role="button"
      tabIndex={0}
      aria-label="메뉴 순서 변경"
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-md border border-transparent text-stroke-2 hover:border-stroke-3 hover:bg-bg-1 focus:outline-none focus:ring-2 focus:ring-brand/40 cursor-grab active:cursor-grabbing touch-none",
        className,
      )}
      style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
    >
      <GripVertical className="h-4 w-4 pointer-events-none" style={{ userSelect: 'none' }} />
    </div>
  )
}

interface FoocketingSummaryProps {
  quantity: string
}

function FoocketingSummary({ quantity }: FoocketingSummaryProps) {
  return (
    <div className="flex w-10 items-end justify-center text-brand">
      <span className="h3-b leading-none">{quantity}</span>
      <span className="mb-1 ml-0.5 caption1 text-secondary">개</span>
    </div>
  )
}

interface CloseoutSaleSummaryProps {
  quantity: string
}

function CloseoutSaleSummary({ quantity }: CloseoutSaleSummaryProps) {
  return (
    <div className="flex w-10 items-end justify-center text-brand">
      <span className="h3-b leading-none">{quantity}</span>
      <span className="mb-1 ml-0.5 caption1 text-secondary">개</span>
    </div>
  )
}

interface SelectMenuItemProps {
  menuName: string
  formattedPrice: string
  categoryName: string
  selectState: MenuSelectState
  onToggleSelect?: (checked: boolean) => void
  className?: string
}

function SelectMenuItem({
  menuName,
  formattedPrice,
  categoryName,
  selectState,
  onToggleSelect,
  className,
}: SelectMenuItemProps) {
  const normalizedState =
    selectState === "default" ? "unselected" : selectState
  const isSelected = normalizedState === "selected"

  const handleToggle = React.useCallback(() => {
    onToggleSelect?.(!isSelected)
  }, [isSelected, onToggleSelect])

  return (
    <label
      className={cn(
        "flex w-full cursor-pointer items-center justify-between rounded-2xl border px-5 py-4 transition-colors",
        isSelected
          ? "border-brand bg-brand-bg-1 text-primary"
          : "border-stroke-3 bg-white text-primary",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          className="sr-only"
          checked={isSelected}
          onChange={handleToggle}
          readOnly={onToggleSelect === undefined}
        />
        <button
          type="button"
          onClick={handleToggle}
          className={cn(
            "grid h-6 w-6 place-items-center rounded-md border transition-colors",
            isSelected
              ? "border-brand bg-brand text-white"
              : "border-stroke-2 text-stroke-2 hover:border-brand hover:text-brand",
          )}
          aria-pressed={isSelected}
        >
          {isSelected ? <Check className="h-4 w-4" /> : null}
        </button>
        <div className="flex flex-col">
          <span
            className={cn(
              "text-base font-semibold leading-6",
              isSelected ? "text-brand-strong" : "text-primary",
            )}
          >
            {menuName}
          </span>
          <span
            className={cn(
              "text-sm font-medium",
              isSelected ? "text-brand-strong/70" : "text-secondary",
            )}
          >
            {formattedPrice}원
          </span>
        </div>
      </div>
      <span
        className={cn(
          "rounded-full px-2 py-1 caption2",
          isSelected ? "bg-brand text-white" : "bg-brand-subtle text-inverse",
        )}
      >
        {categoryName}
      </span>
    </label>
  )
}

interface ActionIconButtonProps {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  label: string
  onClick?: () => void
  size?: "default" | "compact"
}

function ActionIconButton({
  icon: Icon,
  label,
  onClick,
  size = "default",
}: ActionIconButtonProps) {
  const buttonClass =
    size === "compact"
      ? "h-6 w-6 rounded-md"
      : "h-10 w-10 rounded-lg"
  const iconClass = size === "compact" ? "h-3.5 w-3.5" : "h-5 w-5"

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "grid place-items-center border border-transparent transition-colors hover:border-stroke-2 hover:bg-bg-1",
        buttonClass,
      )}
      aria-label={label}
    >
      <Icon className={iconClass} />
    </button>
  )
}

function formatCurrency(value?: number | null) {
  if (value === undefined || value === null) {
    return "00,000"
  }
  return value.toLocaleString("ko-KR")
}

function formatQuantity(value?: number | null) {
  if (value === undefined || value === null) {
    return "00"
  }

  return String(value).padStart(2, "0")
}

