export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

async function parseResponse(response) {
  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    return response.json();
  }

  return response.text();
}

export async function apiFetch(path, options = {}) {
  const isFormData = options.body instanceof FormData;
  const response = await fetch(`${API_URL}${path}`, {
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

export function uploadFile(file, onProgress) {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    const xhr = new XMLHttpRequest();

    formData.append('file', file);
    xhr.open('POST', `${API_URL}/files/upload`);
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
  return `${API_URL}/files/${fileId}/download`;
}
