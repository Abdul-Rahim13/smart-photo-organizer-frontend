import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API = "https://smart-photo-backend-production.up.railway.app/api/photos";
const BASE_URL = "https://smart-photo-backend-production.up.railway.app";

// ─────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────
const getAuthHeaders = () => {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ─────────────────────────────────────────────
// CLOUDINARY URL HANDLER
// ─────────────────────────────────────────────
const resolveCloudinaryUrl = (url) => {
  if (!url) return null;
  
  // If it's already a Cloudinary URL or any HTTPS URL
  if (url.startsWith('https://res.cloudinary.com') || url.startsWith('https://') || url.startsWith('http://')) {
    // Convert http to https for security
    return url.replace('http://', 'https://');
  }
  
  // If it's a relative path from Cloudinary
  if (url.startsWith('/')) {
    return `${BASE_URL}${url}`;
  }
  
  return url;
};

// ─────────────────────────────────────────────
// NORMALIZE PHOTO (with Cloudinary support)
// ─────────────────────────────────────────────
const normalizePhoto = (photo) => {
  if (!photo) return null;
  
  const id = photo._id || photo.id;
  if (!id) return null;

  // Handle Cloudinary URL priority
  let imageUrl = null;
  if (photo.imageUrl) {
    imageUrl = resolveCloudinaryUrl(photo.imageUrl);
  } else if (photo.url) {
    imageUrl = resolveCloudinaryUrl(photo.url);
  } else if (photo.secure_url) {
    imageUrl = resolveCloudinaryUrl(photo.secure_url);
  } else if (photo.publicId) {
    // Construct Cloudinary URL from publicId
    imageUrl = `https://res.cloudinary.com/${process.env.REACT_APP_CLOUD_NAME || 'your-cloud-name'}/image/upload/${photo.publicId}`;
  }

  return {
    ...photo,
    id,
    title: photo.title || photo.originalName || photo.originalname || `Photo-${String(id).slice(-6)}`,
    url: imageUrl,
    category: photo.sceneCategory || photo.category || "General",
    environment: photo.environment || "Indoor",
    socialGroup: photo.socialGroup || "Empty",
    faces: photo.faceCount || photo.faces || 0,
    score: photo.aiScore || photo.qualityScore || photo.score || 0,
    size: photo.size || photo.fileSize || "—",
    date: photo.createdAt ? new Date(photo.createdAt).toISOString().slice(0, 10) : "—",
    starred: photo.starred || photo.isFavorite || photo.isStarred || false,
    publicId: photo.publicId || null,
  };
};

// ─────────────────────────────────────────────
// THUNKS
// ─────────────────────────────────────────────
export const fetchAllPhotos = createAsyncThunk(
  "photos/fetchAll",
  async (_, thunkAPI) => {
    try {
      const res = await axios.get(API, { headers: getAuthHeaders() });
      const payload = res.data?.data || res.data?.photos || res.data;
      return Array.isArray(payload) ? payload : [];
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Fetch failed");
    }
  }
);

export const searchPhotos = createAsyncThunk(
  "photos/search",
  async (searchTerm, thunkAPI) => {
    try {
      const res = await axios.get(`${API}/search?q=${encodeURIComponent(searchTerm)}`, {
        headers: getAuthHeaders(),
      });
      const payload = res.data?.data || res.data?.photos || res.data;
      return Array.isArray(payload) ? payload : [];
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Search failed");
    }
  }
);

export const fetchPhotosByScene = createAsyncThunk(
  "photos/byScene",
  async (scene, thunkAPI) => {
    try {
      const res = await axios.get(`${API}/scene/${scene}`, { headers: getAuthHeaders() });
      const payload = res.data?.data || res.data?.photos || res.data;
      return Array.isArray(payload) ? payload : [];
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Scene fetch failed");
    }
  }
);

export const filterPhotos = createAsyncThunk(
  "photos/filter",
  async (params, thunkAPI) => {
    try {
      const query = new URLSearchParams(params).toString();
      const res = await axios.get(`${API}/filter?${query}`, { headers: getAuthHeaders() });
      const payload = res.data?.data || res.data?.photos || res.data;
      return Array.isArray(payload) ? payload : [];
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Filter failed");
    }
  }
);

export const deletePhotoAction = createAsyncThunk(
  "photos/delete",
  async (id, thunkAPI) => {
    try {
      await axios.delete(`${API}/${id}`, { headers: getAuthHeaders() });
      return id;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Delete failed");
    }
  }
);

export const toggleStarred = createAsyncThunk(
  "photos/star",
  async (id, thunkAPI) => {
    try {
      const res = await axios.patch(`${API}/${id}/star`, {}, { headers: getAuthHeaders() });
      return res.data?.data || res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Star failed");
    }
  }
);

// ─── ADD THIS NEW FUNCTION ─────────────────────────────────────────────
export const updatePhotoMetadata = createAsyncThunk(
  "photos/updateMetadata",
  async ({ id, metadata }, thunkAPI) => {
    try {
      const res = await axios.put(`${API}/${id}/metadata`, metadata, { headers: getAuthHeaders() });
      return res.data?.data || res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Update metadata failed");
    }
  }
);
// ───────────────────────────────────────────────────────────────────────

export const addPhotoToStore = createAsyncThunk(
  "photos/addPhoto",
  async (photoData) => {
    return photoData;
  }
);

// ─────────────────────────────────────────────
// INITIAL STATE
// ─────────────────────────────────────────────
const initialState = {
  items: [],
  displayedPhotos: [],
  loading: false,
  error: null,
};

// ─────────────────────────────────────────────
// SLICE
// ─────────────────────────────────────────────
const photoSlice = createSlice({
  name: "photos",
  initialState,
  reducers: {
    clearDisplayedPhotos: (state) => {
      state.displayedPhotos = state.items;
    },
    clearPhotoStore: (state) => {
      state.items = [];
      state.displayedPhotos = [];
    },
  },
  extraReducers: (builder) => {
    // FETCH ALL
    builder
      .addCase(fetchAllPhotos.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllPhotos.fulfilled, (state, action) => {
        state.loading = false;
        const photos = action.payload.map(normalizePhoto).filter(Boolean);
        state.items = photos;
        state.displayedPhotos = photos;
        console.log("✅ LOADED with Cloudinary URLs:", photos);
      })
      .addCase(fetchAllPhotos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Fetch failed";
      });

    // SEARCH
    builder.addCase(searchPhotos.fulfilled, (state, action) => {
      state.displayedPhotos = action.payload.map(normalizePhoto).filter(Boolean);
    });

    // FILTER
    builder.addCase(filterPhotos.fulfilled, (state, action) => {
      state.displayedPhotos = action.payload.map(normalizePhoto).filter(Boolean);
    });

    // SCENE
    builder.addCase(fetchPhotosByScene.fulfilled, (state, action) => {
      state.displayedPhotos = action.payload.map(normalizePhoto).filter(Boolean);
    });

    // DELETE
    builder.addCase(deletePhotoAction.fulfilled, (state, action) => {
      const id = action.payload;
      state.items = state.items.filter((p) => p.id !== id);
      state.displayedPhotos = state.displayedPhotos.filter((p) => p.id !== id);
    });

    // STAR
    builder.addCase(toggleStarred.fulfilled, (state, action) => {
      const updated = normalizePhoto(action.payload);
      if (!updated) return;
      const updateArray = (arr) => arr.map((p) => (p.id === updated.id ? { ...p, ...updated } : p));
      state.items = updateArray(state.items);
      state.displayedPhotos = updateArray(state.displayedPhotos);
    });

    // UPDATE METADATA - ADD THIS CASE
    builder.addCase(updatePhotoMetadata.fulfilled, (state, action) => {
      const updated = normalizePhoto(action.payload);
      if (!updated) return;
      const updateArray = (arr) => arr.map((p) => (p.id === updated.id ? { ...p, ...updated } : p));
      state.items = updateArray(state.items);
      state.displayedPhotos = updateArray(state.displayedPhotos);
    });

    // ADD PHOTO
    builder.addCase(addPhotoToStore.fulfilled, (state, action) => {
      const normalized = normalizePhoto(action.payload);
      if (!normalized) return;
      state.items.unshift(normalized);
      state.displayedPhotos.unshift(normalized);
    });

    // GENERIC PENDING
    builder.addMatcher((action) => action.type.endsWith("/pending"), (state) => {
      state.loading = true;
    });

    // GENERIC REJECTED
    builder.addMatcher((action) => action.type.endsWith("/rejected"), (state, action) => {
      state.loading = false;
      state.error = action.payload || "Something went wrong";
    });
  },
});

export const { clearDisplayedPhotos, clearPhotoStore } = photoSlice.actions;
export default photoSlice.reducer;