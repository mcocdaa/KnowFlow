import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error('ErrorBoundary caught error:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 48, textAlign: 'center', color: '#64748b' }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>💥</div>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>页面出现异常</div>
          <div style={{ fontSize: 14 }}>请刷新页面重试，或检查后端服务是否正常</div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
