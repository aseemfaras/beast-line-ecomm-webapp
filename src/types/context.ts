import { Product, Review } from "./product";
import { CartItem } from "./cart";
import { Order, OrderAddress } from "./order";
import { Coupon } from "./coupon";
import { Banner } from "./banner";
import { User } from "./user";
import { ReturnRequest } from "./return";

export interface AppContextType {
  products: Product[];
  cart: CartItem[];
  wishlist: string[];
  orders: Order[];
  coupons: Coupon[];
  banners: Banner[];
  reviews: Review[];
  users: User[];
  returns: ReturnRequest[];
  currentUser: User | null;
  productsLoading: boolean;
  cartLoading: boolean;
  ordersLoading: boolean;
  wishlistLoading: boolean;
  returnsLoading: boolean;
  usersLoading: boolean;
  reviewsLoading: boolean;
  bannersLoading: boolean;
  couponsLoading: boolean;

  // Actions
  addProduct: (product: Omit<Product, "id" | "rating" | "slug">) => Promise<any>;
  updateProduct: (id: string, updated: Partial<Product>) => Promise<any>;
  deleteProduct: (id: string) => void;
  bulkDeleteProducts: (ids: string[]) => void;
  bulkUpdateProducts: (ids: string[], updates: Partial<Product>) => void;

  addToCart: (product: Product, size: string, color: string, qty?: number) => void;
  removeFromCart: (productId: string, size: string, color: string) => void;
  updateCartQty: (productId: string, size: string, color: string, qty: number) => void;
  toggleSaveForLater: (productId: string, size: string, color: string) => void;
  clearCart: () => void;

  toggleWishlist: (productId: string) => void;

  placeOrder: (
    address: OrderAddress,
    paymentMethod: string,
    appliedCoupon: Coupon | null,
    razorpayDetails?: {
      razorpay_payment_id: string | null;
      razorpay_order_id: string | null;
      razorpay_signature: string | null;
    } | null
  ) => Promise<any>;
  updateOrderStatus: (orderId: string, status: Order["status"], desc?: string) => void;

  createCoupon: (coupon: Coupon) => void;
  deleteCoupon: (code: string) => void;

  createBanner: (formData: FormData) => void;
  deleteBanner: (id: string) => void;

  addReview: (productId: string, rating: number, comment: string) => void;
  moderateReview: (reviewId: string, status: Review["status"], rejectReason?: string) => void;
  deleteReview: (reviewId: string) => void;

  updateUserStatus: (userId: string, blocked: boolean) => void;
  deleteUser: (userId: string) => void;
  loginUser: (email: string, password: string) => Promise<{ success: boolean; user?: User; error?: string }>;
  registerUser: (name: string, email: string, mobile: string, password: string) => Promise<{ success: boolean; user?: User; error?: string }>;
  logoutUser: () => void;
  updateProfile: (name: string, mobile: string) => void;

  requestReturn: (orderId: string, productId: string, productName: string, thumbnail: string, reason: string, evidenceImage?: string) => void;
  moderateReturn: (returnId: string, status: ReturnRequest["status"]) => void;
}
