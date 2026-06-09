import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "@/utils/api";
import { User } from "@/types/user";


interface AuthState {
  currentUser: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  currentUser: null,
  token: typeof window !== "undefined" ? localStorage.getItem("athletica_token") : null,
  loading: false,
  error: null,
};

export const loginUserThunk = createAsyncThunk(
  "auth/login",
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const data = await api.post("/auth/login", credentials);
      if (typeof window !== "undefined" && data.token) {
        localStorage.setItem("athletica_token", data.token);
      }
      return data; // returns { token, user }
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const registerUserThunk = createAsyncThunk(
  "auth/register",
  async (userData: { name: string; email: string; mobile: string; password: string }, { rejectWithValue }) => {
    try {
      const data = await api.post("/auth/register", userData);
      if (typeof window !== "undefined" && data.token) {
        localStorage.setItem("athletica_token", data.token);
      }
      return data; // returns { token, user }
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchProfileThunk = createAsyncThunk(
  "auth/fetchProfile",
  async (_, { rejectWithValue }) => {
    try {
      const user = await api.get("/auth/profile");
      return user;
    } catch (err: any) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("athletica_token");
      }
      return rejectWithValue(err.message);
    }
  }
);

export const updateProfileThunk = createAsyncThunk(
  "auth/updateProfile",
  async (profileData: { name: string; mobile: string }, { rejectWithValue }) => {
    try {
      const data = await api.put("/auth/profile", profileData);
      return data.user;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logoutUser: (state) => {
      state.currentUser = null;
      state.token = null;
      state.error = null;
      if (typeof window !== "undefined") {
        localStorage.removeItem("athletica_token");
      }
    },
    clearAuthError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUserThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUserThunk.fulfilled, (state, action: PayloadAction<{ token: string; user: User }>) => {
        state.loading = false;
        state.currentUser = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(loginUserThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Register
      .addCase(registerUserThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUserThunk.fulfilled, (state, action: PayloadAction<{ token: string; user: User }>) => {
        state.loading = false;
        state.currentUser = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(registerUserThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Profile
      .addCase(fetchProfileThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProfileThunk.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false;
        state.currentUser = action.payload;
      })
      .addCase(fetchProfileThunk.rejected, (state) => {
        state.loading = false;
        state.currentUser = null;
        state.token = null;
      })
      // Update Profile
      .addCase(updateProfileThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateProfileThunk.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false;
        state.currentUser = action.payload;
      })
      .addCase(updateProfileThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logoutUser, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
