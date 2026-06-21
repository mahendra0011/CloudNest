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
    return rejectWithValue(err.message || 'Failed to connect to Google login');
  }
});

export const fetchUsers = createAsyncThunk('auth/fetchUsers', async (_, { rejectWithValue }) => {
  try {
    return await apiFetch('/auth/users');
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const updateProfile = createAsyncThunk('auth/updateProfile', async (payload, { rejectWithValue }) => {
  try {
    return await apiFetch('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const changePassword = createAsyncThunk('auth/changePassword', async (payload, { rejectWithValue }) => {
  try {
    return await apiFetch('/auth/password', {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
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
  driveStatus: 'idle',
  driveDetails: null,
  users: [],
  usersStatus: 'idle',
  googleLoginStatus: 'idle'
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
      .addCase(requestGoogleLogin.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(requestGoogleLogin.fulfilled, (state) => {
        state.status = 'idle';
      })
      .addCase(requestGoogleLogin.rejected, (state, action) => {
        state.status = 'idle';
        state.error = action.payload || 'Failed to connect to Google login';
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
        state.driveDetails = action.payload;
      })
      .addCase(fetchDriveStatus.rejected, (state) => {
        state.driveStatus = 'idle';
        state.driveConnected = false;
        state.driveDetails = null;
      })
      .addCase(fetchUsers.pending, (state) => {
        state.usersStatus = 'loading';
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.usersStatus = 'idle';
        state.users = action.payload.users;
      })
      .addCase(fetchUsers.rejected, (state) => {
        state.usersStatus = 'idle';
        state.users = [];
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        if (state.user) {
          state.user.name = action.payload.user.name;
        }
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.error = null;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.error = action.payload;
      });
  }
});

export const { clearAuthError } = authSlice.actions;
export default authSlice.reducer;
