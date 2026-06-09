import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "@/utils/api";
import { Banner } from "@/types/banner";


interface BannersState {
  banners: Banner[];
  loading: boolean;
  error: string | null;
}

const initialState: BannersState = {
  banners: [],
  loading: false,
  error: null,
};

export const fetchBannersThunk = createAsyncThunk(
  "banners/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const data = await api.get("/banners");
      return data;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const createBannerThunk = createAsyncThunk(
  "banners/create",
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const data = await api.post("/banners", formData);
      return data;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const deleteBannerThunk = createAsyncThunk(
  "banners/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await api.del(`/banners/${id}`);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

const bannersSlice = createSlice({
  name: "banners",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBannersThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchBannersThunk.fulfilled, (state, action: PayloadAction<Banner[]>) => {
        state.loading = false;
        state.banners = action.payload;
      })
      .addCase(fetchBannersThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create Banner
      .addCase(createBannerThunk.fulfilled, (state, action: PayloadAction<Banner>) => {
        state.banners.push(action.payload);
      })
      // Delete Banner
      .addCase(deleteBannerThunk.fulfilled, (state, action: PayloadAction<string>) => {
        state.banners = state.banners.filter((b) => b.id !== action.payload);
      });
  },
});

export default bannersSlice.reducer;
