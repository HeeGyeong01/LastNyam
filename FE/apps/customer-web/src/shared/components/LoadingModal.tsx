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
      <div className="bg-bg-0 w-80 rounded-2xl flex flex-col items-center mx-4 p-6 py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand-subtle border-t-transparent"></div>
          <div className="text-center mt-4">
            <div className="h5-b text-primary">{title}</div>
            <div className="p2 text-tertiary">{message}</div>
          </div>
      </div>
    </div>
  );
}

