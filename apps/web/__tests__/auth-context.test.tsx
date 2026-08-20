import { renderHook, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../lib/auth-context';
import { api } from '../lib/api';

// Mock api
jest.mock('../lib/api', () => ({
  api: {
    post: jest.fn(),
    get: jest.fn(),
    defaults: { headers: { common: {} } },
  },
}));

describe('AuthContext', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  );

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('should initialize with unauthenticated state', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.user).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should login successfully', async () => {
    const mockUser = { id: '1', email: 'test@example.com', role: 'customer' };
    (api.post as jest.Mock).mockResolvedValueOnce({ data: { user: mockUser, accessToken: 'token123' } });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login('test@example.com', 'password123');
    });

    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
    });

    expect(api.post).toHaveBeenCalledWith('/v1/auth/login', {
      email: 'test@example.com',
      password: 'password123',
    });
  });

  it('should logout successfully', async () => {
    const mockUser = { id: '1', email: 'test@example.com', role: 'customer' };
    (api.post as jest.Mock).mockResolvedValueOnce({ data: { user: mockUser, accessToken: 'token123' } });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login('test@example.com', 'password123');
    });

    await act(async () => {
      await result.current.logout();
    });

    await waitFor(() => {
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });
});
