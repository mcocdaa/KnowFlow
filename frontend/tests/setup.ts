// 测试设置文件
import '@testing-library/jest-dom';

// 模拟ResizeObserver
if (typeof window !== 'undefined' && !window.ResizeObserver) {
  window.ResizeObserver = class ResizeObserver {
    constructor(_callback: ResizeObserverCallback) {
      this.callback = _callback;
    }
    callback: ResizeObserverCallback;
    observe() {
      // 模拟观察元素
    }
    unobserve() {
      // 模拟取消观察
    }
    disconnect() {
      // 模拟断开连接
    }
  };
}
