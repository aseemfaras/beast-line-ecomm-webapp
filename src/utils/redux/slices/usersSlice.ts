import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "@/utils/api";
import { User } from "@/types/user";


interface UsersState {
  users: User[];
  loading: boolean;
  error: string | null;
}

const initialState: UsersState = {
  users: [],
  loading: false,
  error: null,
};

export const fetchUsersThunk = createAsyncThunk(
  "users/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const data = await api.get("/users");
      return data;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateUserStatusThunk = createAsyncThunk(
  "users/updateStatus",
  async (payload: { userId: string; blocked: boolean }, { rejectWithValue }) => {
    const { userId, blocked } = payload;
    try {
      const data = await api.put(`/users/${userId}/block`, { blocked });
      return { userId, blocked: data.user.blocked };
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const deleteUserThunk = createAsyncThunk(
  "users/delete",
  async (userId: string, { rejectWithValue }) => {
    try {
      await api.del(`/users/${userId}`);
      return userId;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsersThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUsersThunk.fulfilled, (state, action: PayloadAction<User[]>) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsersThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update User Block
      .addCase(updateUserStatusThunk.fulfilled, (state, action: PayloadAction<{ userId: string; blocked: boolean }>) => {
        const index = state.users.findIndex((u) => u.id === action.payload.userId);
        if (index !== -1) {
          state.users[index].blocked = action.payload.blocked;
        }
      })
      // Delete User
      .addCase(deleteUserThunk.fulfilled, (state, action: PayloadAction<string>) => {
        state.users = state.users.filter((u) => u.id !== action.payload);
      });
  },
});

export default usersSlice.reducer;
