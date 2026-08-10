# @file backend/core/hook_manager.py
# @brief Hook 管理器 - 实现动作钩子模式
# @create 2026-03-27

import asyncio
import inspect
import logging
from collections import defaultdict
from collections.abc import Callable
from functools import wraps

logger = logging.getLogger(__name__)


class HookManager:
    def __init__(self):
        self._hooks = defaultdict(list)

    def register(self, hook_name: str, callback: Callable, priority: int = 100):
        """手动注册钩子（priority 越小越先执行）"""
        self._hooks[hook_name].append((priority, callback))
        self._hooks[hook_name].sort(key=lambda x: x[0])

    async def run(self, hook_name: str, *args, **kwargs):
        """执行所有已注册的钩子"""
        errors = []
        for _, cb in self._hooks.get(hook_name, []):
            try:
                if asyncio.iscoroutinefunction(cb):
                    await cb(*args, **kwargs)
                else:
                    cb(*args, **kwargs)
            except Exception as e:
                errors.append((cb.__name__, e))
                logger.error(f"钩子执行失败 [{hook_name}]: {cb.__name__} - {e}", exc_info=True)
        return errors

    def unregister_by_module(self, module_prefix: str):
        """注销 module_prefix 下所有已注册的钩子回调"""
        for hook_name in list(self._hooks):
            self._hooks[hook_name] = [
                (priority, cb)
                for priority, cb in self._hooks[hook_name]
                if not (getattr(cb, "__module__", "") or "").startswith(module_prefix)
            ]

    def run_sync(self, hook_name: str, *args, **kwargs):
        """同步执行钩子（给同步包装器用）"""
        errors = []
        for _, cb in self._hooks.get(hook_name, []):
            try:
                if not asyncio.iscoroutinefunction(cb):
                    cb(*args, **kwargs)
                else:
                    msg = "异步钩子不能在同步环境中执行"
                    logger.warning(f"[{hook_name}]: {cb.__name__} - {msg}")
            except Exception as e:
                errors.append((cb.__name__, e))
                logger.error(f"钩子执行失败 [{hook_name}]: {cb.__name__} - {e}", exc_info=True)
        return errors

    def hook(self, hook_name: str, priority: int = 100):
        """装饰器：自动注册钩子

        用法：
            @hook_manager.hook("item_create_before", priority=10)
            def my_hook(item_data):
                pass
        """

        def decorator(callback: Callable):
            self.register(hook_name, callback, priority)
            return callback

        return decorator

    def _strip_self(self, func: Callable, args: tuple) -> tuple:
        """去掉绑定方法的 self/cls 参数，钩子回调只接收业务参数"""
        params = list(inspect.signature(func).parameters.values())
        if params and params[0].name in ("self", "cls") and args:
            return args[1:]
        return args

    def wrap_hooks(self, before: str = None, after: str = None):
        """装饰器：给核心服务的方法加钩子，自动在方法前后执行

        用法：
            class ItemManager:
                @hook_manager.wrap_hooks(before="item_create_before", after="item_create_after")
                async def create(self, item_data):
                    pass

        钩子回调签名：
            前置钩子: fn(*业务参数)         —— 不含 self
            后置钩子: fn(result, *业务参数)
        """

        def decorator(func: Callable):
            @wraps(func)
            async def async_wrapper(*args, **kwargs):
                hook_args = self._strip_self(func, args)
                if before:
                    await self.run(before, *hook_args, **kwargs)
                result = await func(*args, **kwargs)
                if after:
                    await self.run(after, result, *hook_args, **kwargs)
                return result

            @wraps(func)
            def sync_wrapper(*args, **kwargs):
                hook_args = self._strip_self(func, args)
                if before:
                    self.run_sync(before, *hook_args, **kwargs)

                result = func(*args, **kwargs)

                if after:
                    self.run_sync(after, result, *hook_args, **kwargs)
                return result

            if asyncio.iscoroutinefunction(func):
                return async_wrapper
            else:
                return sync_wrapper

        return decorator


hook_manager = HookManager()
