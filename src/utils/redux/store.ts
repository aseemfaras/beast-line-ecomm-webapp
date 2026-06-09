import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import productsReducer from "./slices/productsSlice";
import cartReducer from "./slices/cartSlice";
import wishlistReducer from "./slices/wishlistSlice";
import ordersReducer from "./slices/ordersSlice";
import couponsReducer from "./slices/couponsSlice";
import bannersReducer from "./slices/bannersSlice";
import reviewsReducer from "./slices/reviewsSlice";
import returnsReducer from "./slices/returnsSlice";
import usersReducer from "./slices/usersSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productsReducer,
    cart: cartReducer,
    wishlist: wishlistReducer,
    orders: ordersReducer,
    coupons: couponsReducer,
    banners: bannersReducer,
    reviews: reviewsReducer,
    returns: returnsReducer,
    users: usersReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
