import { renderHook, act, waitFor } from '@testing-library/react';
import { usePosts } from '../usePosts';
import { mockApiResponse } from '../../__tests__/utils/test-utils';

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
    // 模拟返回 500 错误状态
    fetch.mockResolvedValueOnce(
      mockApiResponse({ message: 'Failed to fetch posts' }, 500)
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

    // 创建文章接口返回格式需要包含 data 字段
    fetch.mockResolvedValueOnce(
      mockApiResponse({ data: newPost })
    );

    const { result } = renderHook(() => usePosts());

    // 创建文章
    await act(async () => {
      await result.current.createPost({ title: 'New Post', content: 'Content' });
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

    // 先获取文章列表
    fetch.mockResolvedValueOnce(
      mockApiResponse({
        data: existingPosts,
        pagination: { total: 2, page: 1, limit: 10 },
      })
    );
    
    // 更新文章返回格式需要包含 data 字段
    fetch.mockResolvedValueOnce(
      mockApiResponse({ data: updatedPost })
    );

    const { result } = renderHook(() => usePosts());

    // 先获取文章列表
    await act(async () => {
      await result.current.fetchPosts();
    });

    // 更新文章
    await act(async () => {
      await result.current.updatePost(1, { title: 'Updated Post' });
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

    // 先获取文章列表
    fetch.mockResolvedValueOnce(
      mockApiResponse({
        data: existingPosts,
        pagination: { total: 2, page: 1, limit: 10 },
      })
    );
    
    // 删除文章返回
    fetch.mockResolvedValueOnce(
      mockApiResponse({ success: true })
    );

    const { result } = renderHook(() => usePosts());

    // 先获取文章列表
    await act(async () => {
      await result.current.fetchPosts();
    });

    // 删除文章
    await act(async () => {
      await result.current.deletePost(1);
    });

    expect(result.current.posts).toEqual([existingPosts[1]]);
    expect(result.current.isLoading).toBe(false);
  });
});
