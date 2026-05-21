import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const BASE_URL = 'https://smart-photo-backend-production.up.railway.app/api';

// ─── Auth header helper ───────────────────────────────────────────────────────
const authHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
});

// ════════════════════════════════════════════════════════════════════════════════
//  THUNKS
// ════════════════════════════════════════════════════════════════════════════════

export const uploadPhotoAction = createAsyncThunk(
  'photos/upload',
  async ({ file, category, hasPeople }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', category);
      formData.append('hasPeople', hasPeople);

      // We forward the authHeader down to our Next route wrapper
      const { data } = await axios.post(
        '/api/upload-and-analyze',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            ...authHeader(), // Added here so the proxy endpoint can validate your session
          },
        }
      );
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Upload failed');
    }
  }
);

// ── GET /photos ────────────────────────────────────────────────────────────────
export const fetchAllPhotos = createAsyncThunk(
  'photos/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${BASE_URL}/photos`, {
        headers: authHeader(),
      });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch photos');
    }
  }
);

// ── GET /photos/search?query=xxx ───────────────────────────────────────────────
export const searchPhotos = createAsyncThunk(
  'photos/search',
  async (query, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${BASE_URL}/photos/search`, {
        params: { query },
        headers: authHeader(),
      });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Search failed');
    }
  }
);

// ── GET /photos/filter?minScore=&maxScore=&faces=&sortBy=&sortOrder= ───────────
export const filterPhotos = createAsyncThunk(
  'photos/filter',
  async (params = {}, { rejectWithValue }) => {
    try {
      const cleanParams = Object.fromEntries(
        Object.entries(params).filter(([, v]) => v !== undefined && v !== '')
      );
      const { data } = await axios.get(`${BASE_URL}/photos/filter`, {
        params: cleanParams,
        headers: authHeader(),
      });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Filter failed');
    }
  }
);

// ── GET /photos/scene/:type ────────────────────────────────────────────────────
export const fetchPhotosByScene = createAsyncThunk(
  'photos/byScene',
  async (sceneType, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${BASE_URL}/photos/scene/${sceneType}`, {
        headers: authHeader(),
      });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Scene fetch failed');
    }
  }
);

// ── GET /photos/top ────────────────────────────────────────────────────────────
export const fetchTopPhotos = createAsyncThunk(
  'photos/top',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${BASE_URL}/photos/top`, {
        headers: authHeader(),
      });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch top photos');
    }
  }
);

// ── GET /photos/faces ──────────────────────────────────────────────────────────
export const fetchPhotosWithFaces = createAsyncThunk(
  'photos/withFaces',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${BASE_URL}/photos/faces`, {
        headers: authHeader(),
      });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch face photos');
    }
  }
);

// ── GET /photos/flagged ────────────────────────────────────────────────────────
export const fetchFlaggedPhotos = createAsyncThunk(
  'photos/flagged',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${BASE_URL}/photos/flagged`, {
        headers: authHeader(),
      });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch flagged photos');
    }
  }
);

// ── DELETE /photos/:id ─────────────────────────────────────────────────────────
export const deletePhotoAction = createAsyncThunk(
  'photos/delete',
  async (photoId, { rejectWithValue }) => {
    try {
      await axios.delete(`${BASE_URL}/photos/${photoId}`, {
        headers: authHeader(),
      });
      return photoId;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Delete failed');
    }
  }
);

// ── PUT /photos/:id/metadata ───────────────────────────────────────────────────
export const updatePhotoMetadata = createAsyncThunk(
  'photos/updateMetadata',
  async ({ id, metadata }, { rejectWithValue }) => {
    try {
      const { data } = await axios.put(
        `${BASE_URL}/photos/${id}/metadata`,
        metadata,
        { headers: authHeader() }
      );
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Update failed');
    }
  }
);

// ─── Helper — extract array from backend responses ───────────────────────────
const toArray = (payload) =>
  Array.isArray(payload)
    ? payload
    : payload?.photos ?? payload?.data ?? [];

// ════════════════════════════════════════════════════════════════════════════════
//  SLICE
// ════════════════════════════════════════════════════════════════════════════════
const photoSlice = createSlice({
  name: 'photos',
  initialState: {
    gallery:           [],   // full list
    displayedPhotos:   [],   // what the gallery page renders
    loading:           false,
    error:             null,
    isSearching:       false,
    isFiltering:       false,
  },

  reducers: {
    clearDisplayedPhotos(state) {
      state.displayedPhotos = state.gallery;
      state.error           = null;
    },
    clearError(state) {
      state.error = null;
    },
    toggleStarred(state, action) {
      const toggle = (arr) =>
        arr.map(p =>
          (p._id || p.id) === action.payload
            ? { ...p, starred: !p.starred }
            : p
        );
      state.gallery         = toggle(state.gallery);
      state.displayedPhotos = toggle(state.displayedPhotos);
    },
  },

  extraReducers: (builder) => {
    // ── uploadPhotoAction ──────────────────────────────────────────────────────
    builder
      .addCase(uploadPhotoAction.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(uploadPhotoAction.fulfilled, (state, action) => {
        state.loading = false;
        const newPhoto = action.payload?.photo ?? action.payload;
        if (newPhoto?._id || newPhoto?.id) {
          state.gallery.unshift(newPhoto);
          state.displayedPhotos.unshift(newPhoto);
        }
      })
      .addCase(uploadPhotoAction.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload;
      });

    // ── fetchAllPhotos ─────────────────────────────────────────────────────────
    builder
      .addCase(fetchAllPhotos.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(fetchAllPhotos.fulfilled, (state, action) => {
        state.loading         = false;
        const list            = toArray(action.payload);
        state.gallery         = list;
        state.displayedPhotos = list;
      })
      .addCase(fetchAllPhotos.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload;
      });

    // ── searchPhotos ───────────────────────────────────────────────────────────
    builder
      .addCase(searchPhotos.pending, (state) => {
        state.isSearching = true;
        state.error       = null;
      })
      .addCase(searchPhotos.fulfilled, (state, action) => {
        state.isSearching     = false;
        state.displayedPhotos = toArray(action.payload);
      })
      .addCase(searchPhotos.rejected, (state, action) => {
        state.isSearching = false;
        state.error       = action.payload;
      });

    // ── filterPhotos ───────────────────────────────────────────────────────────
    builder
      .addCase(filterPhotos.pending, (state) => {
        state.isFiltering = true;
        state.error       = null;
      })
      .addCase(filterPhotos.fulfilled, (state, action) => {
        state.isFiltering     = false;
        state.displayedPhotos = toArray(action.payload);
      })
      .addCase(filterPhotos.rejected, (state, action) => {
        state.isFiltering = false;
        state.error       = action.payload;
      });

    // ── Multi-Thunk Handling for Scene/Top/Faces/Flagged ──────────────────────
    [fetchPhotosByScene, fetchTopPhotos, fetchPhotosWithFaces, fetchFlaggedPhotos].forEach((thunk) => {
      builder
        .addCase(thunk.pending, (state) => {
          state.loading = true;
          state.error   = null;
        })
        .addCase(thunk.fulfilled, (state, action) => {
          state.loading         = false;
          state.displayedPhotos = toArray(action.payload);
        })
        .addCase(thunk.rejected, (state, action) => {
          state.loading = false;
          state.error   = action.payload;
        });
    });

    // ── deletePhotoAction ──────────────────────────────────────────────────────
    builder
      .addCase(deletePhotoAction.pending, (state) => {
        state.loading = true;
      })
      .addCase(deletePhotoAction.fulfilled, (state, action) => {
        state.loading         = false;
        const id              = action.payload;
        const notDeleted      = (p) => (p._id || p.id) !== id;
        state.gallery         = state.gallery.filter(notDeleted);
        state.displayedPhotos = state.displayedPhotos.filter(notDeleted);
      })
      .addCase(deletePhotoAction.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload;
      });

    // ── updatePhotoMetadata ────────────────────────────────────────────────────
    builder
      .addCase(updatePhotoMetadata.fulfilled, (state, action) => {
        const updated   = action.payload?.photo ?? action.payload;
        const updatedId = updated?._id || updated?.id;
        const replace   = (arr) =>
          arr.map((p) => (p._id || p.id) === updatedId ? updated : p);
        state.gallery         = replace(state.gallery);
        state.displayedPhotos = replace(state.displayedPhotos);
      })
      .addCase(updatePhotoMetadata.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

// ════════════════════════════════════════════════════════════════════════════════
//  DYNAMIC MULTI-LAYER TREE SELECTOR
// ════════════════════════════════════════════════════════════════════════════════
export const selectNestedFolders = (state) => {
  // Pull directly from displayedPhotos to respect current tabs or search conditions
  const photosToGroup = state.photos?.displayedPhotos || [];
  const folderTree = {};

  photosToGroup.forEach(photo => {
    // Generate intelligent structural categories if fields are empty
    const mainFolder = photo.scene || photo.category || "Uncategorised";
    
    // Dynamic face categories inferred straight from calculated counts
    let subFolder = "No Faces";
    const faces = photo.faceCount ?? photo.faces ?? 0;
    if (faces === 1) {
      subFolder = "Single Portrait";
    } else if (faces > 1 && faces <= 4) {
      subFolder = "Group Photo";
    } else if (faces > 4) {
      subFolder = "Crowd Segment";
    }

    if (!folderTree[mainFolder]) {
      folderTree[mainFolder] = {};
    }
    if (!folderTree[mainFolder][subFolder]) {
      folderTree[mainFolder][subFolder] = [];
    }

    folderTree[mainFolder][subFolder].push(photo);
  });

  return folderTree;
};

export const { clearDisplayedPhotos, clearError, toggleStarred } = photoSlice.actions;
export default photoSlice.reducer;