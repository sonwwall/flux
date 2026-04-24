import { useState, useEffect, useCallback } from 'react';
import { apiRequest } from '../utils/apiErrorHandler';

export const usePosts = () => {
  const [posts, setPosts] = useState([]);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // 获取文章列表
  const fetchPosts = useCallback(async (page = 1, limit = 10, newFilters = {}) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // 合并现有过滤器和新过滤器
      const allFilters = { ...filters, ...newFilters, page, limit };
      const queryParams = new URLSearchParams();
      
      Object.entries(allFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value);
        }
      });
      
      const response = await apiRequest(`/api/posts?${queryParams.toString()}`);
      
      if (response.data) {
        setPosts(response.data);
        setPagination(response.pagination || {});
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  // 获取单篇文章详情
  const fetchPost = useCallback(async (postId) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiRequest(`/api/posts/${postId}`);
      
      if (response.data) {
        return response.data;
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 创建新文章
  const createPost = useCallback(async (postData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiRequest('/api/posts', {
        method: 'POST',
        body: JSON.stringify(postData),
      });
      
      if (response.data) {
        // 添加到文章列表开头
        setPosts(prev => [response.data, ...prev]);
        return response.data;
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 更新文章
  const updatePost = useCallback(async (postId, postData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiRequest(`/api/posts/${postId}`, {
        method: 'PUT',
        body: JSON.stringify(postData),
      });
      
      if (response.data) {
        // 更新文章列表中的文章
        setPosts(prev => 
          prev.map(post => 
            post.id === postId ? response.data : post
          )
        );
        return response.data;
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 删除文章
  const deletePost = useCallback(async (postId) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await apiRequest(`/api/posts/${postId}`, {
        method: 'DELETE',
      });
      
      // 从文章列表中移除文章
      setPosts(prev => prev.filter(post => post.id !== postId));
      return true;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 更新过滤器
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  return {
    posts,
    pagination,
    filters,
    isLoading,
    error,
    fetchPosts,
    fetchPost,
    createPost,
    updatePost,
    deletePost,
    updateFilters,
  };
};