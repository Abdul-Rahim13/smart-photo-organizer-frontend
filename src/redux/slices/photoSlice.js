import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API = "/api/photos";

// Helper function to extract auth token safely from browser memory
const getAuthHeaders = () => {
  const token = localStorage.getItem("token") || sessionStorage.getItem("token") || "";
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ── ASYNC THUNKS MATCHING GALLERY IMPORTS ───────────────────────────────────

export const uploadPhotosAction = createAsyncThunk("photos/upload", async (formData, thunkAPI) => {
  try {
    const res = await axios.post(`${API}/upload`, formData, {
      headers: { "Content-Type": "multipart/form-data", ...getAuthHeaders() },
    });
    return res.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || "Upload failed");
  }
});

export const fetchAllPhotos = createAsyncThunk("photos/fetchAll", async (_, thunkAPI) => {
  try {
    const res = await axios.get(API, { headers: getAuthHeaders() });
    return res.data.data || res.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || "Fetch failed");
  }
});

export const filterPhotos = createAsyncThunk("photos/filter", async (params, thunkAPI) => {
  try {
    const query = new URLSearchParams(params).toString();
    const res = await axios.get(`${API}/filter?${query}`, { headers: getAuthHeaders() });
    return res.data.data || res.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || "Filtering failed");
  }
});

export const fetchPhotosByScene = createAsyncThunk("photos/byScene", async (sceneType, thunkAPI) => {
  try {
    const res = await axios.get(`${API}/scene/${sceneType}`, { headers: getAuthHeaders() });
    return res.data.data || res.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || "Fetch by scene failed");
  }
});

export const searchPhotos = createAsyncThunk("photos/search", async (searchTerm, thunkAPI) => {
  try {
    const res = await axios.get(`${API}/search?q=${searchTerm}`, { headers: getAuthHeaders() });
    return res.data.data || res.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || "Search failed");
  }
});

export const deletePhotoAction = createAsyncThunk("photos/delete", async (id, thunkAPI) => {
  try {
    await axios.delete(`${API}/${id}`, { headers: getAuthHeaders() });
    return id;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || "Delete failed");
  }
});

export const toggleStarred = createAsyncThunk("photos/star", async (id, thunkAPI) => {
  try {
    const res = await axios.patch(`${API}/${id}/star`, {}, { headers: getAuthHeaders() });
    return res.data.data || res.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || "Star toggle failed");
  }
});

// Extra endpoints from route mapping
export const fetchTopPhotos = createAsyncThunk("photos/fetchTop", async (_, thunkAPI) => {
  try { const res = await axios.get(`${API}/top`, { headers: getAuthHeaders() }); return res.data.data || res.data; } catch (err) { return thunkAPI.rejectWithValue(err.response?.data?.message); }
});
export const fetchPhotosWithFaces = createAsyncThunk("photos/withFaces", async (_, thunkAPI) => {
  try { const res = await axios.get(`${API}/faces`, { headers: getAuthHeaders() }); return res.data.data || res.data; } catch (err) { return thunkAPI.rejectWithValue(err.response?.data?.message); }
});
export const fetchFlaggedPhotos = createAsyncThunk("photos/flagged", async (_, thunkAPI) => {
  try { const res = await axios.get(`${API}/flagged`, { headers: getAuthHeaders() }); return res.data.data || res.data; } catch (err) { return thunkAPI.rejectWithValue(err.response?.data?.message); }
});
export const updatePhotoMetadataAction = createAsyncThunk("photos/updateMetadata", async ({ id, metadata }, thunkAPI) => {
  try { const res = await axios.put(`${API}/${id}/metadata`, metadata, { headers: getAuthHeaders() }); return res.data.data || res.data; } catch (err) { return thunkAPI.rejectWithValue(err.response?.data?.message); }
});

// ── DATA NORMALIZATION HELPER ──────────────────────────────────────────────
const normalizePhoto = (photo) => {
  if (!photo) return null;
  return {
    ...photo,
    category: photo.sceneCategory || photo.category || "General",
    environment: photo.environment || "Indoor",
    socialGroup: photo.socialGroup || "Empty",
    qualityScore: photo.qualityScore ?? photo.score ?? 90,
    url: photo.imageUrl || photo.url || "",
  };
};

// ── REDUX SLICE SETUP ──────────────────────────────────────────────────────
const initialState = {
  items: [],
  displayedPhotos: [],
  loading: false,
  error: null,
};

const photoSlice = createSlice({
  name: "photos",
  initialState,
  reducers: {
    addPhotoToStore: (state, action) => {
      const rawPhoto = action.payload;
      if (!rawPhoto?._id && !rawPhoto?.id) return;

      const normalized = normalizePhoto(rawPhoto);
      const exists = state.items.some((p) => p._id === normalized._id || p.id === normalized.id);

      if (!exists) {
        state.items.unshift(normalized);
        state.displayedPhotos.unshift(normalized);
      }
    },
    clearDisplayedPhotos: (state) => {
      state.displayedPhotos = state.items;
    },
    clearPhotoStore: (state) => {
      state.items = [];
      state.displayedPhotos = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // 1️⃣ SPECIFIC CASES MUST COME FIRST
      .addCase(uploadPhotosAction.fulfilled, (state, action) => {
        state.loading = false;
        const payloadData = action.payload.data || action.payload.photo || action.payload;
        const targetArray = Array.isArray(payloadData) ? payloadData : [payloadData];
        
        targetArray.forEach(rawItem => {
          const normalized = normalizePhoto(rawItem);
          if (normalized && !state.items.some(p => p._id === normalized._id)) {
            state.items.unshift(normalized);
            state.displayedPhotos.unshift(normalized);
          }
        });
      })
      .addCase(deletePhotoAction.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter((p) => p._id !== action.payload && p.id !== action.payload);
        state.displayedPhotos = state.displayedPhotos.filter((p) => p._id !== action.payload && p.id !== action.payload);
      })
      .addCase(toggleStarred.fulfilled, (state, action) => {
        state.loading = false;
        const updatedNormalized = normalizePhoto(action.payload);
        if (updatedNormalized) {
          const mapFunc = (p) => (p._id === updatedNormalized._id || p.id === updatedNormalized.id ? updatedNormalized : p);
          state.items = state.items.map(mapFunc);
          state.displayedPhotos = state.displayedPhotos.map(mapFunc);
        }
      })
      
      // 2️⃣ GENERIC MATCHERS MUST COME LAST
      .addMatcher(
        (action) => action.type.endsWith("/pending"),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) => action.type.endsWith("/rejected"),
        (state, action) => {
          state.loading = false;
          state.error = action.payload || "An unexpected error occurred";
        }
      )
      .addMatcher(
        (action) => action.type.endsWith("/fulfilled") && !action.type.includes("delete") && !action.type.includes("updateMetadata") && !action.type.includes("upload") && !action.type.includes("star"),
        (state, action) => {
          state.loading = false;
          const incomingData = Array.isArray(action.payload) ? action.payload : [];
          const cleanList = incomingData.map(normalizePhoto).filter(Boolean);
          state.items = cleanList;
          state.displayedPhotos = cleanList;
        }
      );
  },
});

export const { addPhotoToStore, clearDisplayedPhotos, clearPhotoStore } = photoSlice.actions;
export default photoSlice.reducer;