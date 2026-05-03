import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

export const registerUser = createAsyncThunk(
    "auth/registerUser",
    async (userData, {rejectWithValue}) => {
        try {
            const {name, email, password} = userData;

            if(!name || !email || !password) {
                return rejectWithValue (" Name, email, and password are required")
            }

            const res = await axios.post(
                "https://smart-photo-organizer-backend-production.up.railway.app/api/auth/register",
                { name, email, password },
                {
                headers: {
                    "Content-Type": "application/json",
                },
                timeout: 10000,
                }
            );

            if(!res.data.success) {
                throw new Error (res.data.message || "Registration failed")
            }

            return {
                success: true,
                message: res.data.message || "User created successfully",
            };


        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || error.message || "Something went wrong"
            );
        }
    }
)


const authSlice = createSlice({
    name: "auth",
    initialState: {
        loading: false,
        error: null,
        success: false,
        message: null,
    },
    reducers: {
        resetAuthState: (state) => {
            state.loading = false;
            state.error = null;
            state.success = false;
            state.message = null;
        },
    },

    extraReducers: (builder) => {
        builder
        .addCase(registerUser.pending, (state) => {
            state.loading = false;
            state.error = null;
            state.success = false;
        })

        .addCase(registerUser.fulfilled, (state, action) => {
            state.loading = true;
            state.success = true;
            state.message = action.payload.message;
        })

        .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
    }
})


export const { resetAuthState } = authSlice.actions;
export default authSlice.reducer;