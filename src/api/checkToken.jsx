import { API_BASE_URL } from './client';

export async function checkToken(token) {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/verify?token=${token}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error(await res.text() || 'Token verification failed');
    }

    // BE có thể trả về JSON hoặc text
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await res.json();  // ví dụ { valid: true, redirectUrl: "/customer/home" }
    } else {
      return await res.text();  // ví dụ "Token hợp lệ → Redirect: /customer/home"
    }

  } catch (err) {
    throw new Error(err.message || 'Unable to verify token');
  }
}
