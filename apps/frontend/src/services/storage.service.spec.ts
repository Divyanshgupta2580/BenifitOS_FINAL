import { storageService } from './storage.service';

describe('StorageService Specification', () => {
  beforeEach(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.clear();
    }
  });

  it('should block reading refresh_token from localStorage', async () => {
    const token = await storageService.getItem('refresh_token');
    expect(token).toBeNull();
  });

  it('should block setting refresh_token in localStorage', async () => {
    await storageService.setItem('refresh_token', 'stale_token_value');
    const token = await storageService.getItem('refresh_token');
    expect(token).toBeNull();
  });

  it('should allow storing and retrieving non-sensitive keys', async () => {
    await storageService.setItem('theme', 'dark');
    const theme = await storageService.getItem('theme');
    expect(theme).toBe('dark');
  });
});
