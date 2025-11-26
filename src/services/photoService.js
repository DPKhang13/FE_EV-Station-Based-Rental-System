// src/services/photoService.js
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api').replace(/\/+$/, '');

const joinUrl = (base, path) => `${base}/${String(path).replace(/^\/+/, '')}`;

const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ---- helpers ----
const extractUrl = async (res) => {
  try {
    const data = await res.clone().json();
    return (
      data?.url || data?.location || data?.imageUrl || data?.path || data?.photoUrl || data?.data?.url || null
    );
  } catch {
    const text = await res.text().catch(() => '');
    return /^https?:\/\//i.test(text) ? text : null;
  }
};

const uploadForm = async (path, file, userId, { overwrite = true } = {}) => {
  const fd = new FormData();
  fd.append('file', file);     // @RequestParam("file")
  fd.append('userId', userId); // @RequestParam("userId")
  fd.append('overwrite', String(overwrite)); // để BE (nếu có) hiểu là ghi đè

  const url = joinUrl(API_BASE_URL, path);

  const res = await fetch(url, {
    method: 'POST',
    headers: { ...getAuthHeaders(), Accept: 'application/json' }, // KHÔNG set Content-Type
    body: fd,
    credentials: 'include',
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Upload failed ${res.status} ${text}`);
  }
  return extractUrl(res);
};

// ---- APIs ----
const uploadIdCard = (file, userId, opts) => uploadForm('upload/cccd', file, userId, opts);
const uploadDriverLicense = (file, userId, opts) => uploadForm('upload/driver-license', file, userId, opts);

// lấy danh sách photo (fallback nhiều endpoint)
const getPhotos = async (userId) => {
  const endpoints = [
    `photos/user/${userId}`,
    `photos/${userId}`,
    `customer/${userId}/photos`,
    `upload/photos/${userId}`,
  ];
  for (const endpoint of endpoints) {
    try {
      const url = joinUrl(API_BASE_URL, endpoint);
      const res = await fetch(url, {
        method: 'GET',
        headers: { ...getAuthHeaders(), Accept: 'application/json' },
        credentials: 'include',
      });
      if (res.ok) return await res.json();
    } catch { /* next */ }
  }
  return null;
};

// ✅ check trong DB: user đã có CCCD và GPLX chưa
const getDocStatus = async (userId) => {
  const url = joinUrl(API_BASE_URL, `photos/doc-status/${userId}`);
  const res = await fetch(url, {
    method: 'GET',
    headers: { ...getAuthHeaders(), Accept: 'application/json' },
    credentials: 'include',
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || 'Không thể kiểm tra trạng thái giấy tờ');
  }
  return res.json(); // { hasIdCard: boolean, hasDriverLicense: boolean }
};

const photoService = {
  uploadIdCard,
  uploadDriverLicense,
  getPhotos,
  getDocStatus,
};

export default photoService;
