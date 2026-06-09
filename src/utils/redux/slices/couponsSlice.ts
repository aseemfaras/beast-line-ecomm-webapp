import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "@/utils/api";
import { Coupon } from "@/types/coupon";


interface CouponsState {
  coupons: Coupon[];
  loading: boolean;
  error: string | null;
}

const initialState: CouponsState = {
  coupons: [],
  loading: false,
  error: null,
};

export const fetchCouponsThunk = createAsyncThunk(
  "coupons/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const data = await api.get("/coupons");
      return data;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const createCouponThunk = createAsyncThunk(
  "coupons/create",
  async (coupon: Coupon, { rejectWithValue }) => {
    try {
      const data = await api.post("/coupons", coupon);
      return data;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const deleteCouponThunk = createAsyncThunk(
  "coupons/delete",
  async (code: string, { rejectWithValue }) => {
    try {
      await api.del(`/coupons/${code}`);
      return code;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

const couponsSlice = createSlice({
  name: "coupons",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCouponsThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCouponsThunk.fulfilled, (state, action: PayloadAction<Coupon[]>) => {
        state.loading = false;
        state.coupons = action.payload;
      })
      .addCase(fetchCouponsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create Coupon
      .addCase(createCouponThunk.fulfilled, (state, action: PayloadAction<Coupon>) => {
        state.coupons = [action.payload, ...state.coupons.filter(c => c.code !== action.payload.code)];
      })
      // Delete Coupon
      .addCase(deleteCouponThunk.fulfilled, (state, action: PayloadAction<string>) => {
        state.coupons = state.coupons.filter((c) => c.code !== action.payload);
      });
  },
});

export default couponsSlice.reducer;
