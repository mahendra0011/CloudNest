import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { apiFetch, uploadFile } from '../../lib/api.js';

export const fetchFiles = createAsyncThunk('files/fetch', async (driveIds = '', { rejectWithValue }) => {
  try {
    let query = '';
    if (driveIds && driveIds.length > 0) {
      const ids = Array.isArray(driveIds) ? driveIds.join(',') : driveIds;
      if (ids) query = `?driveId=${encodeURIComponent(ids)}`;
    }
    return await apiFetch(`/files${query}`);
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const uploadSelectedFile = createAsyncThunk('files/upload', async ({ file, userId }, { dispatch, rejectWithValue }) => {
  try {
    dispatch(setUploadProgress(0));
    const data = await uploadFile(file, (progress) => dispatch(setUploadProgress(progress)), userId);
    return data.file;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const deleteFile = createAsyncThunk('files/delete', async (fileId, { rejectWithValue }) => {
  try {
    await apiFetch(`/files/${fileId}`, { method: 'DELETE' });
    return fileId;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

const filesSlice = createSlice({
  name: 'files',
  initialState: {
    items: [],
    status: 'idle',
    uploadStatus: 'idle',
    uploadProgress: 0,
    error: null
  },
  reducers: {
    setUploadProgress(state, action) {
      state.uploadProgress = action.payload;
    },
    clearFileError(state) {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFiles.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchFiles.fulfilled, (state, action) => {
        state.status = 'idle';
        state.items = action.payload.files;
      })
      .addCase(fetchFiles.rejected, (state, action) => {
        state.status = 'idle';
        state.error = action.payload;
      })
      .addCase(uploadSelectedFile.pending, (state) => {
        state.uploadStatus = 'loading';
        state.error = null;
      })
      .addCase(uploadSelectedFile.fulfilled, (state, action) => {
        state.uploadStatus = 'idle';
        state.uploadProgress = 100;
        state.items.unshift(action.payload);
      })
      .addCase(uploadSelectedFile.rejected, (state, action) => {
        state.uploadStatus = 'idle';
        state.error = action.payload;
      })
      .addCase(deleteFile.fulfilled, (state, action) => {
        state.items = state.items.filter((file) => file.id !== action.payload);
      })
      .addCase(deleteFile.rejected, (state, action) => {
        state.error = action.payload;
      });
  }
});

export const { clearFileError, setUploadProgress } = filesSlice.actions;
export default filesSlice.reducer;
