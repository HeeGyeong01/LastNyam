import { useState, useEffect } from 'react';
import { PageHeader } from '@/shared/components';
import { Tab } from '@shared/components/Tab';
import { TransactionCard } from '../component';
import { getDiscountTransactions, getFoocketingTransactions } from '../api';
import { useAuthStore } from '@/store/useAuthStore';
import type { DiscountTransaction } from '../type/discountTransaction';
import type { FoocketingTransaction } from '../type/foocketingTransaction';

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

  const handleQrClick = (transactionId: number) => {
    // TODO: QR 확인 페이지로 이동
    console.log('QR 확인:', transactionId);
  };

  return (
    <>
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
            {isLoadingDiscount && (
              <p className="py-4 text-center text-gray-500">로딩 중...</p>
            )}
            {discountError && (
              <p className="py-4 text-center text-red-500">
                에러: {discountError instanceof Error ? discountError.message : '알 수 없는 에러'}
              </p>
            )}
            {!isLoadingDiscount && !discountError && discountTransactions && discountTransactions.length === 0 && (
              <p className="py-4 text-center text-gray-500">거래 내역이 없습니다.</p>
            )}
            {!isLoadingDiscount && !discountError && discountTransactions && discountTransactions.length > 0 && (
              <div className="flex flex-col gap-4">
                {discountTransactions.map((transaction: DiscountTransaction) => (
                  <TransactionCard
                    key={transaction.transactionId}
                    shopImageUrl={transaction.shop.shopBanner}
                    shopName={transaction.shop.shopName}
                    menus={transaction.menus}
                    totalAmount={transaction.totalAmount}
                    transactionType="discount"
                    onQrClick={() => handleQrClick(transaction.transactionId)}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* 푸켓팅 거래 내역 */}
        {activeTab === 'foocketing' && (
          <>
            {isLoadingFoocketing && (
              <p className="py-4 text-center text-gray-500">로딩 중...</p>
            )}
            {foocketingError && (
              <p className="py-4 text-center text-red-500">
                에러: {foocketingError instanceof Error ? foocketingError.message : '알 수 없는 에러'}
              </p>
            )}
            {!isLoadingFoocketing && !foocketingError && foocketingTransactions && foocketingTransactions.length === 0 && (
              <p className="py-4 text-center text-gray-500">거래 내역이 없습니다.</p>
            )}
            {!isLoadingFoocketing && !foocketingError && foocketingTransactions && foocketingTransactions.length > 0 && (
              <div className="flex flex-col gap-4">
                {foocketingTransactions.map((transaction: FoocketingTransaction) => (
                  <TransactionCard
                    key={transaction.transactionId}
                    shopImageUrl={transaction.shop.shopBanner}
                    shopName={transaction.shop.shopName}
                    menus={transaction.menus}
                    totalAmount={transaction.totalAmount}
                    transactionType="foocketing"
                    onQrClick={() => handleQrClick(transaction.transactionId)}
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
