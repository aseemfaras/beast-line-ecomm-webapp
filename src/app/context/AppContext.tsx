"use client";

import React, { createContext, useContext, useEffect } from "react";
import { Provider, useDispatch, useSelector } from "react-redux";
import { store, RootState, AppDispatch } from "@/utils/redux/store";

import {
  fetchProductsThunk,
  addProductThunk,
  updateProductThunk,
  deleteProductThunk,
  bulkDeleteProductsThunk,
  bulkUpdateProductsThunk,
} from "@/utils/redux/slices/productsSlice";

import {
  fetchCartThunk,
  addToCartThunk,
  updateCartQtyThunk,
  toggleSaveForLaterThunk,
  removeFromCartThunk,
  clearCartThunk,
} from "@/utils/redux/slices/cartSlice";

import { fetchWishlistThunk, toggleWishlistThunk } from "@/utils/redux/slices/wishlistSlice";

import { fetchOrdersThunk, placeOrderThunk, updateOrderStatusThunk } from "@/utils/redux/slices/ordersSlice";

import { fetchCouponsThunk, createCouponThunk, deleteCouponThunk } from "@/utils/redux/slices/couponsSlice";

import { fetchBannersThunk, createBannerThunk, deleteBannerThunk } from "@/utils/redux/slices/bannersSlice";

import {
  fetchReviewsThunk,
  addReviewThunk,
  moderateReviewThunk,
  deleteReviewThunk,
} from "@/utils/redux/slices/reviewsSlice";

import { fetchUsersThunk, updateUserStatusThunk, deleteUserThunk } from "@/utils/redux/slices/usersSlice";

import { fetchReturnsThunk, requestReturnThunk, moderateReturnThunk } from "@/utils/redux/slices/returnsSlice";

import {
  fetchProfileThunk,
  loginUserThunk,
  registerUserThunk,
  logoutUser as logoutUserAction,
  updateProfileThunk,
} from "@/utils/redux/slices/authSlice";

import { Product, Review } from "@/types/product";
import { CartItem } from "@/types/cart";
import { Order, OrderAddress } from "@/types/order";
import { Coupon } from "@/types/coupon";
import { Banner } from "@/types/banner";
import { User } from "@/types/user";
import { ReturnRequest } from "@/types/return";
import { AppContextType } from "@/types/context";


const AppContext = createContext<AppContextType | undefined>(undefined);

const AppInnerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useDispatch<AppDispatch>();

  // Selectors
  const products = useSelector((state: RootState) => state.products.products);
  const cart = useSelector((state: RootState) => state.cart.cart);
  const wishlist = useSelector((state: RootState) => state.wishlist.wishlist);
  const orders = useSelector((state: RootState) => state.orders.orders);
  const coupons = useSelector((state: RootState) => state.coupons.coupons);
  const banners = useSelector((state: RootState) => state.banners.banners);
  const reviews = useSelector((state: RootState) => state.reviews.reviews);
  const users = useSelector((state: RootState) => state.users.users);
  const returns = useSelector((state: RootState) => state.returns.returns);
  const currentUser = useSelector((state: RootState) => state.auth.currentUser);
  const token = useSelector((state: RootState) => state.auth.token);

  // Loading selectors
  const productsLoading = useSelector((state: RootState) => state.products.loading);
  const cartLoading = useSelector((state: RootState) => state.cart.loading);
  const ordersLoading = useSelector((state: RootState) => state.orders.loading);
  const wishlistLoading = useSelector((state: RootState) => state.wishlist.loading);
  const returnsLoading = useSelector((state: RootState) => state.returns.loading);
  const usersLoading = useSelector((state: RootState) => state.users.loading);
  const reviewsLoading = useSelector((state: RootState) => state.reviews.loading);
  const bannersLoading = useSelector((state: RootState) => state.banners.loading);
  const couponsLoading = useSelector((state: RootState) => state.coupons.loading);

  // Bootstrap initial public configurations
  useEffect(() => {
    dispatch(fetchProductsThunk());
    dispatch(fetchBannersThunk());
    dispatch(fetchCouponsThunk());
  }, [dispatch]);

  // Bootstrap user records on session token load
  useEffect(() => {
    if (token) {
      dispatch(fetchProfileThunk());
      dispatch(fetchCartThunk());
      dispatch(fetchWishlistThunk());
      dispatch(fetchOrdersThunk());
      dispatch(fetchReturnsThunk());
    }
  }, [dispatch, token]);

  // Bootstrap admin records on admin profile load
  useEffect(() => {
    if (currentUser && (currentUser.role === "admin" || currentUser.role === "super_admin")) {
      dispatch(fetchUsersThunk());
      dispatch(fetchReturnsThunk());
      dispatch(fetchOrdersThunk());
    }
    // Reviews are needed for both admin and customer views
    dispatch(fetchReviewsThunk());
  }, [dispatch, currentUser]);

  // Context Actions mapping
  const addProduct = async (prod: Omit<Product, "id" | "rating" | "slug">) => {
    return await dispatch(addProductThunk(prod));
  };

  const updateProduct = async (id: string, updated: Partial<Product>) => {
    return await dispatch(updateProductThunk({ id, updated }));
  };

  const deleteProduct = (id: string) => {
    dispatch(deleteProductThunk(id));
  };

  const bulkDeleteProducts = (ids: string[]) => {
    dispatch(bulkDeleteProductsThunk(ids));
  };

  const bulkUpdateProducts = (ids: string[], updates: Partial<Product>) => {
    dispatch(bulkUpdateProductsThunk({ ids, updates }));
  };

  const addToCart = (product: Product, size: string, color: string, qty = 1) => {
    dispatch(addToCartThunk({ product, size, color, qty }));
  };

  const removeFromCart = (productId: string, size: string, color: string) => {
    dispatch(removeFromCartThunk({ productId, size, color }));
  };

  const updateCartQty = (productId: string, size: string, color: string, qty: number) => {
    dispatch(updateCartQtyThunk({ productId, size, color, qty }));
  };

  const toggleSaveForLater = (productId: string, size: string, color: string) => {
    dispatch(toggleSaveForLaterThunk({ productId, size, color }));
  };

  const clearCart = () => {
    dispatch(clearCartThunk());
  };

  const toggleWishlist = (productId: string) => {
    dispatch(toggleWishlistThunk(productId));
  };

  const placeOrder = async (
    address: OrderAddress,
    paymentMethod: string,
    appliedCoupon: Coupon | null,
    razorpayDetails?: {
      razorpay_payment_id: string | null;
      razorpay_order_id: string | null;
      razorpay_signature: string | null;
    } | null
  ) => {
    const res = await dispatch(
      placeOrderThunk({
        address,
        paymentMethod,
        couponCode: appliedCoupon ? appliedCoupon.code : null,
        ...razorpayDetails,
      })
    );
    if (placeOrderThunk.fulfilled.match(res)) {
      return res.payload;
    }
    const errorMsg = res.payload as string || "Failed to place order";
    throw new Error(errorMsg);
  };

  const updateOrderStatus = (orderId: string, status: Order["status"], desc?: string) => {
    dispatch(updateOrderStatusThunk({ orderId, status, description: desc }));
  };

  const createCoupon = (coupon: Coupon) => {
    dispatch(createCouponThunk(coupon));
  };

  const deleteCoupon = (code: string) => {
    dispatch(deleteCouponThunk(code));
  };

  const createBanner = (formData: FormData) => {
    dispatch(createBannerThunk(formData));
  };

  const deleteBanner = (id: string) => {
    dispatch(deleteBannerThunk(id));
  };

  const addReview = (productId: string, rating: number, comment: string) => {
    dispatch(addReviewThunk({ productId, rating, comment }));
  };

  const moderateReview = (reviewId: string, status: Review["status"], rejectReason?: string) => {
    dispatch(moderateReviewThunk({ reviewId, status, rejectReason }));
  };

  const deleteReview = (reviewId: string) => {
    dispatch(deleteReviewThunk(reviewId));
  };

  const updateUserStatus = (userId: string, blocked: boolean) => {
    dispatch(updateUserStatusThunk({ userId, blocked }));
  };

  const deleteUser = (userId: string) => {
    dispatch(deleteUserThunk(userId));
  };

  const loginUser = async (email: string, password: string) => {
    const res = await dispatch(loginUserThunk({ email, password }));
    if (loginUserThunk.fulfilled.match(res)) {
      return { success: true, user: res.payload.user };
    }
    return { success: false, error: res.payload as string };
  };

  const registerUser = async (name: string, email: string, mobile: string, password: string) => {
    const res = await dispatch(registerUserThunk({ name, email, mobile, password }));
    if (registerUserThunk.fulfilled.match(res)) {
      return { success: true, user: res.payload.user };
    }
    return { success: false, error: res.payload as string };
  };

  const logoutUser = () => {
    dispatch(logoutUserAction());
  };

  const updateProfile = (name: string, mobile: string) => {
    dispatch(updateProfileThunk({ name, mobile }));
  };

  const requestReturn = (
    orderId: string,
    productId: string,
    productName: string,
    thumbnail: string,
    reason: string,
    evidenceImage?: string
  ) => {
    dispatch(requestReturnThunk({ orderId, productId, productName, thumbnail, reason, evidenceImage }));
  };

  const moderateReturn = (returnId: string, status: ReturnRequest["status"]) => {
    dispatch(moderateReturnThunk({ returnId, status }));
  };

  return (
    <AppContext.Provider
      value={{
        products,
        cart,
        wishlist,
        orders,
        coupons,
        banners,
        reviews,
        users,
        returns,
        currentUser,
        productsLoading,
        cartLoading,
        ordersLoading,
        wishlistLoading,
        returnsLoading,
        usersLoading,
        reviewsLoading,
        bannersLoading,
        couponsLoading,
        addProduct,
        updateProduct,
        deleteProduct,
        bulkDeleteProducts,
        bulkUpdateProducts,
        addToCart,
        removeFromCart,
        updateCartQty,
        toggleSaveForLater,
        clearCart,
        toggleWishlist,
        placeOrder,
        updateOrderStatus,
        createCoupon,
        deleteCoupon,
        createBanner,
        deleteBanner,
        addReview,
        moderateReview,
        deleteReview,
        updateUserStatus,
        deleteUser,
        loginUser,
        registerUser,
        logoutUser,
        updateProfile,
        requestReturn,
        moderateReturn,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const AppContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Provider store={store}>
      <AppInnerProvider>{children}</AppInnerProvider>
    </Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within an AppContextProvider");
  return context;
};
