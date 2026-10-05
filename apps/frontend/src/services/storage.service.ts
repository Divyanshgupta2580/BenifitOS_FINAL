export const storageService = {
  async getItem(key: string): Promise<string | null> {
    if (key === 'refresh_token' || key === 'refreshToken' || key === 'accessToken' || key === 'access_token') {
      console.warn(`Security Notice: ${key} is kept in memory only and is strictly not accessible from web storage.`);
      return null;
    }
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
      return null;
    } catch {
      return null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    if (key === 'refresh_token' || key === 'refreshToken' || key === 'accessToken' || key === 'access_token') {
      console.warn(`Security Notice: ${key} is kept in memory only and will never be stored in persistent web storage.`);
      return;
    }
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
      }
    } catch (err) {
      console.warn(`Storage setItem error for key '${key}':`, err);
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch (err) {
      console.warn(`Storage removeItem error for key '${key}':`, err);
    }
  },
};
