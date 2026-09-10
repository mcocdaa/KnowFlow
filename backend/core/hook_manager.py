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

    async def run(self, hook_name: str, *args, **kwargs) -> list[tuple[str, Exception]]:
        """执行所有已注册的钩子（异步环境）：同步回调直接调用，异步回调 await；异常收集并记录"""
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
            params = list(inspect.signature(func).parameters.values())
            strip_first = bool(params) and params[0].name in ("self", "cls")

            @wraps(func)
            async def wrapper(*args, **kwargs):
                hook_args = args[1:] if strip_first and args else args
                if before:
                    await self.run(before, *hook_args, **kwargs)
                result = await func(*args, **kwargs)
                if after:
                    await self.run(after, result, *hook_args, **kwargs)
                return result

            return wrapper

        return decorator


hook_manager = HookManager()
