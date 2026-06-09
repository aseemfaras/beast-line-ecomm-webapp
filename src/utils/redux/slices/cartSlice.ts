import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "@/utils/api";
import { CartItem } from "@/types/cart";
import { Product } from "@/types/product";


// We extend CartItem in redux state to store database ID
export interface ReduxCartItem extends CartItem {
  dbId?: number;
}

interface CartState {
  cart: ReduxCartItem[];
  loading: boolean;
  error: string | null;
}

const initialState: CartState = {
  cart: [],
  loading: false,
  error: null,
};

export const fetchCartThunk = createAsyncThunk(
  "cart/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const data = await api.get("/cart");
      // data: Array of { id, quantity, selectedColor, selectedSize, savedForLater, product }
      return data.map((item: any) => ({
        dbId: item.id,
        product: item.product,
        quantity: item.quantity,
        selectedColor: item.selectedColor,
        selectedSize: item.selectedSize,
        savedForLater: item.savedForLater,
      }));
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const addToCartThunk = createAsyncThunk(
  "cart/add",
  async (
    payload: { product: Product; size: string; color: string; qty: number },
    { rejectWithValue, getState }
  ) => {
    const { product, size, color, qty } = payload;
    try {
      const response = await api.post("/cart", {
        productId: product.id,
        quantity: qty,
        selectedColor: color,
        selectedSize: size,
        savedForLater: false,
      });
      // response: { success, item }
      return {
        dbId: response.item.id,
        product,
        quantity: response.item.quantity, // this might be combined quantity from server
        selectedColor: color,
        selectedSize: size,
        savedForLater: false,
      };
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateCartQtyThunk = createAsyncThunk(
  "cart/updateQty",
  async (
    payload: { productId: string; size: string; color: string; qty: number },
    { rejectWithValue, getState }
  ) => {
    const { productId, size, color, qty } = payload;
    const state = getState() as { cart: CartState };
    const cartItem = state.cart.cart.find(
      (item) =>
        item.product.id === productId &&
        item.selectedSize === size &&
        item.selectedColor === color
    );

    if (!cartItem || !cartItem.dbId) {
      return rejectWithValue("Item not found in cart");
    }

    try {
      const response = await api.put(`/cart/${cartItem.dbId}`, {
        quantity: qty,
      });
      return {
        dbId: cartItem.dbId,
        quantity: response.item.quantity,
      };
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const toggleSaveForLaterThunk = createAsyncThunk(
  "cart/toggleSaveForLater",
  async (
    payload: { productId: string; size: string; color: string },
    { rejectWithValue, getState }
  ) => {
    const { productId, size, color } = payload;
    const state = getState() as { cart: CartState };
    const cartItem = state.cart.cart.find(
      (item) =>
        item.product.id === productId &&
        item.selectedSize === size &&
        item.selectedColor === color
    );

    if (!cartItem || !cartItem.dbId) {
      return rejectWithValue("Item not found in cart");
    }

    try {
      const response = await api.put(`/cart/${cartItem.dbId}`, {
        savedForLater: !cartItem.savedForLater,
      });
      return {
        dbId: cartItem.dbId,
        savedForLater: response.item.savedForLater,
      };
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const removeFromCartThunk = createAsyncThunk(
  "cart/remove",
  async (
    payload: { productId: string; size: string; color: string },
    { rejectWithValue, getState }
  ) => {
    const { productId, size, color } = payload;
    const state = getState() as { cart: CartState };
    const cartItem = state.cart.cart.find(
      (item) =>
        item.product.id === productId &&
        item.selectedSize === size &&
        item.selectedColor === color
    );

    if (!cartItem || !cartItem.dbId) {
      return rejectWithValue("Item not found in cart");
    }

    try {
      await api.del(`/cart/${cartItem.dbId}`);
      return cartItem.dbId;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const clearCartThunk = createAsyncThunk(
  "cart/clear",
  async (_, { rejectWithValue }) => {
    try {
      await api.del("/cart");
      return null;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Cart
      .addCase(fetchCartThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCartThunk.fulfilled, (state, action: PayloadAction<ReduxCartItem[]>) => {
        state.loading = false;
        state.cart = action.payload;
      })
      .addCase(fetchCartThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Add item
      .addCase(addToCartThunk.fulfilled, (state, action: PayloadAction<ReduxCartItem>) => {
        const existingIdx = state.cart.findIndex(
          (item) =>
            item.product.id === action.payload.product.id &&
            item.selectedSize === action.payload.selectedSize &&
            item.selectedColor === action.payload.selectedColor
        );
        if (existingIdx !== -1) {
          state.cart[existingIdx].quantity = action.payload.quantity;
        } else {
          state.cart.push(action.payload);
        }
      })
      // Update quantity
      .addCase(updateCartQtyThunk.fulfilled, (state, action: PayloadAction<{ dbId: number; quantity: number }>) => {
        const item = state.cart.find((i) => i.dbId === action.payload.dbId);
        if (item) {
          item.quantity = action.payload.quantity;
        }
      })
      // Toggle save for later
      .addCase(toggleSaveForLaterThunk.fulfilled, (state, action: PayloadAction<{ dbId: number; savedForLater: boolean }>) => {
        const item = state.cart.find((i) => i.dbId === action.payload.dbId);
        if (item) {
          item.savedForLater = action.payload.savedForLater;
        }
      })
      // Remove item
      .addCase(removeFromCartThunk.fulfilled, (state, action: PayloadAction<number>) => {
        state.cart = state.cart.filter((item) => item.dbId !== action.payload);
      })
      // Clear Cart
      .addCase(clearCartThunk.fulfilled, (state) => {
        state.cart = [];
      });
  },
});

export default cartSlice.reducer;
