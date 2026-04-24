// API错误处理工具

// 创建标准化的API错误对象
class ApiError extends Error {
  constructor(message, statusCode, details = {}) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

// 处理API响应
const handleApiResponse = async (response) => {
  // 检查响应状态
  if (!response.ok) {
    let errorMessage = `Request failed with status ${response.status}`;
    let errorDetails = {};
    
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
      errorDetails = errorData.details || {};
    } catch (e) {
      // 如果响应不是JSON格式，尝试获取文本
      try {
        const errorText = await response.text();
        errorDetails.rawResponse = errorText;
      } catch (textError) {
        // 忽略文本解析错误
      }
    }
    
    throw new ApiError(errorMessage, response.status, errorDetails);
  }
  
  // 尝试解析JSON响应
  try {
    return await response.json();
  } catch (error) {
    // 如果响应不是JSON格式，返回原始响应
    return response;
  }
};

// 创建带错误处理的API请求函数
const apiRequest = async (url, options = {}) => {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });
    
    return await handleApiResponse(response);
  } catch (error) {
    if (error instanceof ApiError) {
      // 重新抛出已知的API错误
      throw error;
    } else {
      // 包装其他错误为ApiError
      throw new ApiError(
        `Network error: ${error.message}`,
        0,
        { originalError: error }
      );
    }
  }
};

export { ApiError, handleApiResponse, apiRequest };