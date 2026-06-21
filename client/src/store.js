import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/auth/authSlice.js';
import filesReducer from './features/files/filesSlice.js';
import activitiesReducer from './features/activities/activitiesSlice.js';
import settingsReducer from './features/settings/settingsSlice.js';
import drivesReducer from './features/drives/drivesSlice.js';

// Load persisted selected drive IDs from localStorage
function loadPersistedSelectedDriveIds() {
  try {
    const stored = localStorage.getItem('selectedDriveIds');
    const parsed = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export const store = configureStore({
  reducer: {
    auth: authReducer,
    files: filesReducer,
    activities: activitiesReducer,
    settings: settingsReducer,
    drives: drivesReducer,
  }
});

// Persist selected drive IDs to localStorage whenever they change
store.subscribe(() => {
  try {
    const drivesState = store.getState().drives;
    if (drivesState && Array.isArray(drivesState.selectedDriveIds)) {
      localStorage.setItem('selectedDriveIds', JSON.stringify(drivesState.selectedDriveIds));
    }
  } catch {
    // localStorage unavailable — silently ignore
  }
});
