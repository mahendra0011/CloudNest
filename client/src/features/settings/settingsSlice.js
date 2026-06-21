import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { apiFetch } from '../../lib/api.js';

export const fetchSettings = createAsyncThunk('settings/fetch', async (_, { rejectWithValue }) => {
  try {
    return await apiFetch('/settings');
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const updateSettings = createAsyncThunk('settings/update', async (payload, { rejectWithValue }) => {
  try {
    return await apiFetch('/settings', {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

const initialState = {
  data: {
    maxFileSize: 250,
    allowedTypes: ['images', 'documents', 'videos', 'audio', 'archives'],
    notificationsEnabled: true,
    sendUploadEmail: true
  },
  status: 'idle',
  loaded: false,
  saveStatus: 'idle',
  error: null
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    clearSettingsError(state) {
      state.error = null;
    },
    resetSettingsStatus(state) {
      state.saveStatus = 'idle';
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSettings.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchSettings.fulfilled, (state, action) => {
        state.status = 'idle';
        state.loaded = true;
        state.data = action.payload.settings;
      })
      .addCase(fetchSettings.rejected, (state, action) => {
        state.status = 'idle';
        state.loaded = true;
        state.error = action.payload;
      })
      .addCase(updateSettings.pending, (state) => {
        state.saveStatus = 'saving';
        state.error = null;
      })
      .addCase(updateSettings.fulfilled, (state, action) => {
        state.saveStatus = 'saved';
        state.data = action.payload.settings;
      })
      .addCase(updateSettings.rejected, (state, action) => {
        state.saveStatus = 'error';
        state.error = action.payload;
      });
  }
});

export const { clearSettingsError, resetSettingsStatus } = settingsSlice.actions;
export default settingsSlice.reducer;