const API_BASE_URL =
  (import.meta.env?.VITE_API_BASE_URL || 'http://localhost:8080/api').replace(/\/+$/, '');
const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const validateImage = (file) => {
  if (!file) throw new Error('No file provided');
  if (!file.type?.startsWith('image/')) throw new Error('Invalid file type. Please upload an image.');
  if (file.size > 5 * 1024 * 1024) throw new Error('File size exceeds 5MB limit.');
};

const joinUrl = (base, path) => `${base}/${String(path).replace(/^\/+/, '')}`;


const postForm = async(path, file, userId) => {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('userId', userId);

    const res = await fetch(joinUrl(API_BASE_URL, path), {
  method: 'POST',
  headers: { ...getAuthHeaders(), Accept: 'application/json' },
  body: fd,
  credentials: 'include',
});

if (!res.ok) {
  let detail = '';
  try {
    const j = await res.clone().json();
    detail = j?.message ? `- ${j.message}` : JSON.stringify(j);
  } catch {
    try { detail = await res.text(); } catch {}
  }
  throw new Error(`Upload failed: ${res.status} ${res.statusText} ${detail}`.trim());
}
    try {
        return await res.json();
    }catch { return {}; }
};

const uploadService = {
    uploadIdCard: async(file, userId) => {
        validateImage(file);
        return postForm('upload/id-card', file, userId);
    },
    
    uploadProfilePicture: async(file, userId) => {
        validateImage(file);
        return postForm('upload/profile-picture', file, userId);
    },
};
export default uploadService;