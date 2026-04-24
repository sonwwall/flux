import { render } from '@testing-library/react';
import { AuthProvider } from '../../hooks/useAuth';

// 自定义render函数，包含AuthProvider
const renderWithProviders = (component, options = {}) => {
  return render(
    <AuthProvider>
      {component}
    </AuthProvider>,
    options
  );
};

// 模拟API响应
const mockApiResponse = (data, status = 200) => {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => data,
    text: async () => JSON.stringify(data),
  };
};

// 模拟API错误
const mockApiError = (message, status = 400) => {
  const error = new Error(message);
  error.response = mockApiResponse({ message }, status);
  throw error;
};

export { renderWithProviders, mockApiResponse, mockApiError };