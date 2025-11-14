import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/shared/components';
import { Tab } from '@shared/components/Tab';
import { TransactionCard } from '../component';
import { getDiscountTransactions, getFoocketingTransactions } from '../api';
import type { DiscountTransaction } from '../type/discountTransaction';
import type { FoocketingTransaction } from '../type/foocketingTransaction';

type TransactionTab = 'discount' | 'foocketing';

// TODO: 인증 시스템 구현 후 실제 userId로 교체
const USER_ID = 2;

export default function Transaction() {
  const [activeTab, setActiveTab] = useState<TransactionTab>('discount');

  // 마감세일 거래 내역 조회
  const {
    data: discountTransactions,
    isLoading: isLoadingDiscount,
    error: discountError,
  } = useQuery({
    queryKey: ['transaction', 'discount', USER_ID],
    queryFn: () => getDiscountTransactions(USER_ID),
    enabled: activeTab === 'discount',
  });

  // 푸켓팅 거래 내역 조회
  const {
    data: foocketingTransactions,
    isLoading: isLoadingFoocketing,
    error: foocketingError,
  } = useQuery({
    queryKey: ['transaction', 'foocketing', USER_ID],
    queryFn: () => getFoocketingTransactions(USER_ID),
    enabled: activeTab === 'foocketing',
  });

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
