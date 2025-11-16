interface LoadingModalProps {
  isOpen: boolean;
  title?: string;
  message?: string;
}

export default function LoadingModal({
  isOpen,
  title = '처리 중입니다',
  message = '잠시만 기다려주세요',
}: LoadingModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] max-w-[500px] mx-auto">
      <div className="bg-white rounded-2xl p-6">
        <div className="w-full flex flex-col items-center gap-4 py-8">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-subtle border-t-transparent"></div>
          <div className="text-center mt-4">
            <div className="h5-b text-primary">{title}</div>
            <div className="p2 text-tertiary">{message}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

