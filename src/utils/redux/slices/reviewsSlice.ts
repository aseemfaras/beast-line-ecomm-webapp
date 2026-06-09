import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "@/utils/api";
import { Review } from "@/types/product";


interface ReviewsState {
  reviews: Review[];
  loading: boolean;
  error: string | null;
}

const initialState: ReviewsState = {
  reviews: [],
  loading: false,
  error: null,
};

export const fetchReviewsThunk = createAsyncThunk(
  "reviews/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const data = await api.get("/reviews");
      return data;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const addReviewThunk = createAsyncThunk(
  "reviews/add",
  async (
    payload: { productId: string; rating: number; comment: string },
    { rejectWithValue }
  ) => {
    try {
      const data = await api.post("/reviews", payload);
      return data.review; // returns created review
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const moderateReviewThunk = createAsyncThunk(
  "reviews/moderate",
  async (
    payload: { reviewId: string; status: Review["status"]; rejectReason?: string },
    { rejectWithValue }
  ) => {
    const { reviewId, status, rejectReason } = payload;
    try {
      const data = await api.put(`/reviews/${reviewId}/moderate`, { status, rejectReason });
      return data.review;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const deleteReviewThunk = createAsyncThunk(
  "reviews/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await api.del(`/reviews/${id}`);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

const reviewsSlice = createSlice({
  name: "reviews",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchReviewsThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchReviewsThunk.fulfilled, (state, action: PayloadAction<Review[]>) => {
        state.loading = false;
        state.reviews = action.payload;
      })
      .addCase(fetchReviewsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Add Review
      .addCase(addReviewThunk.fulfilled, (state, action: PayloadAction<Review>) => {
        state.reviews.unshift(action.payload);
      })
      // Moderate Review
      .addCase(moderateReviewThunk.fulfilled, (state, action: PayloadAction<Review>) => {
        const index = state.reviews.findIndex((r) => r.id === action.payload.id);
        if (index !== -1) {
          state.reviews[index] = action.payload;
        }
      })
      // Delete Review
      .addCase(deleteReviewThunk.fulfilled, (state, action: PayloadAction<string>) => {
        state.reviews = state.reviews.filter((r) => r.id !== action.payload);
      });
  },
});

export default reviewsSlice.reducer;
