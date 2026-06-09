import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "@/utils/api";
import { ReturnRequest } from "@/types/return";


interface ReturnsState {
  returns: ReturnRequest[];
  loading: boolean;
  error: string | null;
}

const initialState: ReturnsState = {
  returns: [],
  loading: false,
  error: null,
};

export const fetchReturnsThunk = createAsyncThunk(
  "returns/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const data = await api.get("/returns");
      return data;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const requestReturnThunk = createAsyncThunk(
  "returns/request",
  async (
    payload: { orderId: string; productId: string; productName: string; thumbnail: string; reason: string; evidenceImage?: string },
    { rejectWithValue }
  ) => {
    try {
      const data = await api.post("/returns", payload);
      return data.returnRequest;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const moderateReturnThunk = createAsyncThunk(
  "returns/moderate",
  async (
    payload: { returnId: string; status: ReturnRequest["status"] },
    { rejectWithValue }
  ) => {
    const { returnId, status } = payload;
    try {
      const data = await api.put(`/returns/${returnId}/moderate`, { status });
      return data.returnRequest;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

const returnsSlice = createSlice({
  name: "returns",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchReturnsThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchReturnsThunk.fulfilled, (state, action: PayloadAction<ReturnRequest[]>) => {
        state.loading = false;
        state.returns = action.payload;
      })
      .addCase(fetchReturnsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Request Return
      .addCase(requestReturnThunk.fulfilled, (state, action: PayloadAction<ReturnRequest>) => {
        state.returns.unshift(action.payload);
      })
      // Moderate Return
      .addCase(moderateReturnThunk.fulfilled, (state, action: PayloadAction<ReturnRequest>) => {
        const index = state.returns.findIndex((r) => r.id === action.payload.id);
        if (index !== -1) {
          state.returns[index] = action.payload;
        }
      });
  },
});

export default returnsSlice.reducer;
