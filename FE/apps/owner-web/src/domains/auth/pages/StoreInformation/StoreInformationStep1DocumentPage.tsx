// Todo: 사업자 등록증 업로드 기능 구현 - 사진 넣으면 바로 OCR 연결

import { useEffect, useRef, useState, type DragEvent } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowUpTrayIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Modal } from "@/components/ui/modal";
import { Button } from "@shared/src/components/Button";
import { cn } from "@/lib/utils";
import { storeInformationApi } from "../../apis/storeInformation.api";
import { useOwnerStore } from "@/store/useOwnerStore";

const ACCEPTED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".pdf", ".tiff"] as const;
const DISPLAY_EXTENSIONS = [".jpg", ".png", ".pdf", ".tiff"].join(", ");
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

function formatFileSize(size: number) {
  if (size >= 1024 * 1024) {
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  }
  if (size >= 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }
  return `${size} B`;
}

export default function StoreInformationStep1DocumentPage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();

  const accessToken = useOwnerStore((state) => state.accessToken);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  useEffect(() => {
    if (!isUploading) return

    const { style } = document.body
    const previousOverflow = style.overflow
    const previousPosition = style.position
    const previousWidth = style.width
    const previousTop = style.top
    const scrollY = window.scrollY

    style.overflow = "hidden"
    style.position = "fixed"
    style.width = "100%"
    style.top = `-${scrollY}px`

    return () => {
      style.overflow = previousOverflow
      style.position = previousPosition
      style.width = previousWidth
      style.top = previousTop
      window.scrollTo(0, scrollY)
    }
  }, [isUploading])

  const validateFile = (file: File) => {
    const isAcceptableExtension = ACCEPTED_EXTENSIONS.some((extension) =>
      file.name.toLowerCase().endsWith(extension),
    );

    if (!isAcceptableExtension) {
      return "지원하지 않는 파일 형식입니다. (.jpg, .png, .pdf, .tiff)";
    }

    if (file.size > MAX_FILE_SIZE) {
      return "파일 용량은 최대 5MB까지 업로드할 수 있습니다.";
    }

    return null;
  };

  const handleFileSelect = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) {
      return;
    }

    const file = fileList[0];
    const error = validateFile(file);

    if (error) {
      setSelectedFile(null);
      setErrorMessage(error);
      return;
    }

    if (!accessToken) {
      setSelectedFile(null);
      setErrorMessage("인증이 필요합니다. 다시 로그인한 후 시도해주세요.");
      return;
    }

    setSelectedFile(file);
    setErrorMessage(null);
    void handleUpload(file, accessToken);
  };

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragActive(false);
    handleFileSelect(event.dataTransfer.files);
  };

  const handleUpload = async (file: File, token: string) => {
    setIsUploading(true);
    setErrorMessage(null);

    try {
      const businessLicense = await storeInformationApi.uploadBusinessLicense(file, token);
      navigate("/owner/store-information/step1-input", {
        replace: true,
        state: {
          businessLicense,
        },
      });
    } catch (error) {
      console.error("⚠️ 사업자등록증 업로드 실패:", error);
      const message =
        error instanceof Error
          ? error.message === "인증 실패"
            ? "인증이 필요합니다. 다시 로그인한 후 시도해주세요."
            : error.message
          : "사업자 등록증 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.";
      setErrorMessage(message);
      setSelectedFile(null);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <section className="relative mx-auto flex w-full max-w-[412px] flex-col gap-6 px-4 pb-32 pt-10 text-center">
        <div className="flex w-full flex-col items-stretch gap-4">
        <h3 className="h5-b text-primary">사업자 등록증 업로드</h3>

        <label
          htmlFor="business-registration"
          className={cn(
            "flex w-full cursor-pointer flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-stroke-3 bg-bg-1 px-6 py-8 transition-colors duration-200",
            isDragActive && "border-brand bg-brand-bg-1",
          )}
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragActive(true);
          }}
          onDragLeave={(event) => {
            event.preventDefault();
            setIsDragActive(false);
          }}
          onDrop={handleDrop}
        >
          <div className="rounded-lg border border-stroke-2 bg-bg-0 p-3">
            <ArrowUpTrayIcon className="h-6 w-6 text-secondary" />
          </div>

          <div className="flex flex-col items-center gap-1">
            <p className="p1 text-secondary">{DISPLAY_EXTENSIONS} · Max 5MB</p>
            <p className="p3 text-tertiary">
              파일을 클릭하거나 드래그&nbsp;앤&nbsp;드롭으로 업로드하세요.
            </p>
          </div>

          <input
            ref={fileInputRef}
            id="business-registration"
            type="file"
            accept={ACCEPTED_EXTENSIONS.join(",")}
            className="sr-only"
            onChange={(event) => handleFileSelect(event.target.files)}
          />
        </label>

        {selectedFile && (
          <div className="flex w-full items-center justify-between rounded-lg border border-stroke-3 bg-bg-1 px-4 py-3 text-left">
            <div className="flex flex-col">
              <span className="p2-b text-primary">{selectedFile.name}</span>
              <span className="caption1 text-secondary">
                {formatFileSize(selectedFile.size)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                btnStyle="outlined-default"
                size="default"
                onClick={() => fileInputRef.current?.click()}
              >
                다시 선택
              </Button>
              <button
                type="button"
                aria-label="선택한 파일 제거"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-transparent text-secondary transition-colors hover:border-stroke-3 hover:text-primary"
                onClick={() => {
                  setSelectedFile(null);
                  setErrorMessage(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                  }
                }}
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {errorMessage && (
          <p className="w-full rounded-md bg-error/10 px-4 py-2 text-left p3 text-error">
            {errorMessage}
          </p>
        )}
      </div>

        <div className="flex items-center gap-2">
          <p className="p2 text-secondary">업로드 없이 입력하고 싶으시다면?</p>
          <a href="/owner/store-information/step1-input" className="p2-b text-brand hover:underline">
              직접입력
          </a>
        </div>
      </section>

      <Modal
        open={isUploading}
        onClose={() => {}}
        title="인식 중..."
        detail="잠시만 기다려주세요."
        icon="loading"
        iconShow
        xButton={false}
        xButtonShow={false}
        buttonShow={false}
        className="w-[288px]"
      />
    </>
  );
}


