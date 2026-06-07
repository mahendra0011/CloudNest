import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { apiFetch } from '../../lib/api.js';

export const fetchMe = createAsyncThunk('auth/me', async (_, { rejectWithValue }) => {
  try {
    return await apiFetch('/auth/me');
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const login = createAsyncThunk('auth/login', async (payload, { rejectWithValue }) => {
  try {
    return await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const register = createAsyncThunk('auth/register', async (payload, { rejectWithValue }) => {
  try {
    return await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const logout = createAsyncThunk('auth/logout', async () => {
  return apiFetch('/auth/logout', { method: 'POST' });
});

export const fetchDriveStatus = createAsyncThunk('auth/driveStatus', async (_, { rejectWithValue }) => {
  try {
    return await apiFetch('/drive/status');
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const requestGoogleLogin = createAsyncThunk('auth/requestGoogleLogin', async (_, { rejectWithValue }) => {
  try {
    return await apiFetch('/auth/google');
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

const initialState = {
  user: null,
  status: 'idle',
  error: null,
  bootstrapped: false,
  driveConnected: false,
  driveStatus: 'idle'
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError(state) {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMe.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.status = 'idle';
        state.bootstrapped = true;
        state.user = action.payload.user;
      })
      .addCase(fetchMe.rejected, (state) => {
        state.status = 'idle';
        state.bootstrapped = true;
        state.user = null;
        state.driveConnected = false;
      })
      .addCase(login.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'idle';
        state.user = action.payload.user;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'idle';
        state.error = action.payload;
      })
      .addCase(register.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.status = 'idle';
        state.user = action.payload.user;
      })
      .addCase(register.rejected, (state, action) => {
        state.status = 'idle';
        state.error = action.payload;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.driveConnected = false;
      })
      .addCase(fetchDriveStatus.pending, (state) => {
        state.driveStatus = 'loading';
      })
      .addCase(fetchDriveStatus.fulfilled, (state, action) => {
        state.driveStatus = 'idle';
        state.driveConnected = action.payload.connected;
      })
      .addCase(fetchDriveStatus.rejected, (state) => {
        state.driveStatus = 'idle';
        state.driveConnected = false;
      });
  }
});

export const { clearAuthError } = authSlice.actions;
export default authSlice.reducer;
