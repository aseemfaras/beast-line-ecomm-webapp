import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "@/utils/api";
import { Product } from "@/types/product";


interface ProductsState {
  products: Product[];
  loading: boolean;
  error: string | null;
}

const initialState: ProductsState = {
  products: [],
  loading: false,
  error: null,
};

export const fetchProductsThunk = createAsyncThunk(
  "products/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const data = await api.get("/products");
      return data;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const addProductThunk = createAsyncThunk(
  "products/add",
  async (product: Omit<Product, "id" | "rating" | "slug">, { rejectWithValue }) => {
    try {
      const data = await api.post("/products", product);
      return data;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateProductThunk = createAsyncThunk(
  "products/update",
  async ({ id, updated }: { id: string; updated: Partial<Product> }, { rejectWithValue }) => {
    try {
      const data = await api.put(`/products/${id}`, updated);
      return data;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const deleteProductThunk = createAsyncThunk(
  "products/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await api.del(`/products/${id}`);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const bulkDeleteProductsThunk = createAsyncThunk(
  "products/bulkDelete",
  async (ids: string[], { rejectWithValue }) => {
    try {
      await api.post("/products/bulk-delete", { ids });
      return ids;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const bulkUpdateProductsThunk = createAsyncThunk(
  "products/bulkUpdate",
  async ({ ids, updates }: { ids: string[]; updates: Partial<Product> }, { rejectWithValue }) => {
    try {
      await api.post("/products/bulk-update", { ids, updates });
      return { ids, updates };
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProductsThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProductsThunk.fulfilled, (state, action: PayloadAction<Product[]>) => {
        state.loading = false;
        state.products = action.payload;
      })
      .addCase(fetchProductsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Add Product
      .addCase(addProductThunk.fulfilled, (state, action: PayloadAction<Product>) => {
        state.products.unshift(action.payload);
      })
      // Update Product
      .addCase(updateProductThunk.fulfilled, (state, action: PayloadAction<Product>) => {
        const index = state.products.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) {
          state.products[index] = action.payload;
        }
      })
      // Delete Product
      .addCase(deleteProductThunk.fulfilled, (state, action: PayloadAction<string>) => {
        state.products = state.products.filter((p) => p.id !== action.payload);
      })
      // Bulk Delete
      .addCase(bulkDeleteProductsThunk.fulfilled, (state, action: PayloadAction<string[]>) => {
        state.products = state.products.filter((p) => !action.payload.includes(p.id));
      })
      // Bulk Update
      .addCase(bulkUpdateProductsThunk.fulfilled, (state, action: PayloadAction<{ ids: string[]; updates: Partial<Product> }>) => {
        state.products = state.products.map((p) =>
          action.payload.ids.includes(p.id) ? { ...p, ...action.payload.updates } : p
        );
      });
  },
});

export default productsSlice.reducer;
