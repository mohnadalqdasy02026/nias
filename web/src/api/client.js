export const API_BASE = import.meta.env.VITE_API_BASE ?? '/api/v1';

let refreshPromise = null;

async function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) throw new Error('No refresh token');
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.data?.accessToken) throw new Error('Refresh failed');
      localStorage.setItem('access_token', json.data.accessToken);
      localStorage.setItem('refresh_token', json.data.refreshToken);
      return json.data.accessToken;
    })().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

async function request(path, { method = 'GET', body, headers = {}, auth = false } = {}, retried = false) {
  const doFetch = (token) =>
    fetch(`${API_BASE}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(auth ? { Authorization: `Bearer ${token ?? localStorage.getItem('access_token') ?? ''}` } : {}),
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

  let res = await doFetch();

  if (auth && res.status === 401 && !retried && !path.startsWith('/auth/refresh')) {
    const restored = localStorage.getItem('access_token');
    try {
      await refreshAccessToken();
      res = await doFetch();
    } catch {
      const nowExpired = localStorage.getItem('access_token') !== restored || res.status === 401;
      if (nowExpired && path !== '/auth/login') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      }
      const err = new Error('انتهت الجلسة، يرجى تسجيل الدخول مجددًا');
      err.status = 401;
      throw err;
    }
  }

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    const err = new Error(json?.error?.message ?? `Request failed (${res.status})`);
    err.status = res.status;
    err.code = json?.error?.code;
    err.details = json?.error?.details;
    throw err;
  }

  return json?.data;
}

export const api = {
  get: (path, opts) => request(path, { ...opts, method: 'GET' }),
  post: (path, body, opts) => request(path, { ...opts, method: 'POST', body }),
  put: (path, body, opts) => request(path, { ...opts, method: 'PUT', body }),
  del: (path, opts) => request(path, { ...opts, method: 'DELETE' }),
  patch: (path, body, opts) => request(path, { ...opts, method: 'PATCH', body }),
};