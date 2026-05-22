import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_URL = "https://smart-photo-backend-production.up.railway.app/api";

// ─────────────────────────────────────────────
// SAFE JSON PARSE (prevents crashes)
// ─────────────────────────────────────────────
const safeJSONParse = (value) => {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

// ─────────────────────────────────────────────
// AUTH THUNKS
// ─────────────────────────────────────────────

export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (userData, { rejectWithValue }) => {
    try {
      const { name, email, password } = userData;

      if (!name || !email || !password) {
        return rejectWithValue("Name, email, and password are required");
      }

      const res = await axios.post(
        `${BASE_URL}/auth/register`,
        { name, email, password },
        {
          headers: { "Content-Type": "application/json" },
          timeout: 10000,
        }
      );

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

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (userData, { rejectWithValue }) => {
    try {
      const { email, password } = userData;

      if (!email || !password) {
        return rejectWithValue("Email and password are required");
      }

      const res = await axios.post(
        `${BASE_URL}/auth/login`,
        { email, password },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
          timeout: 10000,
        }
      );

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

export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async ({ email }, { rejectWithValue }) => {
    try {
      const res = await axios.post(
        `${BASE_URL}/auth/forget-password`,
        { email },
        { headers: { "Content-Type": "application/json" } }
      );

      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to send OTP"
      );
    }
  }
);

export const verifyOtp = createAsyncThunk(
  "auth/verifyOtp",
  async ({ email, otp }, { rejectWithValue }) => {
    try {
      const res = await axios.post(
        `${BASE_URL}/auth/verify-otp`,
        { email, otp },
        { headers: { "Content-Type": "application/json" } }
      );

      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "OTP verification failed"
      );
    }
  }
);

export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async ({ email, otp, password }, { rejectWithValue }) => {
    try {
      const res = await axios.post(
        `${BASE_URL}/auth/reset-password`,
        { email, otp, password },
        { headers: { "Content-Type": "application/json" } }
      );

      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Password reset failed"
      );
    }
  }
);

export const googleLoginUser = createAsyncThunk(
  "auth/googleLoginUser",
  async ({ token }, { rejectWithValue }) => {
    try {
      const res = await axios.post(
        `${BASE_URL}/auth/google`,
        { token },
        { headers: { "Content-Type": "application/json" } }
      );

      return {
        success: true,
        message: res.data.message,
        user: res.data.data || null,
        token: res.data.token || null,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Google login failed"
      );
    }
  }
);

// ─────────────────────────────────────────────
// INITIAL STATE (FIXED SAFELY)
// ─────────────────────────────────────────────

const initialState = {
  loading: false,
  error: null,
  registerSuccess: false,
  loginSuccess: false,
  message: null,
  forgotSuccess: false,
  otpVerified: false,
  resetSuccess: false,

  user:
    typeof window !== "undefined"
      ? safeJSONParse(localStorage.getItem("user"))
      : null,

  token:
    typeof window !== "undefined"
      ? localStorage.getItem("token")
      : null,
};

// ─────────────────────────────────────────────
// SLICE
// ─────────────────────────────────────────────

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

      // REGISTER
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.registerSuccess = true;
        state.message = action.payload.message;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // LOGIN
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.loginSuccess = true;
        state.message = action.payload.message;

        state.user = action.payload.user || null;
        state.token = action.payload.token || null;

        if (typeof window !== "undefined") {
          localStorage.setItem("user", JSON.stringify(state.user));
          localStorage.setItem("token", state.token);
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // FORGOT PASSWORD
      .addCase(forgotPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.loading = false;
        state.forgotSuccess = true;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // VERIFY OTP
      .addCase(verifyOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyOtp.fulfilled, (state) => {
        state.loading = false;
        state.otpVerified = true;
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // RESET PASSWORD
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.loading = false;
        state.resetSuccess = true;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // GOOGLE LOGIN
      .addCase(googleLoginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(googleLoginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.loginSuccess = true;
        state.message = action.payload.message;

        state.user = action.payload.user || null;
        state.token = action.payload.token || null;

        if (typeof window !== "undefined") {
          localStorage.setItem("user", JSON.stringify(state.user));
          localStorage.setItem("token", state.token);
        }
      })
      .addCase(googleLoginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetAuthState } = authSlice.actions;
export default authSlice.reducer;