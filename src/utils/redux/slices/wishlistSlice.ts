import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "@/utils/api";

interface WishlistState {
  wishlist: string[]; // array of product IDs
  loading: boolean;
  error: string | null;
}

const initialState: WishlistState = {
  wishlist: [],
  loading: false,
  error: null,
};

export const fetchWishlistThunk = createAsyncThunk(
  "wishlist/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const data = await api.get("/wishlist");
      // data: Array of { id, productId, product }
      return data.map((item: any) => item.productId);
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const toggleWishlistThunk = createAsyncThunk(
  "wishlist/toggle",
  async (productId: string, { rejectWithValue }) => {
    try {
      const response = await api.post("/wishlist/toggle", { productId });
      return { productId, action: response.action }; // action: 'added' | 'removed'
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlistThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchWishlistThunk.fulfilled, (state, action: PayloadAction<string[]>) => {
        state.loading = false;
        state.wishlist = action.payload;
      })
      .addCase(fetchWishlistThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Toggle Wishlist
      .addCase(toggleWishlistThunk.fulfilled, (state, action: PayloadAction<{ productId: string; action: string }>) => {
        const { productId, action: act } = action.payload;
        if (act === "added") {
          if (!state.wishlist.includes(productId)) {
            state.wishlist.push(productId);
          }
        } else {
          state.wishlist = state.wishlist.filter((id) => id !== productId);
        }
      });
  },
});

export default wishlistSlice.reducer;
