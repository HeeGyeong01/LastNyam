import * as React from "react"
import { createPortal } from "react-dom"
import { cn } from "@/lib/utils"

type TimePeriod = "AM" | "PM"

export interface TimeInputProps {
  value?: string // HH:MM 형식 (24시간)
  onChange?: (value: string) => void // HH:MM 형식으로 반환
  variant?: "filled" | "disabled"
  interval30?: boolean // 30분 단위로만 입력 가능
  format24h?: boolean // true면 24시간 형식, false면 12시간(AM/PM) 형식 (기본값: false)
  className?: string
  disabled?: boolean
}

interface DropdownPosition {
  top: number
  left: number
  width: number
}

const TimeInput = React.forwardRef<HTMLDivElement, TimeInputProps>(
  ({ value = "", onChange, variant = "filled", interval30 = false, format24h = false, className, disabled }, ref) => {
    const [openDropdown, setOpenDropdown] = React.useState<"hour" | "minute" | "period" | null>(null)
    const [editMode, setEditMode] = React.useState<"hour" | "minute" | "period" | null>(null)
    const [editValue, setEditValue] = React.useState("")
    const [dropdownPosition, setDropdownPosition] = React.useState<DropdownPosition>({ top: 0, left: 0, width: 0 })
    
    const containerRef = React.useRef<HTMLDivElement>(null)
    const hourInputRef = React.useRef<HTMLInputElement>(null)
    const minuteInputRef = React.useRef<HTMLInputElement>(null)
    const hourButtonRef = React.useRef<HTMLButtonElement>(null)
    const minuteButtonRef = React.useRef<HTMLButtonElement>(null)
    const periodButtonRef = React.useRef<HTMLButtonElement>(null)
    const dropdownRef = React.useRef<HTMLDivElement>(null)
    
    // 외부 ref와 내부 ref 연결
    React.useImperativeHandle(ref, () => containerRef.current as HTMLDivElement)

    // value를 파싱하여 시, 분, AM/PM으로 분리
    const parseTime = (timeStr: string) => {
      if (!timeStr || !timeStr.includes(":")) {
        return { hour: null, minute: null, period: null as TimePeriod | null }
      }

      const [hourStr, minuteStr] = timeStr.split(":")
      const hour24 = parseInt(hourStr, 10)
      const minute = parseInt(minuteStr, 10)

      if (Number.isNaN(hour24) || Number.isNaN(minute)) {
        return { hour: null, minute: null, period: null as TimePeriod | null }
      }

      // 24시간 형식일 때는 그대로 반환
      if (format24h) {
        return { hour: hour24, minute, period: null }
      }

      // 12시간 형식 변환
      let hour12 = hour24
      let period: TimePeriod = "AM"

      if (hour24 === 0) {
        hour12 = 12
        period = "AM"
      } else if (hour24 === 12) {
        hour12 = 12
        period = "PM"
      } else if (hour24 > 12) {
        hour12 = hour24 - 12
        period = "PM"
      } else {
        hour12 = hour24
        period = "AM"
      }

      return { hour: hour12, minute, period }
    }

    const [selectedHour, setSelectedHour] = React.useState<number | null>(() => parseTime(value).hour)
    const [selectedMinute, setSelectedMinute] = React.useState<number | null>(() => parseTime(value).minute)
    const [selectedPeriod, setSelectedPeriod] = React.useState<TimePeriod | null>(() => parseTime(value).period)

    const ignoreEmptyEffectRef = React.useRef(false)
    
    // 시간, 분 옵션 생성
    const hours = format24h 
      ? Array.from({ length: 24 }, (_, i) => i) // 0-23
      : Array.from({ length: 12 }, (_, i) => i + 1) // 1-12
    const minutes = interval30 
      ? [0, 30] 
      : Array.from({ length: 60 }, (_, i) => i)

    // 24시간 형식으로 변환
    const to24Hour = (hour12: number, minute: number, period: TimePeriod): string => {
      let hour24 = hour12
      if (period === "PM" && hour12 !== 12) {
        hour24 = hour12 + 12
      } else if (period === "AM" && hour12 === 12) {
        hour24 = 0
      }
      return `${hour24.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`
    }

    const updateTime = React.useCallback((hourValue: number | null, minuteValue: number | null, periodValue: TimePeriod | null) => {
      setSelectedHour(hourValue)
      setSelectedMinute(minuteValue)
      setSelectedPeriod(periodValue)

      const isComplete = format24h 
        ? (hourValue !== null && minuteValue !== null)
        : (hourValue !== null && minuteValue !== null && periodValue !== null)

      if (isComplete) {
        ignoreEmptyEffectRef.current = false
        const timeString = format24h
          ? `${hourValue!.toString().padStart(2, "0")}:${minuteValue!.toString().padStart(2, "0")}`
          : to24Hour(hourValue!, minuteValue!, periodValue!)
        onChange?.(timeString)
      } else {
        ignoreEmptyEffectRef.current = true
        onChange?.("")
      }
    }, [onChange, format24h])

    const handleHourSelect = (hourValue: number) => {
      updateTime(hourValue, selectedMinute, selectedPeriod)
      setOpenDropdown(null)
    }

    const handleMinuteSelect = (minuteValue: number) => {
      updateTime(selectedHour, minuteValue, selectedPeriod)
      setOpenDropdown(null)
    }

    const handlePeriodSelect = (periodValue: TimePeriod) => {
      updateTime(selectedHour, selectedMinute, periodValue)
      setOpenDropdown(null)
    }

    // 드롭다운 위치 계산
    const updateDropdownPosition = (type: "hour" | "minute" | "period") => {
      const buttonRef = type === "hour" ? hourButtonRef : type === "minute" ? minuteButtonRef : periodButtonRef
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect()
        setDropdownPosition({
          top: rect.bottom + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width
        })
      }
    }

    // 텍스트 입력 완료 처리
    const handleEditComplete = React.useCallback((type: "hour" | "minute" | "period") => {
      if (type === "hour") {
        const num = parseInt(editValue, 10)
        const isValid = format24h 
          ? (!isNaN(num) && num >= 0 && num <= 23)
          : (!isNaN(num) && num >= 1 && num <= 12)
        if (isValid) {
          updateTime(num, selectedMinute, selectedPeriod)
        }
      } else if (type === "minute") {
        const num = parseInt(editValue, 10)
        if (!isNaN(num)) {
          let validMinute = num
          if (interval30) {
            validMinute = num >= 30 ? 30 : 0
          } else {
            validMinute = Math.max(0, Math.min(59, num))
          }
          updateTime(selectedHour, validMinute, selectedPeriod)
        }
      } else {
        if (editValue.toUpperCase() === "AM" || editValue.toUpperCase() === "PM") {
          updateTime(selectedHour, selectedMinute, editValue.toUpperCase() as TimePeriod)
        }
      }

      setEditMode(null)
      setEditValue("")
    }, [editValue, interval30, updateTime, selectedHour, selectedMinute, selectedPeriod, format24h])

    // 외부 클릭 시 드롭다운 닫기
    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as Node
        const isInsideContainer = containerRef.current?.contains(target)
        const isInsideDropdown = dropdownRef.current?.contains(target)
        
        if (!isInsideContainer && !isInsideDropdown) {
          setOpenDropdown(null)
          if (editMode) {
            handleEditComplete(editMode)
          }
        }
      }

      if (openDropdown !== null || editMode !== null) {
        setTimeout(() => {
          document.addEventListener("mousedown", handleClickOutside)
        }, 0)
        return () => document.removeEventListener("mousedown", handleClickOutside)
      }
    }, [openDropdown, editMode, handleEditComplete])

    // 입력 모드일 때 포커스
    React.useEffect(() => {
      if (editMode === "hour" && hourInputRef.current) {
        hourInputRef.current.focus()
        hourInputRef.current.select()
      } else if (editMode === "minute" && minuteInputRef.current) {
        minuteInputRef.current.focus()
        minuteInputRef.current.select()
      }
    }, [editMode])

    const isDisabled = variant === "disabled" || disabled

    const isHourEmpty = selectedHour === null
    const isMinuteEmpty = selectedMinute === null
    const isPeriodEmpty = selectedPeriod === null

    const touchEditTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)
    const touchEditTriggeredRef = React.useRef(false)

    const triggerInlineEdit = (type: "hour" | "minute" | "period") => {
      if (isDisabled) return

      setOpenDropdown(null)
      setEditMode(type)
      if (type === "hour") {
        setEditValue(selectedHour !== null ? selectedHour.toString() : "")
      } else if (type === "minute") {
        setEditValue(selectedMinute !== null ? selectedMinute.toString() : "")
      } else {
        setEditValue(selectedPeriod ?? "")
      }
    }

    const startTouchEdit = (type: "hour" | "minute" | "period") => {
      if (isDisabled) return

      if (touchEditTimeoutRef.current) {
        clearTimeout(touchEditTimeoutRef.current)
      }
      touchEditTriggeredRef.current = false
      touchEditTimeoutRef.current = setTimeout(() => {
        touchEditTimeoutRef.current = null
        touchEditTriggeredRef.current = true
        triggerInlineEdit(type)
      }, 400)
    }

    const endTouchEdit = () => {
      if (touchEditTimeoutRef.current) {
        clearTimeout(touchEditTimeoutRef.current)
        touchEditTimeoutRef.current = null
      }
    }

    React.useEffect(() => {
      if (!value || value.trim() === "") {
        if (ignoreEmptyEffectRef.current) {
          ignoreEmptyEffectRef.current = false
          return
        }
        setSelectedHour(null)
        setSelectedMinute(null)
        setSelectedPeriod(null)
        return
      }

      const parsed = parseTime(value)
      setSelectedHour(parsed.hour)
      setSelectedMinute(parsed.minute)
      setSelectedPeriod(parsed.period)
      ignoreEmptyEffectRef.current = false
    }, [value])

    // Portal로 렌더링할 드롭다운 컴포넌트
    const renderDropdown = () => {
      if (!openDropdown || editMode || isDisabled) return null

      let content: React.ReactNode = null

      if (openDropdown === "hour") {
        content = (
          <>
            {hours.map((h) => (
              <button
                key={h}
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  handleHourSelect(h)
                }}
                className={cn(
                  "w-full px-4 py-2 text-sm text-center transition-colors w-[3.5rem]",
                  "hover:bg-bg-2",
                  selectedHour === h && "bg-brand-bg-3 text-brand"
                )}
              >
                {h.toString().padStart(2, "0")}
              </button>
            ))}
          </>
        )
      } else if (openDropdown === "minute") {
        content = (
          <>
            {minutes.map((m) => (
              <button
                key={m}
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  handleMinuteSelect(m)
                }}
                className={cn(
                  "w-full px-4 py-2 text-sm text-center transition-colors w-[3.5rem]",
                  "hover:bg-bg-2",
                  selectedMinute === m && "bg-brand-bg-3 text-brand"
                )}
              >
                {m.toString().padStart(2, "0")}
              </button>
            ))}
          </>
        )
      } else if (openDropdown === "period") {
        content = (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                handlePeriodSelect("AM")
              }}
              className={cn(
                "w-full px-3 py-2 text-sm text-center transition-colors w-[3rem]",
                "hover:bg-bg-2",
                selectedPeriod === "AM" && "bg-brand-bg-3 text-brand"
              )}
            >
              AM
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                handlePeriodSelect("PM")
              }}
              className={cn(
                "w-full px-3 py-2 text-sm text-center transition-colors w-[3rem]",
                "hover:bg-bg-2",
                selectedPeriod === "PM" && "bg-brand-bg-3 text-brand"
              )}
            >
              PM
            </button>
          </>
        )
      }

      return createPortal(
        <div
          ref={dropdownRef}
          style={{
            position: 'absolute',
            top: `${dropdownPosition.top + 4}px`,
            left: `${dropdownPosition.left}px`,
            width: `${dropdownPosition.width}px`,
            zIndex: 9999
          }}
          className="bg-white border border-subtle rounded-md shadow-lg max-h-48 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {content}
        </div>,
        document.body
      )
    }

    return (
      <div ref={containerRef} className={cn("flex items-center", className)}>
        {/* 기본 time input (숨김) */}
        <input
          type="time"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className="sr-only"
          disabled={isDisabled}
        />

        {/* 시간:분 그룹 */}
        <div className="flex items-center gap-1">
          {/* 시 드롭다운 */}
          <div className="relative">
          <button
            ref={hourButtonRef}
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              if (!isDisabled) {
                if (touchEditTriggeredRef.current) {
                  touchEditTriggeredRef.current = false
                  return
                }
                if (openDropdown === "hour") {
                  setOpenDropdown(null)
                } else {
                  updateDropdownPosition("hour")
                  setOpenDropdown("hour")
                  setEditMode(null)
                }
              }
            }}
            onDoubleClick={() => triggerInlineEdit("hour")}
            onTouchStart={() => startTouchEdit("hour")}
            onTouchEnd={() => endTouchEdit()}
            onTouchCancel={() => endTouchEdit()}
            disabled={isDisabled}
            className={cn(
              "relative h-9 px-4 border-b border-input bg-transparent text-base text-center inline-flex items-center justify-center w-[3.5rem]",
              "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
              "disabled:cursor-not-allowed disabled:opacity-50",
              variant === "filled" && "bg-bg-1 border-subtle",
              variant === "filled" && (isHourEmpty ? "text-subtle" : "text-primary"),
              variant === "disabled" && "bg-bg-3 text-tertiary border-subtle",
              openDropdown === "hour" && editMode !== "hour" && "ring-1 ring-ring"
            )}
          >
            {editMode === "hour" ? (
              <input
                ref={hourInputRef}
                type="text"
                inputMode="numeric"
                enterKeyHint="next"
                value={editValue}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "")
                  setEditValue(val)
                }}
                onBlur={() => handleEditComplete("hour")}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleEditComplete("hour")
                    setTimeout(() => {
                      triggerInlineEdit("minute")
                    }, 100)
                  } else if (e.key === "Escape") {
                    setEditMode(null)
                    setEditValue("")
                  }
                }}
                className={cn(
                  "w-full h-full border-none bg-transparent text-base text-center",
                  "focus-visible:outline-none focus-visible:ring-0",
                  variant === "filled" && "text-primary",
                  variant === "disabled" && "text-tertiary"
                )}
              />
            ) : (
              <span>{isHourEmpty ? "HH" : selectedHour?.toString().padStart(2, "0")}</span>
            )}
          </button>
        </div>

          <span className={cn("text-base", variant === "disabled" ? "text-tertiary" : "text-primary")}>
            :
          </span>

          {/* 분 드롭다운 */}
          <div className="relative">
            <button
              ref={minuteButtonRef}
              type="button"
            onClick={(e) => {
                e.stopPropagation()
                if (!isDisabled) {
                if (touchEditTriggeredRef.current) {
                  touchEditTriggeredRef.current = false
                  return
                }
                  if (openDropdown === "minute") {
                    setOpenDropdown(null)
                  } else {
                    updateDropdownPosition("minute")
                    setOpenDropdown("minute")
                    setEditMode(null)
                  }
                }
              }}
            onDoubleClick={() => triggerInlineEdit("minute")}
            onTouchStart={() => startTouchEdit("minute")}
            onTouchEnd={() => endTouchEdit()}
            onTouchCancel={() => endTouchEdit()}
              disabled={isDisabled}
              className={cn(
                "relative h-9 px-4 border-b border-input bg-transparent text-base text-center inline-flex items-center justify-center w-[3.5rem]",
                "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                "disabled:cursor-not-allowed disabled:opacity-50",
                variant === "filled" && "bg-bg-1 border-subtle",
                variant === "filled" && (isMinuteEmpty ? "text-subtle" : "text-primary"),
                variant === "disabled" && "bg-bg-3 text-tertiary border-subtle",
                openDropdown === "minute" && editMode !== "minute" && "ring-1 ring-ring"
              )}
            >
              {editMode === "minute" ? (
                <input
                  ref={minuteInputRef}
                  type="text"
                  inputMode="numeric"
                  enterKeyHint={format24h ? "done" : "next"}
                  value={editValue}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "")
                    setEditValue(val)
                  }}
                  onBlur={() => handleEditComplete("minute")}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleEditComplete("minute")
                      if (!format24h) {
                        setTimeout(() => {
                          triggerInlineEdit("period")
                        }, 100)
                      }
                    } else if (e.key === "Escape") {
                      setEditMode(null)
                      setEditValue("")
                    }
                  }}
                  className={cn(
                    "w-full h-full border-none bg-transparent text-base text-center",
                    "focus-visible:outline-none focus-visible:ring-0",
                    variant === "filled" && "text-primary",
                    variant === "disabled" && "text-tertiary"
                  )}
                />
              ) : (
                <span>{isMinuteEmpty ? "MM" : selectedMinute?.toString().padStart(2, "0")}</span>
              )}
            </button>
          </div>
        </div>

        {/* AM/PM 드롭다운 - 12시간 형식일 때만 표시 */}
        {!format24h && (
          <div className="relative ml-2">
            <button
              ref={periodButtonRef}
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                if (!isDisabled) {
                  if (touchEditTriggeredRef.current) {
                    touchEditTriggeredRef.current = false
                    return
                  }
                  if (openDropdown === "period") {
                    setOpenDropdown(null)
                  } else {
                    updateDropdownPosition("period")
                    setOpenDropdown("period")
                    setEditMode(null)
                  }
                }
              }}
              onDoubleClick={() => triggerInlineEdit("period")}
              onTouchStart={() => startTouchEdit("period")}
              onTouchEnd={() => endTouchEdit()}
              onTouchCancel={() => endTouchEdit()}
              disabled={isDisabled}
              className={cn(
                "relative h-9 px-3 border-b border-input bg-transparent text-base text-center inline-flex items-center justify-center w-[3rem]",
                "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                "disabled:cursor-not-allowed disabled:opacity-50",
                variant === "filled" && "bg-bg-1 border-subtle",
                variant === "filled" && (isPeriodEmpty ? "text-subtle" : "text-primary"),
                variant === "disabled" && "bg-bg-3 text-tertiary border-subtle",
                openDropdown === "period" && editMode !== "period" && "ring-1 ring-ring"
              )}
            >
              {editMode === "period" ? (
                <input
                  type="text"
                  inputMode="text"
                  enterKeyHint="done"
                  value={editValue}
                  onChange={(e) => {
                    const val = e.target.value.toUpperCase().replace(/[^AMP]/g, "")
                    if (val.length <= 2) {
                      setEditValue(val)
                    }
                  }}
                  onBlur={() => handleEditComplete("period")}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleEditComplete("period")
                    } else if (e.key === "Escape") {
                      setEditMode(null)
                      setEditValue("")
                    }
                  }}
                  className={cn(
                    "w-full h-full border-none bg-transparent text-base text-center uppercase",
                    "focus-visible:outline-none focus-visible:ring-0",
                    variant === "filled" && "text-primary",
                    variant === "disabled" && "text-tertiary"
                  )}
                />
              ) : (
                <span>{isPeriodEmpty ? "--" : selectedPeriod}</span>
              )}
            </button>
          </div>
        )}

        {/* Portal로 드롭다운 렌더링 */}
        {renderDropdown()}
      </div>
    )
  }
)
TimeInput.displayName = "TimeInput"

export { TimeInput }
