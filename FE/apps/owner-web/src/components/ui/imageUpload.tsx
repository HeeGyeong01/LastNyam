import * as React from "react"
import { Camera } from "lucide-react"

import { ownerFileApi, type OwnerFileType } from "@/domains/common/apis/file.api"
import { cn } from "@/lib/utils"
import { useOwnerStore } from "@/store/useOwnerStore"

import { Spinner } from "./spinner"

export interface UploadedFileInfo {
  fileUrl: string
  fileKey: string
  bucket: string
  originalFileName: string
  fileType: OwnerFileType
  size: number
}

type ImageUploadValue = UploadedFileInfo | string | null

export interface ImageUploadProps {
  value?: ImageUploadValue
  onChange?: (file: UploadedFileInfo | null) => void
  onPreviewChange?: (previewUrl: string | null) => void
  className?: string
  variant?: "filled"
  accept?: string
  maxSize?: number
  fileType: OwnerFileType
}

const DEFAULT_ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png"]
const DEFAULT_ACCEPT = DEFAULT_ALLOWED_EXTENSIONS.map((ext) => `.${ext}`).join(",")
const DEFAULT_MAX_SIZE = 10 * 1024 * 1024 // 10MB

const ImageUpload = React.forwardRef<HTMLInputElement, ImageUploadProps>(
  (
    {
      value = null,
      onChange,
      onPreviewChange,
      className,
      variant = "filled",
      accept = DEFAULT_ACCEPT,
      maxSize = DEFAULT_MAX_SIZE,
      fileType,
    },
    ref
  ) => {
    const [preview, setPreview] = React.useState<string | null>(null)
    const [isDragOver, setIsDragOver] = React.useState(false)
    const [isUploading, setIsUploading] = React.useState(false)
    const fileInputRef = React.useRef<HTMLInputElement>(null)
    const tempObjectUrlRef = React.useRef<string | null>(null)
    const accessToken = useOwnerStore((state) => state.accessToken)

    React.useImperativeHandle(ref, () => fileInputRef.current as HTMLInputElement)

    const getPreviewFromValue = React.useCallback(
      (input: ImageUploadValue): string | null => {
        if (!input) {
          return null
        }

        if (typeof input === "string") {
          return input
        }

        return input.fileUrl ?? null
      },
      []
    )

    React.useEffect(() => {
      if (isUploading) {
        return
      }

      const nextPreview = getPreviewFromValue(value)
      setPreview(nextPreview)
      onPreviewChange?.(nextPreview)
    }, [value, onPreviewChange, isUploading, getPreviewFromValue])

    React.useEffect(() => {
      return () => {
        if (tempObjectUrlRef.current) {
          URL.revokeObjectURL(tempObjectUrlRef.current)
          tempObjectUrlRef.current = null
        }
      }
    }, [])

    const resetInput = () => {
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }

    const validateFile = (file: File) => {
      if (file.size > maxSize) {
        alert(
          `파일 크기가 제한을 초과했습니다. 최대 크기: ${maxSize.toLocaleString()} bytes`
        )
        return false
      }

      if (!file.type.startsWith("image/")) {
        alert("이미지 파일만 업로드 가능합니다.")
        return false
      }

      const extension = file.name.split(".").pop()?.toLowerCase() ?? ""
      if (!DEFAULT_ALLOWED_EXTENSIONS.includes(extension)) {
        alert("지원하지 않는 파일 형식입니다. 허용된 형식: jpg, jpeg, png")
        return false
      }

      return true
    }

    const uploadToS3 = async (file: File): Promise<UploadedFileInfo> => {
      if (!accessToken) {
        throw new Error("이미지 업로드를 위해 로그인이 필요합니다.")
      }

      const presigned = await ownerFileApi.createUploadUrl(
        {
          fileName: file.name,
          fileSize: file.size,
          fileType,
        },
        accessToken
      )

      const method = (presigned.httpMethod ?? "PUT").toUpperCase()
      const uploadResponse = await fetch(presigned.uploadUrl, {
        method,
        headers: {
          "Content-Type": file.type,
        },
        body: file,
      })

      if (!uploadResponse.ok) {
        throw new Error("S3 업로드에 실패했습니다. 잠시 후 다시 시도해주세요.")
      }

      return {
        fileUrl: presigned.fileUrl,
        fileKey: presigned.fileKey,
        bucket: presigned.bucket,
        originalFileName: file.name,
        fileType,
        size: file.size,
      }
    }

    const handleFileChange = async (file: File | null) => {
      if (!file || isUploading) {
        return
      }

      if (!validateFile(file)) {
        resetInput()
        return
      }

      setIsUploading(true)

      if (tempObjectUrlRef.current) {
        URL.revokeObjectURL(tempObjectUrlRef.current)
        tempObjectUrlRef.current = null
      }

      const tempUrl = URL.createObjectURL(file)
      tempObjectUrlRef.current = tempUrl
      setPreview(tempUrl)
      onPreviewChange?.(tempUrl)

      try {
        const uploaded = await uploadToS3(file)

        setPreview(uploaded.fileUrl)
        onPreviewChange?.(uploaded.fileUrl)
        onChange?.(uploaded)
      } catch (error) {
        console.error("이미지 업로드 실패:", error)
        const message =
          error instanceof Error
            ? error.message
            : "이미지 업로드 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요."
        alert(message)

        const fallbackPreview = getPreviewFromValue(value)
        setPreview(fallbackPreview)
        onPreviewChange?.(fallbackPreview)
      } finally {
        setIsUploading(false)
        if (tempObjectUrlRef.current) {
          URL.revokeObjectURL(tempObjectUrlRef.current)
          tempObjectUrlRef.current = null
        }
        resetInput()
      }
    }

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0] ?? null
      void handleFileChange(file)
    }

    const handleClick = () => {
      if (isUploading) {
        return
      }
      fileInputRef.current?.click()
    }

    const handleDragOver = (event: React.DragEvent) => {
      event.preventDefault()
      event.stopPropagation()
      if (isUploading) {
        return
      }
      setIsDragOver(true)
    }

    const handleDragLeave = (event: React.DragEvent) => {
      event.preventDefault()
      event.stopPropagation()
      setIsDragOver(false)
    }

    const handleDrop = (event: React.DragEvent) => {
      event.preventDefault()
      event.stopPropagation()
      setIsDragOver(false)

      if (isUploading) {
        return
      }

      const file = event.dataTransfer.files?.[0] ?? null
      void handleFileChange(file)
    }

    const variantStyles = {
      filled: "border-stroke-2",
    }

    const isInteractiveDisabled = isUploading

    return (
      <div className={cn("w-full flex flex-col items-center", className)}>
        <div
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          aria-busy={isUploading}
          className={cn(
            "relative w-25 h-25 border-2 border-dashed rounded-lg transition-colors cursor-pointer",
            "flex flex-col items-center justify-center overflow-hidden",
            preview ? "p-0" : "py-5",
            variantStyles[variant],
            isDragOver && "border-brand bg-brand-bg-1",
            !isDragOver && !preview && "hover:border-primary",
            isInteractiveDisabled && "pointer-events-none opacity-80"
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
              <Camera className="w-10 h-10 text-subtle" />
              <span className="caption2-b mt-2 text-subtle">이미지올리기</span>
            </>
          )}

          {isUploading && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/40 text-white">
              <Spinner className="w-6 h-6" />
              <span className="caption2-b mt-2">업로드 중...</span>
            </div>
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

