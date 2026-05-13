import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const uploadPhotoAction = createAsyncThunk(
  'photos/upload',
  async ({ file, category }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('category', category);

      // Change this URL to your actual backend address
      const response = await axios.post('https://smart-photo-backend-production.up.railway.app/api/photos/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Server Upload Failed");
    }
  }
);

const photoSlice = createSlice({
  name: 'photos',
  initialState: { 
    gallery: [], 
    loading: false, 
    error: null 
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(uploadPhotoAction.pending, (state) => { 
        state.loading = true; 
    })
      .addCase(uploadPhotoAction.fulfilled, (state, action) => {
        state.loading = false;
        state.gallery.push(action.payload);
      })
      .addCase(uploadPhotoAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export default photoSlice.reducer;