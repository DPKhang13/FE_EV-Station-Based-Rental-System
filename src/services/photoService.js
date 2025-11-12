// ✅ GỬI userId TRONG FORM-DATA, endpoint KHÔNG có {userId}
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api').replace(/\/+$/, '');

const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken'); // đồng bộ key
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const joinUrl = (base, path) => `${base}/${String(path).replace(/^\/+/, '')}`;

const extractUrl = async (res) => {
  try {
    const data = await res.clone().json();
    return (
      data?.url ||
      data?.location ||
      data?.imageUrl ||
      data?.path ||
      data?.photoUrl ||
      data?.data?.url ||
      null
    );
  } catch {
    const text = await res.text().catch(() => '');
    return /^https?:\/\//i.test(text) ? text : null;
  }
};

const uploadForm = async (path, file, userId) => {
  const fd = new FormData();
  fd.append('file', file);     // @RequestParam("file")
  fd.append('userId', userId); // @RequestParam("userId")

  const url = joinUrl(API_BASE_URL, path);     // /api/upload/cccd  (không {userId})
  
  console.log('📤 Uploading to:', url);
  console.log('📤 UserId:', userId);
  console.log('📤 File:', file.name);
  
  const res = await fetch(url, {
    method: 'POST',
    headers: { ...getAuthHeaders(), Accept: 'application/json' }, // đừng set Content-Type
    body: fd,
    credentials: 'include',
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    console.error('❌ Upload failed:', res.status, text);
    throw new Error(`Upload failed ${res.status} ${text}`);
  }
  
  const resultUrl = await extractUrl(res);
  console.log('✅ Upload success! URL:', resultUrl);
  return resultUrl; // → string URL (nếu BE trả), hoặc null
};

const photoService = {
  uploadIdCard: (file, userId) => uploadForm('upload/cccd', file, userId),
  uploadDriverLicense: (file, userId) => uploadForm('upload/driver-license', file, userId),
};

export default photoService;
