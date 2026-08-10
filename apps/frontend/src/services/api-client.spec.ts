import { apiClient } from './api-client';

describe('ApiClient Specification', () => {
  it('should be instantiated with withCredentials enabled', () => {
    expect(apiClient.defaults.withCredentials).toBe(true);
  });

  it('should have standard application/json Content-Type header', () => {
    expect(apiClient.defaults.headers['Content-Type']).toBe('application/json');
  });
});
