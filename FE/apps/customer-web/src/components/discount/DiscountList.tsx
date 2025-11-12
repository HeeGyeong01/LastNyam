// import { useNavigate } from 'react-router-dom';
// import { ShopCardHorizontal } from '@/components/cards';
// import DiscountListHeader from './DiscountListHeader';
// import type { DiscountItem, DiscountSortType } from '@/types';

// interface DiscountListProps {
//   discounts: DiscountItem[];
//   loading: boolean;
//   error: Error | null;
//   sort: DiscountSortType;
//   sortLabels: Record<DiscountSortType, string>;
//   onSortClick?: () => void;
// }

// export default function DiscountList({
//   discounts,
//   loading,
//   error,
//   sort,
//   sortLabels,
//   onSortClick,
// }: DiscountListProps) {
//   const navigate = useNavigate();

//   return (
//     <div className="h-full overflow-y-auto px-4 pb-28">
//       {loading && <p>로딩 중...</p>}
//       {error && <p>에러: {error.message}</p>}
      
//       {discounts.length > 0 && (
//         <div>
//           <DiscountListHeader
//             sort={sort}
//             sortLabels={sortLabels}
//             onSortClick={onSortClick}
//           />

//           {/* 마감세일(가게) 목록 */}
//           <div className="flex flex-col">
//             {discounts.map((item: DiscountItem) => (
//               <ShopCardHorizontal
//                 key={item.discountId}
//                 storeName={item.shopName}
//                 storeProfileImage={item.menuImage}
//                 rating={item.rating}
//                 reviewCount={item.reviewCount}
//                 saleMenu={item.saleMenu}
//                 distance={item.distance?.toString() || ''}
//                 onClick={() => navigate(`/shop/${item.shopId}`)}
//               />
//             ))}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

