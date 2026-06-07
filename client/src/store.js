import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/auth/authSlice.js';
import filesReducer from './features/files/filesSlice.js';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    files: filesReducer
  }
});
