import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_URL = "https://smart-photo-backend-production.up.railway.app/api";

// ─────────────────────────────────────────────
// SAFE AUTH HEADER (FIXED)
// ─────────────────────────────────────────────
const authHeader = () => {
  try {
    const raw = localStorage.getItem("token");
    if (!raw) return {};

    try {
      const parsed = JSON.parse(raw);
      const token = parsed?.accessToken || parsed?.token;

      return token ? { Authorization: `Bearer ${token}` } : {};
    } catch {
      return { Authorization: `Bearer ${raw}` };
    }
  } catch {
    return {};
  }
};

// ─────────────────────────────────────────────
// THUNKS
// ─────────────────────────────────────────────
export const uploadPhotoAction = createAsyncThunk(
  "photos/upload",
  async ({ file, category, peopleTag }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("images", file);
      formData.append("category", category);
      formData.append("hasPeople", peopleTag !== "Solo");
      formData.append(
        "faces",
        peopleTag === "Group" ? "3" : peopleTag === "Couple" ? "2" : "1"
      );

      const { data } = await axios.post(
        `${BASE_URL}/photos/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            ...authHeader(),
          },
        }
      );

      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Upload failed");
    }
  }
);

// ─────────────────────────────────────────────
// FETCH ALL
// ─────────────────────────────────────────────
export const fetchAllPhotos = createAsyncThunk(
  "photos/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${BASE_URL}/photos`, {
        headers: authHeader(),
      });
      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// ─────────────────────────────────────────────
// UTIL
// ─────────────────────────────────────────────
const toArray = (payload) =>
  Array.isArray(payload) ? payload : payload?.photos ?? payload?.data ?? [];

// ─────────────────────────────────────────────
// SLICE
// ─────────────────────────────────────────────
const photoSlice = createSlice({
  name: "photos",

  initialState: {
    gallery: [],
    displayedPhotos: [],
    loading: false,
    error: null,
  },

  reducers: {
    // used after /api/analyze
    addPhotoToStore(state, action) {
      const photo = action.payload;

      const id = photo?._id || photo?.id;
      if (!id) return;

      // ❗ prevent duplicates (IMPORTANT FIX)
      const exists = state.gallery.some((p) => (p._id || p.id) === id);
      if (exists) return;

      state.gallery.unshift(photo);
      state.displayedPhotos.unshift(photo);
    },

    clearDisplayedPhotos(state) {
      state.displayedPhotos = state.gallery;
    },

    clearError(state) {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(uploadPhotoAction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadPhotoAction.fulfilled, (state, action) => {
        state.loading = false;

        const photo = action.payload?.photo || action.payload;
        const id = photo?._id || photo?.id;

        if (!id) return;

        const exists = state.gallery.some((p) => (p._id || p.id) === id);
        if (exists) return;

        state.gallery.unshift(photo);
        state.displayedPhotos.unshift(photo);
      })
      .addCase(uploadPhotoAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder
      .addCase(fetchAllPhotos.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllPhotos.fulfilled, (state, action) => {
        state.loading = false;

        const list = toArray(action.payload);

        state.gallery = list;
        state.displayedPhotos = list;
      })
      .addCase(fetchAllPhotos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  addPhotoToStore,
  clearDisplayedPhotos,
  clearError,
} = photoSlice.actions;

export default photoSlice.reducer;