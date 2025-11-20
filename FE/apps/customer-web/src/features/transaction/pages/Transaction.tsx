import { useState, useEffect } from 'react';
import { PageHeader, EmptyState } from '@/shared/components';
import { Tab } from '@shared/components/Tab';
import { TransactionCard, QrModal } from '../component';
import {
  getDiscountTransactions,
  getFoocketingTransactions,
  getDiscountTransactionQrImage,
  getFoocketingTransactionQrImage,
} from '../api';
import { useAuthStore } from '@/store/useAuthStore';
import type { DiscountTransaction } from '../type/discountTransaction';
import type { FoocketingTransaction } from '../type/foocketingTransaction';
import catImage from '@/shared/assets/lastnyam-cat-sad.png';

type TransactionTab = 'discount' | 'foocketing';

export default function Transaction() {
  const userId = useAuthStore((state) => state.userId);
  const [activeTab, setActiveTab] = useState<TransactionTab>('discount');
  
  // 마감세일 거래 내역 상태
  const [discountTransactions, setDiscountTransactions] = useState<DiscountTransaction[] | null>(null);
  const [isLoadingDiscount, setIsLoadingDiscount] = useState(false);
  const [discountError, setDiscountError] = useState<Error | null>(null);
  
  // 푸켓팅 거래 내역 상태
  const [foocketingTransactions, setFoocketingTransactions] = useState<FoocketingTransaction[] | null>(null);
  const [isLoadingFoocketing, setIsLoadingFoocketing] = useState(false);
  const [foocketingError, setFoocketingError] = useState<Error | null>(null);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [qrImageUrl, setQrImageUrl] = useState<string | null>(null);

  // 마감세일 거래 내역 조회
  useEffect(() => {
    if (activeTab === 'discount' && userId) {
      setIsLoadingDiscount(true);
      setDiscountError(null);
      getDiscountTransactions(userId)
        .then((data) => {
          setDiscountTransactions(data);
          setIsLoadingDiscount(false);
        })
        .catch((error) => {
          setDiscountError(error instanceof Error ? error : new Error('알 수 없는 에러'));
          setIsLoadingDiscount(false);
        });
    }
  }, [activeTab, userId]);

  // 푸켓팅 거래 내역 조회
  useEffect(() => {
    if (activeTab === 'foocketing' && userId) {
      setIsLoadingFoocketing(true);
      setFoocketingError(null);
      getFoocketingTransactions(userId)
        .then((data) => {
          setFoocketingTransactions(data);
          setIsLoadingFoocketing(false);
        })
        .catch((error) => {
          setFoocketingError(error instanceof Error ? error : new Error('알 수 없는 에러'));
          setIsLoadingFoocketing(false);
        });
    }
  }, [activeTab, userId]);

  const handleTabChange = (index: number) => {
    setActiveTab(index === 0 ? 'discount' : 'foocketing');
  };

  const handleDiscountQrClick = async (transactionId: number) => {
    try {
      if (!userId) {
        console.error('로그인이 필요합니다.');
        return;
      }
      const transactionQrImage = await getDiscountTransactionQrImage(userId, transactionId);
      setQrImageUrl(transactionQrImage);
      setIsQrModalOpen(true);
    } catch (error) {
      console.error('QR 이미지 조회 실패:', error);
    }
  };

  const handleFoocketingQrClick = async (transactionId: number) => {
    try {
      if (!userId) {
        console.error('로그인이 필요합니다.');
        return;
      }
      const transactionQrImage = await getFoocketingTransactionQrImage(userId, transactionId);
      setQrImageUrl(transactionQrImage);
      setIsQrModalOpen(true);
    } catch (error) {
      console.error('QR 이미지 조회 실패:', error);
    }
  };

  const handleCloseQrModal = () => {
    setIsQrModalOpen(false);
    setQrImageUrl(null);
  };

  return (
    <>
      <QrModal isOpen={isQrModalOpen} qrImageUrl={qrImageUrl} onClose={handleCloseQrModal} />
      <PageHeader title="주문내역" variant="light" />
      <div className="px-4 space-y-4">
        <Tab
          tabLabels={['마감세일', '푸켓팅']}
          defaultSelectedIndex={activeTab === 'discount' ? 0 : 1}
          onTabChange={handleTabChange}
          className="px-0"
        />

        {/* 마감세일 거래 내역 */}
        {activeTab === 'discount' && (
          <>
            {isLoadingDiscount && <p className="py-4 text-center text-gray-500">로딩 중...</p>}
            {discountError && (
              <p className="py-4 text-center text-red-500">
                에러: {discountError instanceof Error ? discountError.message : '알 수 없는 에러'}
              </p>
            )}
            {!isLoadingDiscount &&
              !discountError &&
              discountTransactions &&
              discountTransactions.length === 0 && (
                <EmptyState 
                  message="아직 주문 내역이 없다냥…🐾"
                  imageUrl={catImage}
                />
              )}
            {!isLoadingDiscount &&
              !discountError &&
              discountTransactions &&
              discountTransactions.length > 0 && (
                <div className="flex flex-col gap-4">
                  {discountTransactions.map((transaction: DiscountTransaction) => (
                    <TransactionCard
                      key={transaction.transactionId}
                      shopImageUrl={transaction.shop.shopBanner}
                      shopName={transaction.shop.shopName}
                      menus={transaction.menus}
                      totalAmount={transaction.totalAmount}
                      transactionType="discount"
                      transactionStatus={transaction.transactionStatus}
                      onQrClick={() => handleDiscountQrClick(transaction.transactionId)}
                    />
                  ))}
                </div>
              )}
          </>
        )}

        {/* 푸켓팅 거래 내역 */}
        {activeTab === 'foocketing' && (
          <>
            {isLoadingFoocketing && <p className="py-4 text-center text-gray-500">로딩 중...</p>}
            {foocketingError && (
              <p className="py-4 text-center text-red-500">
                에러:{' '}
                {foocketingError instanceof Error ? foocketingError.message : '알 수 없는 에러'}
              </p>
            )}
            {!isLoadingFoocketing &&
              !foocketingError &&
              foocketingTransactions &&
              foocketingTransactions.length === 0 && (
                <EmptyState 
                  message="아직 주문 내역이 없다냥…🐾"
                  imageUrl={catImage}
                />
              )}
            {!isLoadingFoocketing &&
              !foocketingError &&
              foocketingTransactions &&
              foocketingTransactions.length > 0 && (
                <div className="flex flex-col gap-4">
                  {foocketingTransactions.map((transaction: FoocketingTransaction) => (
                    <TransactionCard
                      key={transaction.transactionId}
                      shopImageUrl={transaction.shop.shopBanner}
                      shopName={transaction.shop.shopName}
                      menus={transaction.menus}
                      totalAmount={transaction.totalAmount}
                      transactionType="foocketing"
                      transactionStatus={transaction.transactionStatus}
                      onQrClick={() => handleFoocketingQrClick(transaction.transactionId)}
                    />
                  ))}
                </div>
              )}
          </>
        )}
      </div>
    </>
  );
}
