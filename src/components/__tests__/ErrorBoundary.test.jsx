import React from 'react';
import { render, screen } from '@testing-library/react';
import ErrorBoundary from '../ErrorBoundary';

// 创建一个会抛出错误的组件
const ThrowError = () => {
  throw new Error('Test error');
};

describe('ErrorBoundary', () => {
  // 抑制 console.error 以保持测试输出清洁
  let originalError;
  
  beforeAll(() => {
    originalError = console.error;
    console.error = jest.fn();
  });
  
  afterAll(() => {
    console.error = originalError;
  });

  it('renders children without error', () => {
    render(
      <ErrorBoundary>
        <div>Content</div>
      </ErrorBoundary>
    );

    expect(screen.getByText('Content')).toBeInTheDocument();
    expect(screen.queryByText('Oops! Something went wrong')).not.toBeInTheDocument();
  });

  it('catches errors and displays error message', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();
    // 使用更灵活的匹配方式，因为文本被分成多个元素
    expect(screen.getByText(/We're sorry, but something unexpected happened/)).toBeInTheDocument();
  });

  it('shows try again button', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByRole('button', { name: 'Try Again' })).toBeInTheDocument();
  });

  it('shows error details in development mode', () => {
    // 模拟开发环境
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText('Error Details')).toBeInTheDocument();
    
    // 恢复原始环境
    process.env.NODE_ENV = originalEnv;
  });

  it('hides error details in production mode', () => {
    // 模拟生产环境
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.queryByText('Error Details')).not.toBeInTheDocument();
    
    // 恢复原始环境
    process.env.NODE_ENV = originalEnv;
  });
});
