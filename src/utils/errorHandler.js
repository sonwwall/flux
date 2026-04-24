// 全局错误处理

// 处理未捕获的Promise拒绝
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled Promise Rejection:', event.reason);
  // 这里可以添加错误上报逻辑
});

// 处理全局JavaScript错误
window.addEventListener('error', (event) => {
  console.error('Global JavaScript Error:', event.error);
  // 这里可以添加错误上报逻辑
});

// 格式化错误信息，用于显示给用户
export const formatErrorForUser = (error) => {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  if (error && typeof error === 'object') {
    if (error.message) {
      return error.message;
    }
    if (error.error) {
      return error.error;
    }
  }
  
  return 'An unexpected error occurred';
};

// 判断是否为网络错误
export const isNetworkError = (error) => {
  return error && (
    error.message.includes('Network Error') ||
    error.message.includes('Failed to fetch') ||
    error.name === 'TypeError' && 
    (error.message.includes('NetworkError') || 
     error.message.includes('Failed to fetch'))
  );
};

// 判断是否为认证错误
export const isAuthError = (error) => {
  return error && (
    error.statusCode === 401 || 
    error.statusCode === 403 ||
    (error.message && (
      error.message.includes('unauthorized') ||
      error.message.includes('forbidden') ||
      error.message.includes('认证失败') ||
      error.message.includes('权限不足')
    ))
  );
};