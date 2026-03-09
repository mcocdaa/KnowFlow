// 测试设置文件
import '@testing-library/jest-dom';

// 模拟ResizeObserver
if (typeof window !== 'undefined' && !window.ResizeObserver) {
  window.ResizeObserver = class ResizeObserver {
    constructor(callback: ResizeObserverCallback) {
      this.callback = callback;
    }
    callback: ResizeObserverCallback;
    observe(target: Element) {
      // 模拟观察元素
    }
    unobserve(target: Element) {
      // 模拟取消观察
    }
    disconnect() {
      // 模拟断开连接
    }
  };
}
