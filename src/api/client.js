export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export async function httpPost(path, payload) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const contentType = res.headers.get('content-type') || '';
  const body = contentType.includes('application/json') ? await res.json() : await res.text();

  if (!res.ok) {
    const message = typeof body === 'string' ? body : (body?.message || 'Request failed');
    throw new Error(message);
  }

  return body;
}
