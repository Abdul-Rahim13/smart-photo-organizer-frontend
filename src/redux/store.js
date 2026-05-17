import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import photoReducer from './slices/photoSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    photos: photoReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, 
    }),
});