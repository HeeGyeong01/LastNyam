import React from 'react';
import { Button } from '@shared/components/Button';

interface AlertModalProps {
  isOpen: boolean;
  mainText: string;
  subText?: string;
  icon?: React.ReactNode;
  buttonText?: string;
  onConfirm?: () => void;
  onClose?: () => void;
}

export default function AlertModal({
  isOpen,
  mainText,
  subText,
  icon,
  buttonText = '확인',
  onConfirm,
  onClose,
}: AlertModalProps) {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm?.();
    onClose?.();
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose?.();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] max-w-[500px] mx-auto"
      onClick={handleOverlayClick}
    >
      <div
        className="w-80 p-7 bg-white rounded-2xl flex flex-col items-center gap-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-full flex flex-col items-center gap-1">
          {/* 아이콘 영역 */}
          {icon && (
            <div className="w-16 h-16 flex items-center justify-center mb-2">
              {icon}
            </div>
          )}

          {/* 텍스트 영역 */}
          <div className="w-full pt-2 flex flex-col items-center gap-1">
            <div className="text-center text-primary h5-b">{mainText}</div>
            {subText && (
              <div className="w-full text-center text-secondary p2">{subText}</div>
            )}
          </div>
        </div>

        {/* 버튼 */}
        <Button
          btnStyle="filled-red"
          size="lg"
          onClick={handleConfirm}
          className="w-full"
        >
          {buttonText}
        </Button>
      </div>
    </div>
  );
}

