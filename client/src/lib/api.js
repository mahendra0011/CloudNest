/**
 * API base URL.
 * When VITE_API_URL is empty/undefined, use relative path
 * so the Vite proxy forwards /api -> localhost:3000.
 * This fixes cross-origin cookie issues (sameSite: 'lax').
 */
const envUrl = import.meta.env.VITE_API_URL;
export const API_URL = envUrl || '';
const API_PREFIX = `${API_URL}/api`;

async function parseResponse(response) {
  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    return response.json();
  }

  return response.text();
}

export async function apiFetch(path, options = {}) {
  const isFormData = options.body instanceof FormData;
  const fullPath = path.startsWith('/api') ? `${API_URL}${path}` : `${API_PREFIX}${path}`;
  const response = await fetch(fullPath, {
    ...options,
    credentials: 'include',
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(options.headers || {})
    }
  });
  const data = await parseResponse(response);

  if (!response.ok) {
    throw new Error(data?.message || 'Request failed');
  }

  return data;
}

export function uploadFile(file, onProgress, userId) {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    const xhr = new XMLHttpRequest();

    formData.append('file', file);
    if (userId) {
      formData.append('userId', userId);
    }
    xhr.open('POST', `${API_PREFIX}/files/upload`);
    xhr.withCredentials = true;

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) return;
      onProgress(Math.round((event.loaded / event.total) * 100));
    };

    xhr.onload = () => {
      const data = JSON.parse(xhr.responseText || '{}');

      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(data);
      } else {
        reject(new Error(data.message || 'Upload failed'));
      }
    };

    xhr.onerror = () => reject(new Error('Upload failed'));
    xhr.send(formData);
  });
}

export function userUploadFile(file, onProgress) {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    const xhr = new XMLHttpRequest();

    formData.append('file', file);
    xhr.open('POST', `${API_PREFIX}/files/user-upload`);
    xhr.withCredentials = true;

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) return;
      onProgress(Math.round((event.loaded / event.total) * 100));
    };

    xhr.onload = () => {
      const data = JSON.parse(xhr.responseText || '{}');
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(data);
      } else {
        reject(new Error(data.message || 'Upload failed'));
      }
    };

    xhr.onerror = () => reject(new Error('Upload failed'));
    xhr.send(formData);
  });
}

export function adminUploadFile(file, { userName, userEmail, driveId }, onProgress) {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    const xhr = new XMLHttpRequest();

    formData.append('file', file);
    if (userName) formData.append('userName', userName);
    if (userEmail) formData.append('userEmail', userEmail);
    if (driveId) formData.append('driveId', driveId);

    xhr.open('POST', `${API_PREFIX}/files/admin-upload`);
    xhr.withCredentials = true;

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) return;
      onProgress(Math.round((event.loaded / event.total) * 100));
    };

    xhr.onload = () => {
      const data = JSON.parse(xhr.responseText || '{}');
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(data);
      } else {
        reject(new Error(data.message || 'Upload failed'));
      }
    };

    xhr.onerror = () => reject(new Error('Upload failed'));
    xhr.send(formData);
  });
}

export function downloadUrl(fileId) {
  return `${API_PREFIX}/files/${fileId}/download`;
}
