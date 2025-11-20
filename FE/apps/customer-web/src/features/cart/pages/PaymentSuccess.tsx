import { useNavigate } from 'react-router-dom';
import { Button } from '@shared/components/Button';
import CatImage from '@/shared/assets/lastnyam-cat.png';
import { HomeHeader } from '@/shared/components';
export default function PaymentSuccess() {
  const navigate = useNavigate();

  return (
    <div className="h-full flex flex-col">
    <HomeHeader />
    <div className="flex-1 flex items-center justify-center p-4 py-24">
      <div className="bg-bg-0 rounded-3xl p-8 flex flex-col justify-around h-full min-h-[460px] items-center max-w-md w-full">
        {/* 제목 */}
        <h1 className="text-brand font-kr-h2 kr-h2 leading-8">
          주문이 완료되었습니다
        </h1>

        {/* 고양이 이미지 */}
        <div className="bg-brand-bg-3 rounded-full w-48 h-48 flex items-center justify-center overflow-hidden relative">
          <img 
            src={CatImage} 
            alt="주문 완료되어 행복한 고양이, 라스트냥" 
            />
        </div>

        {/* QR 안내 */}
        <div className="flex flex-col gap-3 w-full">
          <p className="p1-b text-center text-primary">
            음식 수령 시 사장님께 QR을 제시해 주세요
          </p>
          <p className="p3 text-center text-primary">
            QR은 주문내역에서 확인할 수 있습니다
          </p>
        </div>

      <div className="flex flex-col gap-4 w-full">
        {/* 버튼 그룹 */}
        <div className="flex flex-row gap-1.5 w-full">
          <Button
            btnStyle="filled-gray"
            size="lg"
            className="flex-1"
            onClick={() => navigate('/')}
            >
            확인
          </Button>
          <Button
            btnStyle="filled-red"
            size="lg"
            className="flex-1"
            onClick={() => navigate('/order-list')}
            >
            주문내역 보기
          </Button>
        </div>
        {/* 경고 문구 */}
        <p className="p3-b text-brand text-center">
          픽업 마감시간 이후 주문이 취소되며, 환불이 불가합니다
        </p>
      </div>

      </div>
    </div>
  </div>
  );
}

