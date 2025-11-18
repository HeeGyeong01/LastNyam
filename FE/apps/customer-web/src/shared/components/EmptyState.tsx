import catImage from '@/shared/assets/lastnyam-cat.png';

interface EmptyStateProps {
  message?: string;
  imageUrl?: string;
  imageAlt?: string;
  className?: string;
}

export default function EmptyState({
  message = '아무것도 없다냥…🐾',
  imageUrl = catImage,
  imageAlt = '라스트냥',
  className = '',
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 ${className}`}>
      {/* 메시지 */}
      <p className="text-center text-secondary p2 mb-4">
        {message}
      </p>

      {/* 고양이 이미지 */}
      {imageUrl && (
        <img 
          src={imageUrl} 
          alt={imageAlt} 
          className="w-24 h-24 object-contain"
        />
      )}
    </div>
  );
}

