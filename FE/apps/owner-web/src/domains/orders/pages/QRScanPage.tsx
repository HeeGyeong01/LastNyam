import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Scanner } from "@yudiel/react-qr-scanner";
import { Loader2 } from "lucide-react";
import { Button } from "@shared/src/components/Button";

export default function QRScanPage() {
  const navigate = useNavigate();
  const [scanning, setScanning] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [scannedData, setScannedData] = useState<string>("");
  const timerRef = useRef<number | null>(null);

  const handleScan = (result: any) => {
    if (result && result[0] && scanning) {
      console.log("QR 코드 스캔 결과:", result[0].rawValue);
      setScanning(false);
      setScannedData(result[0].rawValue);
      setShowSuccessModal(true);

      if (!result[0].rawValue.startsWith("/owner/orders/receipt-confirm")) {
        setShowSuccessModal(false);
        setScanning(true);
        return;
      }

      // 5초 후에 자동으로 스캔 모드로 복귀
      timerRef.current = setTimeout(() => {
        setShowSuccessModal(false);
        setScanning(true);
      }, 5000);
    }
  };

  const handleViewOrderDetail = () => {
    // 타이머 클리어
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setShowSuccessModal(false);
    navigate(scannedData);
  };

  const handleError = () => {
    setError("카메라를 사용할 수 없습니다.");
  };

  return (
    <div className="relative w-full h-full bg-black">
      {/* 카메라 화면 */}
      <div className="absolute inset-0">
        <Scanner
          onScan={handleScan}
          onError={handleError}
          constraints={{
            facingMode: "environment",
          }}
          styles={{
            container: {
              width: "100%",
              height: "100%",
            },
            video: {
              width: "100%",
              height: "100%",
              objectFit: "cover",
            },
          }}
        />
      </div>
      {/* 중앙 안내 텍스트 */}
      <div className="absolute top-40 left-0 right-0 text-center z-20">
        <h2 className="text-white h4-b drop-shadow-lg">
          수령 확인용 QR을 찍어주세요
        </h2>
      </div>

      {/* 하단 상태 표시 */}
      {!showSuccessModal && (
        <div className="absolute bottom-20 left-0 right-0 z-20">
          <div className="bg-[#0F172A] py-3 flex items-center justify-center gap-2.5">
            <Loader2 className="w-4 h-4 text-white animate-spin" />
            <p className="p4-b text-white text-center">
              {error
                ? "카메라 권한이 없습니다"
                : "QR 코드를 인식 중입니다. . ."}
            </p>
          </div>
        </div>
      )}
      {/* QR 스캔 성공 바텀 시트 */}
      {showSuccessModal && (
        <div
          className="absolute bottom-[70px] left-0 right-0 z-50 bg-white rounded-t-3xl px-6 pb-6 pt-4 shadow-2xl transition-transform duration-300 ease-out"
          style={{
            animation: "slideUp 0.3s ease-out",
          }}
        >
          <div className="flex flex-col gap-4">
            {/* 타이틀 */}
            <div className="text-left space-y-1">
              <h3 className="h5-b text-primary">QR을 인식했습니다!</h3>
              <p className="p1-b text-secondary">
                주문의 상세 내용을 확인한 후 수령을 확인해주세요.
              </p>
            </div>

            {/* 주문 상세보기 버튼 */}
            <Button
              btnStyle="filled-red"
              size="lg"
              className="w-full"
              onClick={handleViewOrderDetail}
            >
              주문 상세보기
            </Button>
          </div>
        </div>
      )}

      {/* 애니메이션 정의 */}
      <style>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
