import React from 'react';
import { Button } from '@shared/components/Button';

interface QrModalProps {
  isOpen: boolean;
  qrImageUrl: string | null;
  onClose: () => void;
}

export default function QrModal({ isOpen, qrImageUrl, onClose }: QrModalProps) {
  if (!isOpen || !qrImageUrl) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] max-w-[500px] mx-auto"
      onClick={handleOverlayClick}
    >
      <div
        className="w-[340px] p-7 bg-white rounded-2xl flex flex-col items-center gap-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="relative w-full h-full flex flex-col items-center justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 안내말 */}
          <div className="w-full flex flex-col items-center justify-center gap-2">
            <div className="p1-b">음식 수령 시 사장님께 QR을 제시해 주세요</div>
            <div className="p3">픽업 마감시간 이후에는 주문이 취소되며, 환불이 불가합니다</div>
          </div>

          {/* QR 이미지 */}
          <div className="w-full h-full flex items-center justify-center pb-16">
            <img src={qrImageUrl} alt="QR 코드" className="max-w-full max-h-full object-contain" />
          </div>

          {/* 닫기 버튼 */}
          <Button
            btnStyle="filled-gray"
            size="lg"
            onClick={onClose}
            className="absolute bottom-4 left-2 right-2 w-auto max-w-xs mx-auto"
          >
            닫기
          </Button>
        </div>
      </div>
    </div>
  );
}
