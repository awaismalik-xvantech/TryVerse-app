import * as SecureStore from 'expo-secure-store';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

const TOKEN_KEY = 'access_token';
const USER_KEY = 'user_data';

export async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function setToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function removeToken(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

export async function getUser(): Promise<Record<string, unknown> | null> {
  const data = await SecureStore.getItemAsync(USER_KEY);
  return data ? JSON.parse(data) : null;
}

export async function setUser(user: Record<string, unknown>): Promise<void> {
  await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
}

export async function removeUser(): Promise<void> {
  await SecureStore.deleteItemAsync(USER_KEY);
}

export async function clearSession(): Promise<void> {
  await Promise.all([removeToken(), removeUser()]);
}

export async function apiFetch(
  path: string,
  options: RequestInit = {},
): Promise<Response> {
  const token = await getToken();

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    await clearSession();
  }

  return response;
}

export async function apiPost<T = unknown>(
  path: string,
  data: unknown,
): Promise<{ ok: boolean; data?: T; error?: string; status: number }> {
  try {
    const response = await apiFetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      const responseData = await response.json();
      return { ok: true, data: responseData as T, status: response.status };
    } else {
      let errorDetail = `Error ${response.status}`;
      try {
        const errData = await response.json();
        if (typeof errData.detail === 'string') errorDetail = errData.detail;
        else if (errData.detail?.message) errorDetail = errData.detail.message;
        else if (typeof errData.message === 'string') errorDetail = errData.message;
      } catch {}
      return { ok: false, error: errorDetail, status: response.status };
    }
  } catch {
    return { ok: false, error: 'Connection failed', status: 0 };
  }
}

export async function apiGet<T = unknown>(
  path: string,
): Promise<{ ok: boolean; data?: T; error?: string; status: number }> {
  try {
    const response = await apiFetch(path);
    if (response.ok) {
      const responseData = await response.json();
      return { ok: true, data: responseData as T, status: response.status };
    } else {
      let errorDetail = `Error ${response.status}`;
      try {
        const errData = await response.json();
        if (typeof errData.detail === 'string') errorDetail = errData.detail;
      } catch {}
      return { ok: false, error: errorDetail, status: response.status };
    }
  } catch {
    return { ok: false, error: 'Connection failed', status: 0 };
  }
}

export async function apiUpload(
  path: string,
  fileUri: string,
  fieldName: string = 'file',
  extraFields?: Record<string, string>,
): Promise<{ ok: boolean; data?: unknown; error?: string; status: number }> {
  try {
    const token = await getToken();
    const formData = new FormData();

    const filename = fileUri.split('/').pop() || 'photo.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    formData.append(fieldName, {
      uri: fileUri,
      name: filename,
      type,
    } as unknown as Blob);

    if (extraFields) {
      Object.entries(extraFields).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }

    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (response.ok) {
      const data = await response.json();
      return { ok: true, data, status: response.status };
    } else {
      let errorDetail = `Error ${response.status}`;
      try {
        const errData = await response.json();
        if (typeof errData.detail === 'string') errorDetail = errData.detail;
      } catch {}
      return { ok: false, error: errorDetail, status: response.status };
    }
  } catch {
    return { ok: false, error: 'Upload failed', status: 0 };
  }
}

export { API_URL };
