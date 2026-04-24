import { renderHook, act, waitFor } from '@testing-library/react';
import { useAuth } from '../useAuth';
import { AuthProvider } from '../useAuth';
import { mockApiResponse } from '../../__tests__/utils/test-utils';

// 模拟localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// 模拟fetch
global.fetch = jest.fn();

describe('useAuth', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockReset();
    localStorageMock.setItem.mockReset();
    localStorageMock.removeItem.mockReset();
    fetch.mockReset();
    // 默认返回 null (无 token)
    localStorageMock.getItem.mockReturnValue(null);
  });

  it('provides auth context', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    expect(result.current).toBeDefined();
    expect(result.current.login).toBeDefined();
    expect(result.current.logout).toBeDefined();
  });

  it('initializes with null user and loading state', async () => {
    // 无 token，初始加载会很快完成
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    // 初始状态可能是 loading，等待加载完成
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('sets user after successful login', async () => {
    // 模拟登录请求 - apiRequest 直接返回 response.json() 的结果
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
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
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
    // 模拟登录请求失败 - 返回 401 状态
    fetch.mockResolvedValueOnce(
      mockApiResponse({ message: 'Invalid credentials' }, 401)
    );

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    // 等待初始加载完成
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
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

  it('logs out user and clears token', async () => {
    // 设置有 token 的初始状态
    localStorageMock.getItem.mockReturnValue('existing-token');
    
    // 模拟验证 token 请求成功
    fetch.mockResolvedValueOnce(
      mockApiResponse({ user: { id: 1, username: 'testuser' } })
    );

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    // 等待初始加载完成并设置用户
    await waitFor(() => {
      expect(result.current.user).toEqual({ id: 1, username: 'testuser' });
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
    await waitFor(() => {
      expect(result.current.user).toEqual({ id: 1, username: 'storeduser' });
    });

    expect(result.current.isAuthenticated).toBe(true);
  });
});
