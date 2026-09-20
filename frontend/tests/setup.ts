// 测试设置文件
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

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
if (typeof window !== 'undefined') {
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
}

// 跟踪活动定时器并在每次测试用例后彻底清理，避免 JSDOM 销毁后异步延迟定时器触发并访问已销毁的 window
const pendingTimeouts = new Set<ReturnType<typeof setTimeout>>();
const pendingIntervals = new Set<ReturnType<typeof setInterval>>();

const originalSetTimeout = globalThis.setTimeout;
const originalClearTimeout = globalThis.clearTimeout;
const originalSetInterval = globalThis.setInterval;
const originalClearInterval = globalThis.clearInterval;

globalThis.setTimeout = ((handler: TimerHandler, timeout?: number, ...args: unknown[]) => {
  const holder: { timer?: ReturnType<typeof setTimeout> } = {};
  const safeHandler = (...cbArgs: unknown[]) => {
    if (holder.timer !== undefined) {
      pendingTimeouts.delete(holder.timer);
    }
    if (typeof handler === 'function') {
      try {
        handler(...cbArgs);
      } catch (err) {
        // 当 JSDOM 环境已被 Vitest 销毁时，忽略对已销毁 window 的访问错误
        if (err instanceof ReferenceError && err.message.includes('window')) {
          return;
        }
        throw err;
      }
    }
  };
  const timer = originalSetTimeout(safeHandler, timeout, ...args);
  holder.timer = timer;
  pendingTimeouts.add(timer);
  return timer;
}) as typeof setTimeout;

globalThis.clearTimeout = ((id?: ReturnType<typeof setTimeout>) => {
  if (id !== undefined) {
    pendingTimeouts.delete(id);
    originalClearTimeout(id);
  }
}) as typeof clearTimeout;

globalThis.setInterval = ((handler: TimerHandler, timeout?: number, ...args: unknown[]) => {
  const holder: { timer?: ReturnType<typeof setInterval> } = {};
  const safeHandler = (...cbArgs: unknown[]) => {
    if (typeof handler === 'function') {
      try {
        handler(...cbArgs);
      } catch (err) {
        if (err instanceof ReferenceError && err.message.includes('window')) {
          return;
        }
        throw err;
      }
    }
  };
  const timer = originalSetInterval(safeHandler, timeout, ...args);
  holder.timer = timer;
  pendingIntervals.add(timer);
  return timer;
}) as typeof setInterval;

globalThis.clearInterval = ((id?: ReturnType<typeof setInterval>) => {
  if (id !== undefined) {
    pendingIntervals.delete(id);
    originalClearInterval(id);
  }
}) as typeof clearInterval;

if (typeof window !== 'undefined') {
  window.setTimeout = globalThis.setTimeout;
  window.clearTimeout = globalThis.clearTimeout;
  window.setInterval = globalThis.setInterval;
  window.clearInterval = globalThis.clearInterval;
}

afterEach(() => {
  // 1. 显式卸载 React DOM 树
  cleanup();

  // 2. 清理所有未完成的定时器
  for (const id of pendingTimeouts) {
    originalClearTimeout(id);
  }
  pendingTimeouts.clear();

  for (const id of pendingIntervals) {
    originalClearInterval(id);
  }
  pendingIntervals.clear();

  // 3. 清理 Vitest 定时器状态
  vi.clearAllTimers();
});
