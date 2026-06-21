import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { apiFetch } from '../../lib/api.js';

export const fetchActivities = createAsyncThunk('activities/fetch', async (driveIds = '', { rejectWithValue }) => {
  try {
    let query = '';
    if (driveIds && driveIds.length > 0) {
      const ids = Array.isArray(driveIds) ? driveIds.join(',') : driveIds;
      if (ids) query = `?driveId=${encodeURIComponent(ids)}`;
    }
    return await apiFetch(`/activities${query}`);
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

const initialState = {
  items: [],
  status: 'idle',
  error: null,
};

const activitiesSlice = createSlice({
  name: 'activities',
  initialState,
  reducers: {
    clearActivityError(state) {
      state.error = null;
    },
    prependActivity(state, action) {
      const exists = state.items.some((item) => item._id === action.payload._id);
      if (exists) return;
      state.items.unshift(action.payload);
      if (state.items.length > 100) {
        state.items.length = 100;
      }
    },
    clearActivities(state) {
      state.items = [];
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchActivities.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchActivities.fulfilled, (state, action) => {
        state.status = 'idle';
        // The action payload from /activities is { activities: [...] }
        const raw = action.payload?.activities || action.payload || [];
        state.items = Array.isArray(raw) ? raw : [];
      })
      .addCase(fetchActivities.rejected, (state, action) => {
        state.status = 'idle';
        state.error = action.payload;
      });
  },
});

export const { clearActivityError, prependActivity, clearActivities } = activitiesSlice.actions;
export default activitiesSlice.reducer;
