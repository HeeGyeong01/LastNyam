import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Scanner } from "@yudiel/react-qr-scanner";
import { Loader2 } from "lucide-react";
import { Button } from "@shared/src/components/Button";
import { useOwnerStore } from "@/store/useOwnerStore";
import { orderApi, type TransactionType } from "../apis/order.api";

export default function QRScanPage() {
  const navigate = useNavigate();
  const { ownerId, accessToken, shops } = useOwnerStore();
  
  const [scanning, setScanning] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showInvalidQRWarning, setShowInvalidQRWarning] = useState(false);
  const [showNotMyShopWarning, setShowNotMyShopWarning] = useState(false);
  const [scannedData, setScannedData] = useState<string>("");

  const handleScan = async (result: any) => {
    if (result && result[0] && scanning) {
      const url = result[0].rawValue;
      setScannedData(url);
      
      console.log("🔍 QR 스캔됨:", url);

      // basename (/owner) 제거
      const urlWithoutBasename = url.startsWith("/owner") ? url.substring(6) : url;
      console.log("🔍 basename 제거 후:", urlWithoutBasename);

      // 1️⃣ URL 형식 체크
      if (!urlWithoutBasename.startsWith("/orders/receipt-confirm")) {
        console.log("❌ URL 형식 오류:", urlWithoutBasename);
        setScanning(false);
        setShowInvalidQRWarning(true);
        setTimeout(() => {
          setShowInvalidQRWarning(false);
          setScanning(true);
        }, 3000);
        return;
      }
      
      console.log("✅ URL 형식 확인 완료");

      // 2️⃣ URL 파라미터 파싱
      const urlParams = new URLSearchParams(urlWithoutBasename.split('?')[1]);
      const transactionId = urlParams.get('id');
      const typeRaw = urlParams.get('type');
      
      console.log("📋 파싱된 파라미터 (원본):", { transactionId, typeRaw, ownerId, accessToken: !!accessToken });

      if (!transactionId || !typeRaw || !ownerId || !accessToken) {
        console.log("❌ 파라미터 또는 인증 정보 누락");
        setScanning(false);
        setShowInvalidQRWarning(true);
        setTimeout(() => {
          setShowInvalidQRWarning(false);
          setScanning(true);
        }, 3000);
        return;
      }

      // 3️⃣ type 검증 및 정규화 (대소문자 구분 없이)
      const typeUpper = typeRaw.toUpperCase();
      if (typeUpper !== "DISCOUNT" && typeUpper !== "FOOCKETING") {
        console.log("❌ type 검증 실패:", typeRaw);
        setScanning(false);
        setShowInvalidQRWarning(true);
        setTimeout(() => {
          setShowInvalidQRWarning(false);
          setScanning(true);
        }, 3000);
        return;
      }
      
      const type = typeUpper as TransactionType;
      console.log("✅ type 검증 완료:", type);

      // 4️⃣ API 호출해서 주문 정보 가져오기
      try {
        setScanning(false);
        setIsVerifying(true);
        console.log("🌐 API 호출 시작...");
        const response = await orderApi.getTransactionDetail(
          ownerId,
          parseInt(transactionId, 10),
          type,
          accessToken
        );
        
        console.log("📦 API 응답:", response);
        setIsVerifying(false);

        if (!response.data) {
          throw new Error("주문 정보를 찾을 수 없습니다");
        }

        // 5️⃣ 가게 소유권 검증
        const orderShopId = response.data.shopId;
        const myShopIds = shops.map(shop => shop.shopId);
        const isMyShop = myShopIds.includes(orderShopId);
        
        console.log("🏪 가게 검증:", { orderShopId, myShopIds, isMyShop });

        if (!isMyShop) {
          // ❌ 다른 가게 주문
          console.log("❌ 다른 가게 주문");
          setShowNotMyShopWarning(true);
          
          // 3초 후 다시 스캔 모드로
          setTimeout(() => {
            setShowNotMyShopWarning(false);
            setScanning(true);
          }, 3000);
          return;
        }

        // ✅ 내 가게 주문 - 성공 모달 표시
        console.log("✅ 내 가게 주문 확인! 성공 모달 표시");
        
        // 모든 경고 상태 초기화 (이전 경고가 있었다면 숨김)
        setShowInvalidQRWarning(false);
        setShowNotMyShopWarning(false);
        
        // 성공 모달 표시 (사용자가 직접 닫을 때까지 유지)
        setShowSuccessModal(true);

      } catch (err) {
        console.error("❌ 주문 검증 실패:", err);
        setScanning(false);
        setIsVerifying(false);
        
        // 권한 에러인지 확인
        const errorMessage = err instanceof Error ? err.message : "";
        const isPermissionError = errorMessage.includes("점주가 아닙니다") || 
                                 errorMessage.includes("권한이 없습니다");
        
        if (isPermissionError) {
          // 다른 가게 주문
          setShowNotMyShopWarning(true);
          setTimeout(() => {
            setShowNotMyShopWarning(false);
            setScanning(true);
          }, 3000);
        } else {
          // 잘못된 QR 코드
          setShowInvalidQRWarning(true);
          setTimeout(() => {
            setShowInvalidQRWarning(false);
            setScanning(true);
          }, 3000);
        }
      }
    }
  };

  const handleViewOrderDetail = () => {
    setShowSuccessModal(false);
    // basename (/owner) 제거 후 navigate
    const urlWithoutBasename = scannedData.startsWith("/owner") ? scannedData.substring(6) : scannedData;
    navigate(urlWithoutBasename);
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    setScanning(true);
  };

  const handleError = () => {
    console.error("카메라 에러");
  };

  return (
    <div className="relative w-full h-[100dvh] bg-black">
      {/* 카메라 화면 */}
      <div className="absolute inset-0">
        <Scanner
          onScan={handleScan}
          onError={handleError}
          constraints={{
            facingMode: "environment",
          }}
          components={{
            finder: false,
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
      {/* 중앙 스캔 가이드 영역 (헤더/푸터 제외한 중앙) */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-20 pt-4 pb-48">
        {/* 안내 텍스트 */}
        <div className="mb-8">
          <h2 className="text-white h3-b drop-shadow-lg text-center">
            수령 확인용 QR을 찍어주세요
          </h2>
        </div>
        
        {/* 스캔 영역 가이드 */}
        <div className="w-64 h-64 border-4 border-brand/40 rounded-2xl relative">
          {/* 모서리 강조 */}
          <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-brand rounded-tl-2xl"></div>
          <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-brand rounded-tr-2xl"></div>
          <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-brand rounded-bl-2xl"></div>
          <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-brand rounded-br-2xl"></div>
        </div>
      </div>

      {/* 하단 상태 표시 */}
      {!showSuccessModal && !showNotMyShopWarning && !showInvalidQRWarning && (
        <div className="fixed bottom-20 left-0 right-0 z-20 mb-2">
          <div className="bg-bg-inverse py-3 flex items-center justify-center gap-2.5">
            <Loader2 className="w-4 h-4 text-inverse animate-spin" />
            <p className="p4-b text-white text-center">
              {isVerifying ? "주문 정보 확인 중. . ." : "QR 코드를 인식 중입니다. . ."}
            </p>
          </div>
        </div>
      )}
      {/* QR 스캔 성공 바텀 시트 */}
      {showSuccessModal && (
        <>
          {/* 배경 오버레이 - 푸터 영역 제외 */}
          <div
            className="fixed top-0 left-0 right-0 bottom-[70px] z-[59] bg-black/50"
            onClick={handleCloseSuccessModal}
          />
          
          {/* 바텀 시트 */}
          <div
            className="fixed bottom-[70px] left-0 right-0 z-[60] bg-white rounded-t-3xl px-6 pb-6 pt-4 shadow-2xl transition-transform duration-300 ease-out"
            style={{
              animation: "slideUp 0.3s ease-out",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col gap-4">
              
              {/* 타이틀 */}
              <div className="text-center space-y-1">
                <h3 className="h5-b text-brand">수령 확인하시겠습니까?</h3>
                <p className="p2 text-secondary">
                  주문의 상세 내용을 확인한 후 수령을 확인해주세요
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
        </>
      )}

      {/* 잘못된 QR 경고 바텀 시트 */}
      {showInvalidQRWarning && !showSuccessModal && (
        <div
          className="fixed bottom-[70px] left-0 right-0 z-50 bg-white rounded-t-3xl px-6 pb-6 pt-4 shadow-2xl"
          style={{
            animation: "slideUp 0.3s ease-out",
          }}
        >
          <div className="flex flex-col gap-3">
            
            {/* 타이틀 */}
            <div className="text-center space-y-2">
              <h3 className="h5-b text-error">잘못된 QR 코드입니다</h3>
              <p className="p2 text-secondary">
                수령 확인용 QR 코드가 아니거나 유효하지 않은 QR 코드입니다
              </p>
              <p className="p3 text-tertiary">
                3초 후 스캔 모드로 돌아갑니다
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 권한 없음 경고 바텀 시트 */}
      {showNotMyShopWarning && !showSuccessModal && (
        <div
          className="fixed bottom-[70px] left-0 right-0 z-50 bg-white rounded-t-3xl px-6 pb-6 pt-4 shadow-2xl"
          style={{
            animation: "slideUp 0.3s ease-out",
          }}
        >
          <div className="flex flex-col gap-3">
            
            {/* 타이틀 */}
            <div className="text-center space-y-2">
              <h3 className="h5-b text-error">권한이 없습니다</h3>
              <p className="p2 text-secondary">
                이 주문은 다른 가게의 주문입니다
              </p>
              <p className="p3 text-tertiary">
                3초 후 스캔 모드로 돌아갑니다
              </p>
            </div>
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
