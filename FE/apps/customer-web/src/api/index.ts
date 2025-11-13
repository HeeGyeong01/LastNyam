// API Client
export { apiClient } from './client';

// Types
export * from './types';

// Foocketing APIs
export {
  getFoocketingList,
  getFoocketingDetail,
  entryFoocketing,
  getFoocketingResult,
} from './foocketing';

// Discount (마감세일) APIs
export { getDiscountList } from './discount';

// Shop APIs
export { getShopDetail } from './shop';

// Cart APIs
export {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  orderCart,
} from './cart';

// Favorite APIs
export { getFavoriteShops } from './favorite';

