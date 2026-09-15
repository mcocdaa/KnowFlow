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

// jsdom 不实现 matchMedia；antd 的 Grid/Row/Col 在订阅断点时会直接调用
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string): MediaQueryList =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as unknown as MediaQueryList,
});

if (!window.requestAnimationFrame) {
  window.requestAnimationFrame = (callback: FrameRequestCallback) =>
    window.setTimeout(() => callback(performance.now()), 16);
  window.cancelAnimationFrame = (id: number) => window.clearTimeout(id);
}
