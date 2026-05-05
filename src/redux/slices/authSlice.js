import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";


// ===================== REGISTER =====================
export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (userData, { rejectWithValue }) => {
    try {
      const { name, email, password } = userData;

      if (!name || !email || !password) {
        return rejectWithValue("Name, email, and password are required");
      }

      const res = await axios.post(
        "https://smart-photo-organizer-backend-production.up.railway.app/api/auth/register",
        { name, email, password },
        {
          headers: { "Content-Type": "application/json" },
          timeout: 10000,
        }
      );

      if (!res.data.success) {
        throw new Error(res.data.message || "Registration failed");
      }

      return {
        success: true,
        message: res.data.message,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Something went wrong"
      );
    }
  }
);


// ===================== LOGIN =====================
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (userData, { rejectWithValue }) => {
    try {
      const { email, password } = userData;

      if (!email || !password) {
        return rejectWithValue("Email and password are required");
      }

      const res = await axios.post(
        "https://smart-photo-organizer-backend-production.up.railway.app/api/auth/login",
        { email, password },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
          timeout: 10000,
        }
      );

      if (!res.data.success) {
        throw new Error(res.data.message || "Login failed");
      }

      return {
        success: true,
        message: res.data.message,
        user: res.data.user || null,
        token: res.data.token || null,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Something went wrong"
      );
    }
  }
);


// ===================== INITIAL STATE (PERSIST FIX) =====================
const initialState = {
  loading: false,
  error: null,
  registerSuccess: false,
  loginSuccess: false,
  message: null,

  user:
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("user"))
      : null,

  token:
    typeof window !== "undefined"
      ? localStorage.getItem("token")
      : null,
};


// ===================== SLICE =====================
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    resetAuthState: (state) => {
      state.loading = false;
      state.error = null;
      state.registerSuccess = false;
      state.loginSuccess = false;
      state.message = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // ================= REGISTER =================
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.registerSuccess = false;
        state.message = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.registerSuccess = true;
        state.message = action.payload.message;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.registerSuccess = false;
      })


      // ================= LOGIN =================
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.loginSuccess = false;
        state.message = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.loginSuccess = true;
        state.message = action.payload.message;

        state.user = action.payload.user;
        state.token = action.payload.token;

        // PERSIST LOGIN
        if (typeof window !== "undefined") {
          localStorage.setItem("user", JSON.stringify(action.payload.user));
          localStorage.setItem("token", action.payload.token);
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.loginSuccess = false;
      });
  },
});

export const { resetAuthState } = authSlice.actions;
export default authSlice.reducer;