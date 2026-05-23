import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import photoReducer from './slices/photoSlice';
import albumReducer from './slices/albumSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    photos: photoReducer,
    albums: albumReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, 
    }),
});