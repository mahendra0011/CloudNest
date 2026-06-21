import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { apiFetch } from '../../lib/api.js';

export const fetchDrives = createAsyncThunk('drives/fetchAll', async (_, { rejectWithValue }) => {
  try {
    return await apiFetch('/drive/list');
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const fetchDriveStatus = createAsyncThunk('drives/status', async (_, { rejectWithValue }) => {
  try {
    return await apiFetch('/drive/status');
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const fetchDriveStats = createAsyncThunk('drives/stats', async (_, { rejectWithValue }) => {
  try {
    return await apiFetch('/drive/stats');
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const addDrive = createAsyncThunk('drives/add', async (payload, { rejectWithValue }) => {
  try {
    return await apiFetch('/drive/add', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const togglePoolDrive = createAsyncThunk('drives/togglePool', async (id, { rejectWithValue }) => {
  try {
    return await apiFetch(`/drive/toggle-pool/${id}`, { method: 'PUT' });
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const setPrimaryDrive = createAsyncThunk('drives/setPrimary', async (id, { rejectWithValue }) => {
  try {
    return await apiFetch(`/drive/primary/${id}`, { method: 'PUT' });
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const setDriveDataView = createAsyncThunk('drives/setDataView', async (id, { rejectWithValue }) => {
  try {
    return await apiFetch('/settings/show-data', {
      method: 'PUT',
      body: JSON.stringify({ driveId: id })
    });
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const fetchShowDataSelection = createAsyncThunk('drives/fetchShowData', async (_, { rejectWithValue }) => {
  try {
    const data = await apiFetch('/settings');
    return data.settings.showDataDriveIds || [];
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const setShowDataBulk = createAsyncThunk('drives/setShowDataBulk', async (driveIds, { rejectWithValue }) => {
  try {
    return await apiFetch('/settings', {
      method: 'PUT',
      body: JSON.stringify({ showDataDriveIds: driveIds })
    });
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const setUploadDrive = createAsyncThunk('drives/setUploadDrive', async (id, { rejectWithValue }) => {
  try {
    return await apiFetch(`/drive/upload-target/${id}`, { method: 'PUT' });
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const updateDrive = createAsyncThunk('drives/update', async ({ id, ...payload }, { rejectWithValue }) => {
  try {
    return await apiFetch(`/drive/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const deleteDrive = createAsyncThunk('drives/delete', async (id, { rejectWithValue }) => {
  try {
    await apiFetch(`/drive/${id}`, { method: 'DELETE' });
    return id;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const syncDrive = createAsyncThunk('drives/sync', async (_, { rejectWithValue }) => {
  try {
    return await apiFetch('/drive/sync', { method: 'POST' });
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const syncAllDrives = createAsyncThunk('drives/syncAll', async (_, { rejectWithValue }) => {
  try {
    return await apiFetch('/drive/sync-all', { method: 'POST' });
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const fetchAutoUploadDrive = createAsyncThunk('drives/autoUploadDrive', async (_, { rejectWithValue }) => {
  try {
    return await apiFetch('/drive/auto-upload-drive');
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const fetchDriveById = createAsyncThunk('drives/fetchById', async (id, { rejectWithValue }) => {
  try {
    const data = await apiFetch(`/drive/${id}`);
    return data.drive;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const selectUploadDrive = createAsyncThunk('drives/selectUploadDrive', async (id, { rejectWithValue }) => {
  try {
    if (!id) {
      return { activeDriveId: null };
    }
    return await apiFetch(`/drive/upload-target/${id}`, { method: 'PUT' });
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const generateOAuthUrl = createAsyncThunk('drives/generateOAuthUrl', async (payload, { rejectWithValue }) => {
  try {
    return await apiFetch('/drive/oauth-url', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const exchangeOAuthCode = createAsyncThunk('drives/exchangeCode', async (payload, { rejectWithValue }) => {
  try {
    return await apiFetch('/drive/exchange-code', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

function loadPersistedSelectedDriveIds() {
  try {
    const stored = localStorage.getItem('selectedDriveIds');
    const parsed = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

const initialState = {
  drives: [],
  activeDrive: null,
  activeDriveId: null,
  connected: false,
  status: 'idle',
  syncStatus: 'idle',
  addStatus: 'idle',
  stats: {
    totalDrives: 0,
    totalStorage: 0,
    totalUsage: 0,
    totalAvailable: 0,
    usagePercentage: 0,
    totalFiles: 0
  },
  statsStatus: 'idle',
  error: null,
  autoSwitchEnabled: false,
  selectedDriveIds: loadPersistedSelectedDriveIds(),
  uploadDriveId: null
};

const drivesSlice = createSlice({
  name: 'drives',
  initialState,
  reducers: {
    clearDriveError(state) {
      state.error = null;
    },
    resetAddStatus(state) {
      state.addStatus = 'idle';
    },
    resetSyncStatus(state) {
      state.syncStatus = 'idle';
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDrives.pending, (state) => { state.status = 'loading'; })
      .addCase(setDriveDataView.fulfilled, (state, action) => {
        // Server returns the full array of selected drive IDs after the toggle
        const serverIds = action.payload.showDataDriveIds || [];
        state.selectedDriveIds = serverIds.map(id => String(id));
        try {
          localStorage.setItem('selectedDriveIds', JSON.stringify(state.selectedDriveIds));
        } catch {}
      })
      .addCase(setDriveDataView.rejected, (state) => {})
      .addCase(fetchShowDataSelection.fulfilled, (state, action) => {
        const serverIds = action.payload || [];
        state.selectedDriveIds = serverIds.map(id => String(id));
        try {
          localStorage.setItem('selectedDriveIds', JSON.stringify(state.selectedDriveIds));
        } catch {}
      })
      .addCase(fetchShowDataSelection.rejected, (state) => {
        // On error, keep whatever we have (likely from localStorage)
      })
      .addCase(setShowDataBulk.fulfilled, (state, action) => {
        const serverIds = action.payload.settings?.showDataDriveIds || [];
        state.selectedDriveIds = serverIds.map(id => String(id));
        try {
          localStorage.setItem('selectedDriveIds', JSON.stringify(state.selectedDriveIds));
        } catch {}
      })
      .addCase(setShowDataBulk.rejected, (state, action) => { state.error = action.payload; })
      .addCase(fetchDrives.fulfilled, (state, action) => {
        state.status = 'idle';
        state.drives = action.payload.drives;
      })
      .addCase(fetchDrives.rejected, (state, action) => {
        state.status = 'idle';
        state.error = action.payload;
      })
      .addCase(fetchAutoUploadDrive.fulfilled, (state, action) => {
        state.autoSwitchEnabled = action.payload.warning ? false : true;
      })
      .addCase(fetchAutoUploadDrive.rejected, (state) => {
        state.autoSwitchEnabled = false;
      })
      .addCase(fetchDriveStatus.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchDriveStatus.fulfilled, (state, action) => {
        state.status = 'idle';
        state.connected = action.payload.connected;
        state.activeDriveId = action.payload.activeDriveId;
        state.activeDrive = action.payload.drive;
        if (action.payload.drives) state.drives = action.payload.drives;
      })
      .addCase(fetchDriveStatus.rejected, (state, action) => {
        state.status = 'idle';
        state.connected = false;
        state.error = action.payload;
      })
      .addCase(fetchDriveStats.pending, (state) => { state.statsStatus = 'loading'; })
      .addCase(fetchDriveStats.fulfilled, (state, action) => {
        state.statsStatus = 'idle';
        state.stats = {
          totalDrives: action.payload.totalDrives || 0,
          totalStorage: action.payload.totalStorage || 0,
          totalUsage: action.payload.totalUsage || 0,
          totalAvailable: action.payload.totalAvailable || 0,
          usagePercentage: action.payload.usagePercentage || 0,
          totalFiles: action.payload.totalFiles || 0
        };
      })
      .addCase(fetchDriveStats.rejected, (state) => { state.statsStatus = 'idle'; })
      .addCase(addDrive.pending, (state) => { state.addStatus = 'saving'; state.error = null; })
      .addCase(addDrive.fulfilled, (state, action) => {
        state.addStatus = 'saved';
        state.drives.unshift(action.payload.drive);
      })
      .addCase(addDrive.rejected, (state, action) => { state.addStatus = 'error'; state.error = action.payload; })
      .addCase(togglePoolDrive.fulfilled, (state, action) => {
        const updated = action.payload.drive;
        state.drives = state.drives.map((d) =>
          d._id === updated._id ? { ...d, isActive: updated.isActive } : d
        );
        if (state.activeDrive && state.activeDrive._id === updated._id) {
          state.activeDrive.isActive = updated.isActive;
        }
        if (!updated.isActive && state.activeDriveId === updated._id) {
          state.activeDrive = null;
          state.activeDriveId = null;
          state.connected = false;
        }
      })
      .addCase(togglePoolDrive.rejected, (state, action) => { state.error = action.payload; })
      .addCase(setPrimaryDrive.fulfilled, (state, action) => {
        state.activeDriveId = action.payload.activeDriveId;
        state.drives = state.drives.map((d) => ({
          ...d,
          isActive: d._id === action.payload.activeDriveId ? true : d.isActive
        }));
      })
      .addCase(setPrimaryDrive.rejected, (state, action) => { state.error = action.payload; })
      .addCase(setUploadDrive.fulfilled, (state, action) => {
        state.activeDriveId = action.payload.activeDriveId;
        state.connected = Boolean(action.payload.activeDriveId);
        state.drives = state.drives.map((d) => ({
          ...d,
          isActive: action.payload.drive && d._id === action.payload.drive._id ? action.payload.drive.isActive : d.isActive
        }));
        if (state.activeDrive && action.payload.drive && state.activeDrive._id === action.payload.drive._id) {
          state.activeDrive = { ...state.activeDrive, ...action.payload.drive };
        }
      })
      .addCase(setUploadDrive.rejected, (state, action) => { state.error = action.payload; })
      .addCase(selectUploadDrive.fulfilled, (state, action) => {
        state.activeDriveId = action.payload.activeDriveId;
        state.connected = Boolean(action.payload.activeDriveId);
      })
      .addCase(selectUploadDrive.rejected, (state, action) => { state.error = action.payload; })
      .addCase(updateDrive.fulfilled, (state, action) => {
        const idx = state.drives.findIndex((d) => d._id === action.payload.drive._id);
        if (idx >= 0) state.drives[idx] = action.payload.drive;
        if (state.activeDrive?._id === action.payload.drive._id) state.activeDrive = action.payload.drive;
      })
      .addCase(updateDrive.rejected, (state, action) => { state.error = action.payload; })
      .addCase(deleteDrive.fulfilled, (state, action) => {
        state.drives = state.drives.filter((d) => d._id !== action.payload);
        if (state.activeDrive?._id === action.payload) { state.activeDrive = null; state.activeDriveId = null; state.connected = false; }
      })
      .addCase(deleteDrive.rejected, (state, action) => { state.error = action.payload; })
      .addCase(syncDrive.pending, (state) => { state.syncStatus = 'syncing'; })
      .addCase(syncDrive.fulfilled, (state, action) => {
        state.syncStatus = 'idle';
        if (action.payload.drive) {
          const idx = state.drives.findIndex((d) => d._id === action.payload.drive._id);
          if (idx >= 0) state.drives[idx] = { ...state.drives[idx], ...action.payload.drive };
          if (state.activeDrive?._id === action.payload.drive._id) state.activeDrive = { ...state.activeDrive, ...action.payload.drive };
        }
      })
      .addCase(syncDrive.rejected, (state, action) => { state.syncStatus = 'error'; state.error = action.payload; })
      .addCase(syncAllDrives.pending, (state) => { state.syncStatus = 'syncing'; })
      .addCase(syncAllDrives.fulfilled, (state) => { state.syncStatus = 'idle'; })
      .addCase(syncAllDrives.rejected, (state, action) => { state.syncStatus = 'error'; state.error = action.payload; });
  }
});

export const { clearDriveError, resetAddStatus, resetSyncStatus } = drivesSlice.actions;
export default drivesSlice.reducer;