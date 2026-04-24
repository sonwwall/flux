import { renderHook, act } from '@testing-library/react';
import { usePosts } from '../usePosts';
import { mockApiResponse, mockApiError } from '../../__tests__/utils/test-utils';

// 模拟fetch
global.fetch = jest.fn();

describe('usePosts', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  it('initializes with empty posts array', () => {
    const { result } = renderHook(() => usePosts());

    expect(result.current.posts).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('fetches posts successfully', async () => {
    const mockPosts = [
      { id: 1, title: 'Post 1' },
      { id: 2, title: 'Post 2' },
    ];

    fetch.mockResolvedValueOnce(
      mockApiResponse({
        data: mockPosts,
        pagination: { total: 2, page: 1, limit: 10 },
      })
    );

    const { result } = renderHook(() => usePosts());

    // 触发获取文章
    await act(async () => {
      await result.current.fetchPosts();
    });

    expect(result.current.posts).toEqual(mockPosts);
    expect(result.current.pagination).toEqual({ total: 2, page: 1, limit: 10 });
    expect(result.current.isLoading).toBe(false);
  });

  it('handles fetch posts error', async () => {
    fetch.mockRejectedValueOnce(
      mockApiError('Failed to fetch posts', 500)
    );

    const { result } = renderHook(() => usePosts());

    // 触发获取文章
    await act(async () => {
      try {
        await result.current.fetchPosts();
      } catch (error) {
        // Expected error
      }
    });

    expect(result.current.posts).toEqual([]);
    expect(result.current.error).toBe('Failed to fetch posts');
    expect(result.current.isLoading).toBe(false);
  });

  it('creates a new post', async () => {
    const newPost = { id: 3, title: 'New Post', content: 'Content' };

    fetch.mockResolvedValueOnce(
      mockApiResponse(newPost)
    );

    const { result } = renderHook(() => usePosts());

    // 创建文章
    await act(async () => {
      await result.current.createPost(newPost);
    });

    expect(result.current.posts).toContainEqual(newPost);
    expect(result.current.isLoading).toBe(false);
  });

  it('updates a post', async () => {
    const existingPosts = [
      { id: 1, title: 'Post 1' },
      { id: 2, title: 'Post 2' },
    ];

    const updatedPost = { id: 1, title: 'Updated Post' };

    fetch.mockResolvedValueOnce(
      mockApiResponse(updatedPost)
    );

    const { result } = renderHook(() => usePosts());

    // 设置初始文章列表
    act(() => {
      result.current.posts = existingPosts;
    });

    // 更新文章
    await act(async () => {
      await result.current.updatePost(1, updatedPost);
    });

    expect(result.current.posts).toEqual([
      updatedPost,
      existingPosts[1],
    ]);
    expect(result.current.isLoading).toBe(false);
  });

  it('deletes a post', async () => {
    const existingPosts = [
      { id: 1, title: 'Post 1' },
      { id: 2, title: 'Post 2' },
    ];

    fetch.mockResolvedValueOnce(
      mockApiResponse({ success: true })
    );

    const { result } = renderHook(() => usePosts());

    // 设置初始文章列表
    act(() => {
      result.current.posts = existingPosts;
    });

    // 删除文章
    await act(async () => {
      await result.current.deletePost(1);
    });

    expect(result.current.posts).toEqual([existingPosts[1]]);
    expect(result.current.isLoading).toBe(false);
  });
});