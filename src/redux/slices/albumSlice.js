import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const BACKEND_URL = 'https://smart-photo-backend-production.up.railway.app';

const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
};

// ─── ASYNC THUNKS FOR DATABASE ACTIONS ───────────────────────────────────────

// Fetch All Albums (GET /api/album)
export const fetchAlbums = createAsyncThunk(
  'albums/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/album`, {
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      if (!data.success) return rejectWithValue(data.message || 'Failed to fetch data.');
      return data.data; 
    } catch (error) {
      return rejectWithValue(error.message || 'Network connectivity fault');
    }
  }
);

/**
 * Create New Album (POST /api/album)
 */
export const createAlbum = createAsyncThunk(
  'albums/create',
  async (albumPayload, { rejectWithValue }) => {
    try {
      console.log('📦 Creating album with payload:', albumPayload);
      console.log('📸 Selected photos count:', albumPayload.photos?.length);
      
      const requestBody = {
        title: albumPayload.title,
        description: albumPayload.description,
        type: albumPayload.type || 'private',
        tier: albumPayload.tier || 'Root',
        parentFolderId: albumPayload.parentFolderId || null,
        category: albumPayload.category || 'general',
        photos: albumPayload.photos || [],
      };
      
      console.log('📤 Sending to backend:', requestBody);
      
      const response = await fetch(`${BACKEND_URL}/api/album`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(requestBody),
      });
      const data = await response.json();
      console.log('📥 Backend response:', data);
      
      if (!data.success) return rejectWithValue(data.message || 'Failed to create album.');
      return data.data;
    } catch (error) {
      console.error('❌ Create album error:', error);
      return rejectWithValue(error.message || 'Failed to connect to the server.');
    }
  }
);

// Update Album (PUT /api/album/:id)
export const updateAlbum = createAsyncThunk(
  'albums/update',
  async ({ id, title, description, type, tier, parentFolderId, category }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/album/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ title, description, type, tier, parentFolderId, category }),
      });
      const data = await response.json();
      if (!data.success) return rejectWithValue(data.message || 'Failed to update album.');
      return data.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update album.');
    }
  }
);

// Add Photos to Album (PUT /api/album/:id/photos)
export const addPhotosToAlbum = createAsyncThunk(
  'albums/addPhotos',
  async ({ albumId, photoIds }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/album/${albumId}/photos`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ photoIds }),
      });
      const data = await response.json();
      if (!data.success) return rejectWithValue(data.message || 'Failed to add photos.');
      return data.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to add photos.');
    }
  }
);

// Remove Photos from Album (DELETE /api/album/:id/photos)
export const removePhotosFromAlbum = createAsyncThunk(
  'albums/removePhotos',
  async ({ albumId, photoIds }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/album/${albumId}/photos`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
        body: JSON.stringify({ photoIds }),
      });
      const data = await response.json();
      if (!data.success) return rejectWithValue(data.message || 'Failed to remove photos.');
      return data.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to remove photos.');
    }
  }
);

// Toggle Favorite Status (PUT /api/album/:id/favorite)
export const toggleFavoriteAlbum = createAsyncThunk(
  'albums/toggleFavorite',
  async (albumId, { rejectWithValue }) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/album/${albumId}/favorite`, {
        method: 'PUT',
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      if (!data.success) return rejectWithValue(data.message || 'Failed to toggle favorite.');
      return data.data; 
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to toggle favorite.');
    }
  }
);

// Delete Album (DELETE /api/album/:id)
export const deleteAlbum = createAsyncThunk(
  'albums/delete',
  async (albumId, { rejectWithValue }) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/album/${albumId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(), 
      });
      const data = await response.json();
      if (!data.success) return rejectWithValue(data.message || 'Failed to delete album.');
      return albumId; 
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to delete album.');
    }
  }
);

// ─── INITIAL STATE & EXTRA REDUCERS ──────────────────────────────────────────
const initialState = {
  items: [],
  loading: false,
  submitting: false,
  error: null,
};

const albumSlice = createSlice({
  name: 'albums',
  initialState,
  reducers: {
    clearAlbumErrors: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Lifecycle
      .addCase(fetchAlbums.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAlbums.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        if (action.payload && Array.isArray(action.payload)) {
          state.items = action.payload;
        } else if (action.payload && action.payload.data && Array.isArray(action.payload.data)) {
          state.items = action.payload.data;
        } else {
          state.items = [];
        }
        console.log('✅ Albums loaded:', state.items.length);
      })
      .addCase(fetchAlbums.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch albums.';
      })

      // Create Lifecycle
      .addCase(createAlbum.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(createAlbum.fulfilled, (state, action) => {
        state.submitting = false;
        state.error = null;
        if (!Array.isArray(state.items)) state.items = [];
        if (action.payload) {
          state.items.unshift(action.payload);
          console.log('✅ Album created with photos:', action.payload.photos?.length);
        }
      })
      .addCase(createAlbum.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload || 'Failed to create album.';
        console.error('❌ Create album rejected:', state.error);
      })

      // Update Lifecycle
      .addCase(updateAlbum.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(updateAlbum.fulfilled, (state, action) => {
        state.submitting = false;
        if (!action.payload || !Array.isArray(state.items)) return;
        const index = state.items.findIndex(item => (item._id || item.id) === (action.payload._id || action.payload.id));
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(updateAlbum.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload || 'Failed to update album.';
      })

      // Add Photos Lifecycle
      .addCase(addPhotosToAlbum.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(addPhotosToAlbum.fulfilled, (state, action) => {
        state.submitting = false;
        if (!action.payload || !Array.isArray(state.items)) return;
        const index = state.items.findIndex(item => (item._id || item.id) === (action.payload._id || action.payload.id));
        if (index !== -1) {
          state.items[index] = action.payload;
          console.log('✅ Photos added to album, new count:', action.payload.photos?.length);
        }
      })
      .addCase(addPhotosToAlbum.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload || 'Failed to add photos.';
      })

      // Remove Photos Lifecycle
      .addCase(removePhotosFromAlbum.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(removePhotosFromAlbum.fulfilled, (state, action) => {
        state.submitting = false;
        if (!action.payload || !Array.isArray(state.items)) return;
        const index = state.items.findIndex(item => (item._id || item.id) === (action.payload._id || action.payload.id));
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(removePhotosFromAlbum.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload || 'Failed to remove photos.';
      })

      // Toggle Favorite Lifecycle
      .addCase(toggleFavoriteAlbum.fulfilled, (state, action) => {
        if (!action.payload || !Array.isArray(state.items)) return;
        const index = state.items.findIndex(item => (item._id || item.id) === (action.payload._id || action.payload.id));
        if (index !== -1) {
          state.items[index] = action.payload; 
        }
      })
      .addCase(toggleFavoriteAlbum.rejected, (state, action) => {
        state.error = action.payload || 'Failed to toggle favorite.';
      })

      // Delete Lifecycle
      .addCase(deleteAlbum.fulfilled, (state, action) => {
        if (!Array.isArray(state.items)) return;
        state.items = state.items.filter(item => (item._id || item.id) !== action.payload);
        console.log('✅ Album deleted');
      })
      .addCase(deleteAlbum.rejected, (state, action) => {
        state.error = action.payload || 'Failed to delete album.';
      });
  },
});

export const { clearAlbumErrors } = albumSlice.actions;
export default albumSlice.reducer;