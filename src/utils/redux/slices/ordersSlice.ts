import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "@/utils/api";
import { Order, OrderAddress } from "@/types/order";


interface OrdersState {
  orders: Order[];
  loading: boolean;
  error: string | null;
}

const initialState: OrdersState = {
  orders: [],
  loading: false,
  error: null,
};

export const fetchOrdersThunk = createAsyncThunk(
  "orders/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const data = await api.get("/orders");
      return data;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const placeOrderThunk = createAsyncThunk(
  "orders/place",
  async (
    payload: {
      address: OrderAddress;
      paymentMethod: string;
      couponCode?: string | null;
      razorpay_payment_id?: string | null;
      razorpay_order_id?: string | null;
      razorpay_signature?: string | null;
    },
    { rejectWithValue }
  ) => {
    try {
      const data = await api.post("/orders", payload);
      return data; // returns full response object
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateOrderStatusThunk = createAsyncThunk(
  "orders/updateStatus",
  async (
    payload: { orderId: string; status: Order["status"]; description?: string },
    { rejectWithValue }
  ) => {
    const { orderId, status, description } = payload;
    try {
      const data = await api.put(`/orders/${orderId}/status`, { status, description });
      return data.order;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

const ordersSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrdersThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchOrdersThunk.fulfilled, (state, action: PayloadAction<Order[]>) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(fetchOrdersThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Place Order
      .addCase(placeOrderThunk.fulfilled, (state, action: PayloadAction<any>) => {
        if (action.payload.order) {
          state.orders.unshift(action.payload.order);
        }
      })
      // Update Status
      .addCase(updateOrderStatusThunk.fulfilled, (state, action: PayloadAction<Order>) => {
        const index = state.orders.findIndex((o) => o.id === action.payload.id);
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
      });
  },
});

export default ordersSlice.reducer;
