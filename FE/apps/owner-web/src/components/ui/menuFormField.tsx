import * as React from "react"

import { cn } from "@/lib/utils"
import { DescriptionInput, type DescriptionInputProps } from "./descriptionInput"
import { Input, type OwnerInputProps } from "./ownerInput"
import { TimeInput, type TimeInputProps } from "./timeInput"
import { Button } from "@shared/src/components/Button"

interface BaseMenuFormFieldProps {
  title: string
  required?: boolean
  helperText?: string
  className?: string
  titleClassName?: string
  fieldWrapperClassName?: string
}

interface DefaultVariantProps extends BaseMenuFormFieldProps {
  variant?: "default"
  inputProps?: OwnerInputProps
}

interface ExplanationVariantProps extends BaseMenuFormFieldProps {
  variant: "explanation"
  textareaProps?: DescriptionInputProps
}

type CategoryValue = string | string[]

interface CategoryOption {
  value: string
  label: string
}

interface CategoryVariantProps extends BaseMenuFormFieldProps {
  variant: "category"
  options: CategoryOption[]
  value?: CategoryValue
  defaultValue?: CategoryValue
  onChange?: (value: CategoryValue) => void
  multiple?: boolean
  optionClassName?: string
}

interface TimeVariantProps extends BaseMenuFormFieldProps {
  variant: "time"
  timeInputProps?: TimeInputProps
}

interface DiscountValue {
  discountPrice?: number
  discountRate?: number
}

interface DiscountVariantProps extends BaseMenuFormFieldProps {
  variant: "discount"
  basePrice: number
  defaultValue?: DiscountValue
  onChange?: (value: DiscountValue) => void
  priceInputProps?: OwnerInputProps
  rateInputProps?: OwnerInputProps
  pricePlaceholder?: string
  ratePlaceholder?: string
}

type MenuFormFieldProps =
  | DefaultVariantProps
  | ExplanationVariantProps
  | CategoryVariantProps
  | TimeVariantProps
  | DiscountVariantProps

const clampNumber = (value: number, min: number, max: number) => {
  if (Number.isNaN(value)) {
    return min
  }
  return Math.max(min, Math.min(max, value))
}

export function MenuFormField(props: MenuFormFieldProps) {
  const {
    title,
    required,
    helperText,
    className,
    titleClassName,
    fieldWrapperClassName,
  } = props

  const isDescriptionVariant = props.variant === "explanation"
  const fieldRef = React.useRef<HTMLDivElement>(null)

  const scrollIntoViewIfNeeded = () => {
    if (fieldRef.current) {
      setTimeout(() => {
        fieldRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        })
      }, 100)
    }
  }

  const renderField = () => {
    switch (props.variant) {
      case "explanation": {
        const { textareaProps } = props
        const originalOnFocus = textareaProps?.onFocus
        return (
          <DescriptionInput
            {...textareaProps}
            label={undefined}
            className={cn("w-full", textareaProps?.className)}
            onFocus={(e) => {
              scrollIntoViewIfNeeded()
              originalOnFocus?.(e)
            }}
          />
        )
      }
      case "category": {
        const { options, onChange, value, defaultValue, multiple = false, optionClassName } = props

        const [internalValue, setInternalValue] = React.useState<CategoryValue>(() => {
          if (value !== undefined) {
            return value
          }
          if (defaultValue !== undefined) {
            return defaultValue
          }
          return multiple ? [] : ""
        })

        React.useEffect(() => {
          if (value !== undefined) {
            setInternalValue(value)
          }
        }, [value])

        const currentValue = value !== undefined ? value : internalValue

        const handleSelect = (selectedValue: string) => {
          if (multiple) {
            const currentArray = Array.isArray(currentValue) ? currentValue : []
            const exists = currentArray.includes(selectedValue)
            const nextValue = exists
              ? currentArray.filter((item) => item !== selectedValue)
              : [...currentArray, selectedValue]

            if (value === undefined) {
              setInternalValue(nextValue)
            }
            onChange?.(nextValue)
          } else {
            const nextValue = selectedValue
            if (value === undefined) {
              setInternalValue(nextValue)
            }
            onChange?.(nextValue)
          }
        }

        return (
          <div className={cn(
            "flex gap-2 overflow-x-auto py-1 w-full",
            "[mask-image:linear-gradient(to_right,black_0,black_calc(100%-16px),transparent_100%)]",
            "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          )}>
            {options.map((option) => {
              const isSelected = Array.isArray(currentValue)
                ? currentValue.includes(option.value)
                : currentValue === option.value

              return (
                <Button
                  key={option.value}
                  type="button"
                  btnStyle={isSelected ? "filled-red" : "filled-default"}
                  onClick={() => handleSelect(option.value)}
                  className={cn("shrink-0 px-4", optionClassName)}
                >
                  {option.label}
                </Button>
              )
            })}
          </div>
        )
      }
      case "time": {
        const { timeInputProps } = props
        return (
          <div 
            className="flex w-full items-center justify-end"
            onClick={scrollIntoViewIfNeeded}
          >
            <TimeInput 
              {...timeInputProps} 
              className={cn("w-auto", timeInputProps?.className)} 
            />
          </div>
        )
      }
      case "discount": {
        const {
          basePrice,
          defaultValue,
          onChange,
          priceInputProps,
          rateInputProps,
          pricePlaceholder = "할인가",
          ratePlaceholder = "할인율",
        } = props

        const lastChangedRef = React.useRef<"price" | "rate" | null>(null)

        const [priceValue, setPriceValue] = React.useState<string>(() => {
          if (defaultValue?.discountPrice !== undefined) {
            return defaultValue.discountPrice.toString()
          }
          if (defaultValue?.discountRate !== undefined && basePrice > 0) {
            const computed = Math.round(basePrice * (1 - defaultValue.discountRate / 100))
            return clampNumber(computed, 0, basePrice).toString()
          }
          return ""
        })

        const [rateValue, setRateValue] = React.useState<string>(() => {
          if (defaultValue?.discountRate !== undefined) {
            return clampNumber(defaultValue.discountRate, 0, 100).toString()
          }
          if (defaultValue?.discountPrice !== undefined && basePrice > 0) {
            const computed = Math.round(((basePrice - defaultValue.discountPrice) / basePrice) * 100)
            return clampNumber(computed, 0, 100).toString()
          }
          return ""
        })

        const [lockedBy, setLockedBy] = React.useState<"price" | "rate" | null>(() => {
          if (defaultValue?.discountPrice !== undefined) {
            return "price"
          }
          if (defaultValue?.discountRate !== undefined) {
            return "rate"
          }
          return null
        })

        const priceChangeProp = priceInputProps?.onChange
        const rateChangeProp = rateInputProps?.onChange

        const computeRateFromPrice = (price: number) => {
          if (basePrice <= 0) return undefined
          const rawRate = Math.round(((basePrice - price) / basePrice) * 100)
          return clampNumber(rawRate, 0, 100)
        }

        const computePriceFromRate = (rate: number) => {
          if (basePrice <= 0) return undefined
          const rawPrice = Math.round(basePrice * (1 - rate / 100))
          return clampNumber(rawPrice, 0, basePrice)
        }

        React.useEffect(() => {
          const lastChanged = lastChangedRef.current
          if (!defaultValue) {
            setPriceValue("")
            setRateValue("")
            setLockedBy(null)
            lastChangedRef.current = null
            return
          }

          const { discountPrice, discountRate } = defaultValue

          if (lastChanged === "rate" && discountRate !== undefined) {
            const boundedRate = clampNumber(discountRate, 0, 100)
            setRateValue(boundedRate.toString())

            if (basePrice > 0) {
              const computedPrice = computePriceFromRate(boundedRate)
              if (computedPrice !== undefined) {
                setPriceValue(computedPrice.toString())
              } else {
                setPriceValue("")
              }
            } else if (typeof discountPrice === "number") {
              setPriceValue(`${discountPrice}`)
            } else {
              setPriceValue("")
            }

            setLockedBy("rate")
            lastChangedRef.current = null
            return
          }

          if (discountPrice !== undefined) {
            const boundedPrice = clampNumber(discountPrice, 0, basePrice > 0 ? basePrice : discountPrice)
            setPriceValue(boundedPrice.toString())

            if (basePrice > 0) {
              const computedRate = computeRateFromPrice(boundedPrice)
              if (computedRate !== undefined) {
                setRateValue(computedRate.toString())
              } else {
                setRateValue("")
              }
            } else if (discountRate !== undefined) {
              setRateValue(clampNumber(discountRate, 0, 100).toString())
            } else {
              setRateValue("")
            }

            setLockedBy(lastChanged ?? "price")
            lastChangedRef.current = null
            return
          }

          if (discountRate !== undefined) {
            const boundedRate = clampNumber(discountRate, 0, 100)
            setRateValue(boundedRate.toString())

            if (basePrice > 0) {
              const computedPrice = computePriceFromRate(boundedRate)
              if (computedPrice !== undefined) {
                setPriceValue(computedPrice.toString())
              } else {
                setPriceValue("")
              }
            } else if (typeof discountPrice === "number") {
              setPriceValue(`${discountPrice}`)
            } else {
              setPriceValue("")
            }

            setLockedBy(lastChanged ?? "rate")
            lastChangedRef.current = null
            return
          }

          setPriceValue("")
          setRateValue("")
          setLockedBy(null)
          lastChangedRef.current = null
        }, [defaultValue, basePrice])

        React.useEffect(() => {
          if (basePrice <= 0) {
            return
          }

          if (lockedBy === "price" && priceValue) {
            const numericPrice = clampNumber(parseInt(priceValue, 10), 0, basePrice)
            const rate = computeRateFromPrice(numericPrice)
            setPriceValue(numericPrice.toString())
            if (rate !== undefined) {
              setRateValue(rate.toString())
            } else {
              setRateValue("")
            }
            onChange?.({
              discountPrice: numericPrice,
              discountRate: rate,
            })
          } else if (lockedBy === "rate" && rateValue) {
            const numericRate = clampNumber(parseInt(rateValue, 10), 0, 100)
            const price = computePriceFromRate(numericRate)
            setRateValue(numericRate.toString())
            if (price !== undefined) {
              setPriceValue(price.toString())
            } else {
              setPriceValue("")
            }
            onChange?.({
              discountPrice: price,
              discountRate: numericRate,
            })
          }
        }, [basePrice])

        const handlePriceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
          const raw = event.target.value ?? ""
          const sanitized = raw.replace(/[^0-9]/g, "")

          if (sanitized === "") {
            setPriceValue("")
            setRateValue("")
            setLockedBy(null)
            onChange?.({ discountPrice: undefined, discountRate: undefined })
            priceChangeProp?.(event)
            lastChangedRef.current = null
            return
          }

          const numericPrice = clampNumber(parseInt(sanitized, 10), 0, basePrice)
          const priceString = numericPrice.toString()
          setPriceValue(priceString)
          setLockedBy("price")
          lastChangedRef.current = "price"

          if (basePrice > 0) {
            const computedRate = computeRateFromPrice(numericPrice)
            if (computedRate !== undefined) {
              setRateValue(computedRate.toString())
            } else {
              setRateValue("")
            }
            onChange?.({ discountPrice: numericPrice, discountRate: computedRate })
          } else {
            onChange?.({ discountPrice: numericPrice })
          }

          priceChangeProp?.(event)
        }

        const handleRateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
          const raw = event.target.value ?? ""
          const sanitized = raw.replace(/[^0-9]/g, "")

          if (sanitized === "") {
            setRateValue("")
            setPriceValue("")
            setLockedBy(null)
            onChange?.({ discountPrice: undefined, discountRate: undefined })
            rateChangeProp?.(event)
            lastChangedRef.current = null
            return
          }

          const numericRate = clampNumber(parseInt(sanitized, 10), 0, 100)
          const rateString = numericRate.toString()
          setRateValue(rateString)
          setLockedBy("rate")
          lastChangedRef.current = "rate"

          if (basePrice > 0) {
            const computedPrice = computePriceFromRate(numericRate)
            if (computedPrice !== undefined) {
              setPriceValue(computedPrice.toString())
            } else {
              setPriceValue("")
            }
            onChange?.({ discountPrice: computedPrice, discountRate: numericRate })
          } else {
            onChange?.({ discountRate: numericRate })
          }

          rateChangeProp?.(event)
        }

        const {
          className: priceClassName,
          onBlur: priceBlur,
          onFocus: priceFocus,
          variant: priceVariant = "filled",
          disabled: priceDisabledProp,
          ...priceRest
        } = priceInputProps ?? {}

        const {
          className: rateClassName,
          onBlur: rateBlur,
          onFocus: rateFocus,
          variant: rateVariant = "filled",
          disabled: rateDisabledProp,
          ...rateRest
        } = rateInputProps ?? {}

        const isPriceLocked = !priceDisabledProp && lockedBy === "rate" && rateValue !== ""
        const isRateLocked = !rateDisabledProp && lockedBy === "price" && priceValue !== ""

        return (
          <div className="flex flex-col gap-2 w-full">
            <div className="flex gap-2">
              <Input
                {...priceRest}
                value={priceValue}
                onChange={handlePriceChange}
                onBlur={(event) => {
                  priceBlur?.(event)
                }}
                onFocus={(event) => {
                  scrollIntoViewIfNeeded()
                  if (isPriceLocked) {
                    setLockedBy("price")
                  }
                  priceFocus?.(event)
                }}
                placeholder={pricePlaceholder}
                unit="원"
                inputMode="numeric"
                pattern="[0-9]*"
                readOnly={isPriceLocked}
                variant={priceVariant}
                className={cn(
                  "flex-1 min-w-[120px]",
                  isPriceLocked && "bg-bg-3 text-tertiary",
                  isPriceLocked && "cursor-pointer",
                  priceClassName,
                )}
              />
              <Input
                {...rateRest}
                value={rateValue}
                onChange={handleRateChange}
                onBlur={(event) => {
                  rateBlur?.(event)
                }}
                onFocus={(event) => {
                  scrollIntoViewIfNeeded()
                  if (isRateLocked) {
                    setLockedBy("rate")
                  }
                  rateFocus?.(event)
                }}
                placeholder={ratePlaceholder}
                unit="%"
                inputMode="numeric"
                pattern="[0-9]*"
                readOnly={isRateLocked}
                variant={rateVariant}
                className={cn(
                  "flex-1 min-w-[120px]",
                  isRateLocked && "bg-bg-3 text-tertiary",
                  isRateLocked && "cursor-pointer",
                  rateClassName,
                )}
              />
            </div>
            {basePrice <= 0 && (
              <p className="text-p3 text-warning">정상가가 0원 이하라 할인 계산이 불가능합니다.</p>
            )}
          </div>
        )
      }
      case "default":
      default: {
        const { inputProps } = props as DefaultVariantProps
        const originalOnFocus = inputProps?.onFocus
        return (
          <Input 
            {...inputProps}
            onFocus={(e) => {
              scrollIntoViewIfNeeded()
              originalOnFocus?.(e)
            }}
          />
        )
      }
    }
  }

  if (isDescriptionVariant) {
    return (
      <div ref={fieldRef} className={cn("w-full", className)}>
        <div className={cn("flex flex-col gap-2", fieldWrapperClassName)}>
          <div className={cn("flex items-center gap-1", titleClassName)}>
            <span className="text-p1-b text-primary">{title}</span>
            {required && <span className="text-brand">*</span>}
          </div>
          {renderField()}
          {helperText && (
            <p className="text-p2 text-subtle">{helperText}</p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div ref={fieldRef} className={cn("w-full", className)}>
      <div className="flex items-start gap-4">
        <div className={cn("flex items-start gap-1 min-w-[72px] pt-2", titleClassName)}>
          <span className="text-p1-b text-primary">{title}</span>
          {required && <span className="text-brand">*</span>}
        </div>
        <div className={cn("flex-1", fieldWrapperClassName)}>
          {renderField()}
          {helperText && (
            <p className="mt-2 text-p2 text-subtle">{helperText}</p>
          )}
        </div>
      </div>
    </div>
  )
}

MenuFormField.displayName = "MenuFormField"


