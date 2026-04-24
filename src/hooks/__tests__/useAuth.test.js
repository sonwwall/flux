import { renderHook, act } from '@testing-library/react';
import { useAuth } from '../useAuth';
import { AuthProvider } from '../useAuth';
import { mockApiResponse, mockApiError } from '../../__tests__/utils/test-utils';

// 模拟localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};
global.localStorage = localStorageMock;

// 模拟fetch
global.fetch = jest.fn();

describe('useAuth', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
    fetch.mockClear();
  });

  it('provides auth context', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    expect(result.current).toBeDefined();
    expect(result.current.login).toBeDefined();
    expect(result.current.logout).toBeDefined();
  });

  it('initializes with null user and loading state', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isLoading).toBe(true);
  });

  it('sets user after successful login', async () => {
    fetch.mockResolvedValueOnce(
      mockApiResponse({
        token: 'test-token',
        user: { id: 1, username: 'testuser' },
      })
    );

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    // 等待初始加载完成
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // 登录
    await act(async () => {
      await result.current.login('testuser', 'password');
    });

    expect(result.current.user).toEqual({ id: 1, username: 'testuser' });
    expect(result.current.isAuthenticated).toBe(true);
    expect(localStorageMock.setItem).toHaveBeenCalledWith('authToken', 'test-token');
  });

  it('handles login error', async () => {
    fetch.mockRejectedValueOnce(
      mockApiError('Invalid credentials', 401)
    );

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    // 等待初始加载完成
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // 尝试登录
    await act(async () => {
      try {
        await result.current.login('wronguser', 'wrongpassword');
      } catch (error) {
        // Expected error
      }
    });

    expect(result.current.user).toBeNull();
    expect(result.current.error).toBe('Invalid credentials');
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('logs out user and clears token', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    // 设置初始状态
    act(() => {
      result.current.user = { id: 1, username: 'testuser' };
      localStorageMock.getItem.mockReturnValue('test-token');
    });

    // 登出
    act(() => {
      result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('authToken');
  });

  it('checks stored token on mount', async () => {
    localStorageMock.getItem.mockReturnValue('stored-token');

    fetch.mockResolvedValueOnce(
      mockApiResponse({
        user: { id: 1, username: 'storeduser' },
      })
    );

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    // 等待初始加载完成
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.user).toEqual({ id: 1, username: 'storeduser' });
    expect(result.current.isAuthenticated).toBe(true);
  });
});