import * as React from "react"
import { cn } from "@/lib/utils"

type TimePeriod = "AM" | "PM"

export interface TimeInputProps {
  value?: string // HH:MM 형식 (24시간)
  onChange?: (value: string) => void // HH:MM 형식으로 반환
  variant?: "filled" | "disabled"
  interval30?: boolean // 30분 단위로만 입력 가능
  className?: string
  disabled?: boolean
}

const TimeInput = React.forwardRef<HTMLDivElement, TimeInputProps>(
  ({ value = "", onChange, variant = "filled", interval30 = false, className, disabled }, ref) => {
    const [openDropdown, setOpenDropdown] = React.useState<"hour" | "minute" | "period" | null>(null)
    const [editMode, setEditMode] = React.useState<"hour" | "minute" | "period" | null>(null)
    const [editValue, setEditValue] = React.useState("")
    
    const containerRef = React.useRef<HTMLDivElement>(null)
    const hourInputRef = React.useRef<HTMLInputElement>(null)
    const minuteInputRef = React.useRef<HTMLInputElement>(null)
    
    // 외부 ref와 내부 ref 연결
    React.useImperativeHandle(ref, () => containerRef.current as HTMLDivElement)

    // value를 파싱하여 시, 분, AM/PM으로 분리
    const parseTime = (timeStr: string) => {
      if (!timeStr || !timeStr.includes(":")) {
        return { hour: 12, minute: 0, period: "AM" as TimePeriod }
      }
      
      const [hourStr, minuteStr] = timeStr.split(":")
      const hour24 = parseInt(hourStr, 10)
      const minute = parseInt(minuteStr, 10)
      
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

    const isEmpty = !value || value.trim() === ""
    const { hour, minute, period } = parseTime(value)
    
    // 시간, 분 옵션 생성
    const hours = Array.from({ length: 12 }, (_, i) => i + 1)
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

    const handleTimeChange = React.useCallback((newHour: number, newMinute: number, newPeriod: TimePeriod) => {
      const timeString = to24Hour(newHour, newMinute, newPeriod)
      onChange?.(timeString)
    }, [onChange])

    const handleHourSelect = (selectedHour: number) => {
      handleTimeChange(selectedHour, minute, period)
      setOpenDropdown(null)
    }

    const handleMinuteSelect = (selectedMinute: number) => {
      handleTimeChange(hour, selectedMinute, period)
      setOpenDropdown(null)
    }

    const handlePeriodSelect = (selectedPeriod: TimePeriod) => {
      handleTimeChange(hour, minute, selectedPeriod)
      setOpenDropdown(null)
    }

    // 더블 클릭 핸들러
    const handleDoubleClick = (type: "hour" | "minute" | "period") => {
      if (isDisabled) return
      
      setEditMode(type)
      if (type === "hour") {
        setEditValue(hour.toString())
      } else if (type === "minute") {
        setEditValue(minute.toString())
      } else {
        setEditValue(period)
      }
    }

    // 텍스트 입력 완료 처리
    const handleEditComplete = React.useCallback((type: "hour" | "minute" | "period") => {
      // 항상 최신 value를 파싱하여 사용
      const currentTime = parseTime(value)
      const { hour: currentHour, minute: currentMinute, period: currentPeriod } = currentTime
      
      if (type === "hour") {
        const num = parseInt(editValue, 10)
        if (!isNaN(num) && num >= 1 && num <= 12) {
          handleTimeChange(num, currentMinute, currentPeriod)
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
          handleTimeChange(currentHour, validMinute, currentPeriod)
        }
      } else {
        if (editValue.toUpperCase() === "AM" || editValue.toUpperCase() === "PM") {
          handleTimeChange(currentHour, currentMinute, editValue.toUpperCase() as TimePeriod)
        }
      }
      
      setEditMode(null)
      setEditValue("")
    }, [value, editValue, interval30, handleTimeChange])

    // 외부 클릭 시 드롭다운 닫기
    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
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
          {editMode === "hour" ? (
            <input
              ref={hourInputRef}
              type="text"
              value={editValue}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "")
                setEditValue(val)
              }}
              onBlur={() => handleEditComplete("hour")}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleEditComplete("hour")
                } else if (e.key === "Escape") {
                  setEditMode(null)
                  setEditValue("")
                }
              }}
              className={cn(
                "h-9 px-3 border-b border-input bg-transparent text-base text-center inline-block min-w-[3.5rem]",
                "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                variant === "filled" && "bg-bg-1 text-primary border-subtle",
                variant === "disabled" && "bg-bg-3 text-tertiary border-subtle"
              )}
            />
          ) : (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  if (!isDisabled) {
                    setOpenDropdown(openDropdown === "hour" ? null : "hour")
                  }
                }}
                onDoubleClick={() => handleDoubleClick("hour")}
                disabled={isDisabled}
                className={cn(
                  "h-9 px-4 border-b border-input bg-transparent text-base text-center inline-flex items-center justify-center min-w-[3.5rem]",
                  "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                  "disabled:cursor-not-allowed disabled:opacity-50",
                  variant === "filled" && "bg-bg-1 border-subtle",
                  variant === "filled" && isEmpty && "text-subtle",
                  variant === "filled" && !isEmpty && "text-primary",
                  variant === "disabled" && "bg-bg-3 text-tertiary border-subtle",
                  openDropdown === "hour" && "ring-1 ring-ring"
                )}
              >
                {isEmpty ? "00" : hour.toString().padStart(2, "0")}
              </button>
              
              {openDropdown === "hour" && !isDisabled && (
                <div
                className="absolute left-0 z-50 mt-1 bg-white border border-subtle rounded-md shadow-lg max-h-48 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                onClick={(e) => e.stopPropagation()}
                >
                  {hours.map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleHourSelect(h)
                      }}
                      className={cn(
                        "w-full px-4 py-2 text-sm text-center transition-colors min-w-[3.5rem]",
                        "hover:bg-bg-2",
                        hour === h && "bg-brand-bg-3 text-brand"
                      )}
                    >
                      {h.toString().padStart(2, "0")}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

          <span className={cn("text-base", variant === "disabled" ? "text-tertiary" : "text-primary")}>
            :
          </span>

          {/* 분 드롭다운 */}
          <div className="relative">
          {editMode === "minute" ? (
            <input
              ref={minuteInputRef}
              type="text"
              value={editValue}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "")
                setEditValue(val)
              }}
              onBlur={() => handleEditComplete("minute")}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleEditComplete("minute")
                } else if (e.key === "Escape") {
                  setEditMode(null)
                  setEditValue("")
                }
              }}
              className={cn(
                "h-9 px-3 border-b border-input bg-transparent text-base text-center inline-block min-w-[3.5rem]",
                "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                variant === "filled" && "bg-bg-1 text-primary border-subtle",
                variant === "disabled" && "bg-bg-3 text-tertiary border-subtle"
              )}
            />
          ) : (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  if (!isDisabled) {
                    setOpenDropdown(openDropdown === "minute" ? null : "minute")
                  }
                }}
                onDoubleClick={() => handleDoubleClick("minute")}
                disabled={isDisabled}
                className={cn(
                  "h-9 px-4 border-b border-input bg-transparent text-base text-center inline-flex items-center justify-center min-w-[3.5rem]",
                  "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                  "disabled:cursor-not-allowed disabled:opacity-50",
                  variant === "filled" && "bg-bg-1 border-subtle",
                  variant === "filled" && isEmpty && "text-subtle",
                  variant === "filled" && !isEmpty && "text-primary",
                  variant === "disabled" && "bg-bg-3 text-tertiary border-subtle",
                  openDropdown === "minute" && "ring-1 ring-ring"
                )}
              >
                {isEmpty ? "00" : minute.toString().padStart(2, "0")}
              </button>
              
              {openDropdown === "minute" && !isDisabled && (
                <div
                className="absolute left-0 rounded-md z-50 mt-1 bg-white border border-subtle shadow-lg max-h-48 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                onClick={(e) => e.stopPropagation()}
                >
                  {minutes.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleMinuteSelect(m)
                      }}
                      className={cn(
                        "w-full px-4 py-2 text-sm text-center transition-colors min-w-[3.5rem]",
                        "hover:bg-bg-2",
                        minute === m && "bg-brand-bg-3 text-brand"
                      )}
                    >
                      {m.toString().padStart(2, "0")}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
          </div>
        </div>

        {/* AM/PM 드롭다운 */}
        <div className="relative ml-2">
          {editMode === "period" ? (
            <input
              type="text"
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
                "h-9 px-3 border-b border-input bg-transparent text-base text-center inline-block min-w-[3rem]",
                "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                variant === "filled" && "bg-bg-1 text-primary border-subtle",
                variant === "disabled" && "bg-bg-3 text-tertiary border-subtle"
              )}
            />
          ) : (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  if (!isDisabled) {
                    setOpenDropdown(openDropdown === "period" ? null : "period")
                  }
                }}
                onDoubleClick={() => handleDoubleClick("period")}
                disabled={isDisabled}
                className={cn(
                  "h-9 px-3 border-b border-input bg-transparent text-base text-center inline-flex items-center justify-center min-w-[3rem]",
                  "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                  "disabled:cursor-not-allowed disabled:opacity-50",
                  variant === "filled" && "bg-bg-1 text-primary border-subtle",
                  variant === "disabled" && "bg-bg-3 text-tertiary border-subtle",
                  openDropdown === "period" && "ring-1 ring-ring"
                )}
              >
                {period}
              </button>
              
              {openDropdown === "period" && !isDisabled && (
                <div
                  className="absolute left-0 z-50 mt-1 bg-white border border-subtle rounded-md shadow-lg"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      handlePeriodSelect("AM")
                    }}
                    className={cn(
                      "w-full px-3 py-2 text-sm text-center transition-colors min-w-[3rem]",
                      "hover:bg-bg-2",
                      period === "AM" && "bg-brand-bg-3 text-brand"
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
                      "w-full px-3 py-2 text-sm text-center transition-colors min-w-[3rem]",
                      "hover:bg-bg-2",
                      period === "PM" && "bg-brand-bg-3 text-brand"
                    )}
                  >
                    PM
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    )
  }
)
TimeInput.displayName = "TimeInput"

export { TimeInput }
