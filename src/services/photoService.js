// src/services/photoService.js
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api').replace(/\/+$/, '');

const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const joinUrl = (base, path) => `${base}/${String(path).replace(/^\/+/, '')}`;

const uploadForm = async (path, file, userId) => {
  const fd = new FormData();
  fd.append('file', file);
  fd.append('userId', userId);

  const url = joinUrl(API_BASE_URL, path);
  console.log('🔗 POST', url);

  const res = await fetch(url, {
    method: 'POST',
    headers: { ...getAuthHeaders(), Accept: 'application/json' }, // KHÔNG set Content-Type
    body: fd,
    credentials: 'include',
  });

  if (!res.ok) {
    let detail = '';
    try { detail = await res.text(); } catch {}
    throw new Error(`Upload failed ${res.status} ${detail}`);
  }
  return res.json().catch(() => ({}));
};

const photoService = {
  // 👇 ĐÚNG với controller của bro
  uploadIdCard: (file, userId) => uploadForm('upload/cccd', file, userId),
  uploadDriverLicense: (file, userId) => uploadForm('upload/driver-license', file, userId),
};

export default photoService;
