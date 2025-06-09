const BASE_URL = import.meta.env.VITE_API_URL;

const request = async (url, options = {}) => {
  try {
    const response = await fetch(`${BASE_URL}${url}`, options);
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    return await response.json();
  } catch (e) {
    return Promise.reject(e);
  }
}

export const customFetch = {
  get: (url) => request(url),

  post: (url, body) =>
    request(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    }),

  patch: (url, body) =>
    request(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: (url) =>
    request(url, {
      method: 'DELETE',
    }),
};
