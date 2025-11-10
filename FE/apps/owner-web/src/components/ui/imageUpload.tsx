import * as React from "react"
import { Camera } from "lucide-react"
import { cn } from "@/lib/utils"

export interface ImageUploadProps {
  value?: string | File | null // 이미지 URL 또는 File 객체
  onChange?: (file: File | null) => void
  onPreviewChange?: (previewUrl: string | null) => void
  className?: string
  variant?: "filled"
  accept?: string
  maxSize?: number // 최대 파일 크기 (bytes)
}

const ImageUpload = React.forwardRef<HTMLInputElement, ImageUploadProps>(
  (
    {
      value,
      onChange,
      onPreviewChange,
      className,
      variant = "filled",
      accept = "image/*",
      maxSize = 5 * 1024 * 1024, // 기본 5MB
    },
    ref
  ) => {
    const [preview, setPreview] = React.useState<string | null>(null)
    const [isDragOver, setIsDragOver] = React.useState(false)
    const fileInputRef = React.useRef<HTMLInputElement>(null)

    // 외부 ref와 내부 ref 연결
    React.useImperativeHandle(ref, () => fileInputRef.current as HTMLInputElement)

    // value가 변경될 때 preview 업데이트
    React.useEffect(() => {
      if (value instanceof File) {
        const reader = new FileReader()
        reader.onloadend = () => {
          const result = reader.result as string
          setPreview(result)
          onPreviewChange?.(result)
        }
        reader.readAsDataURL(value)
      } else if (typeof value === "string") {
        setPreview(value)
        onPreviewChange?.(value)
      } else {
        setPreview(null)
        onPreviewChange?.(null)
      }
    }, [value, onPreviewChange])

    const handleFileChange = (file: File | null) => {
      if (file) {
        // 파일 크기 체크
        if (file.size > maxSize) {
          alert(`파일 크기는 ${(maxSize / 1024 / 1024).toFixed(0)}MB 이하여야 합니다.`)
          return
        }

        // 이미지 파일인지 확인
        if (!file.type.startsWith("image/")) {
          alert("이미지 파일만 업로드 가능합니다.")
          return
        }

        onChange?.(file)
      } else {
        onChange?.(null)
      }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] || null
      handleFileChange(file)
      // 같은 파일을 다시 선택할 수 있도록
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }

    const handleClick = () => {
      if (fileInputRef.current) {
        fileInputRef.current.click()
      }
    }

    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragOver(true)
    }

    const handleDragLeave = (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragOver(false)
    }

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragOver(false)

      const file = e.dataTransfer.files?.[0] || null
      handleFileChange(file)
    }

    const variantStyles = {
      filled: "border-stroke-2",
    }

    return (
      <div className={cn("w-full flex flex-col items-center", className)}>
        <div
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "w-25 h-25 border-2 border-dashed rounded-lg transition-colors cursor-pointer",
            "flex flex-col items-center justify-center",
            preview ? "p-0" : "py-5",
            variantStyles[variant],
            isDragOver && "border-brand bg-brand-bg-1",
            !isDragOver && !preview && "hover:border-primary"
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleInputChange}
            className="hidden"
          />

          {preview ? (
            <img
              src={preview}
              alt="미리보기"
              className="w-full h-full object-cover rounded-md"
            />
          ) : (
            <>
              <Camera
                className="w-10 h-10 text-subtle"
              />
              <span className="caption2-b mt-2 text-subtle">
                이미지올리기
              </span>
            </>
          )}
        </div>

        <div className="mt-4 space-y-1 text-center">
          <p className="caption2-b text-subtle">
            상세 페이지에서는 확대되어 노출되어요.
          </p>
          <p className="caption2-b text-subtle">
            한쪽으로 치우쳐지지 않은 사진을 등록해주세요.
          </p>
        </div>
      </div>
    )
  }
)
ImageUpload.displayName = "ImageUpload"

export { ImageUpload }

