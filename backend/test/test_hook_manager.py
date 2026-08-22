# @file backend/test/test_hook_manager.py
# @brief Hook 管理器单元测试
# @create 2026-08-10 10:00:00

import pytest

from core.hook_manager import HookManager


class TestHookManager:
    @pytest.fixture
    def manager(self):
        return HookManager()

    @pytest.mark.asyncio
    async def test_run_executes_sync_callback(self, manager):
        calls = []

        def cb(*args, **kwargs):
            calls.append(1)

        manager.register("test_hook", cb)
        errors = await manager.run("test_hook")
        assert calls == [1]
        assert errors == []

    @pytest.mark.asyncio
    async def test_run_awaits_async_callback(self, manager):
        calls = []

        async def cb(*args, **kwargs):
            calls.append(1)

        manager.register("test_hook", cb)
        errors = await manager.run("test_hook")
        assert calls == [1]
        assert errors == []

    @pytest.mark.asyncio
    async def test_run_collects_errors_without_stopping(self, manager):
        calls = []

        def bad(*args, **kwargs):
            raise RuntimeError("boom")

        def good(*args, **kwargs):
            calls.append(1)

        manager.register("test_hook", bad, priority=1)
        manager.register("test_hook", good, priority=2)
        errors = await manager.run("test_hook")
        assert calls == [1]
        assert len(errors) == 1
        assert errors[0][0] == "bad"

    @pytest.mark.asyncio
    async def test_run_unknown_hook_returns_empty(self, manager):
        assert await manager.run("unknown_hook") == []

    @pytest.mark.asyncio
    async def test_wrap_hooks_strips_bound_self(self, manager):
        captured = {}

        class Service:
            @manager.wrap_hooks(before="svc_before")
            async def create(self, item_data):
                return item_data

        async def before_hook(item_data):
            captured["args"] = item_data

        manager.register("svc_before", before_hook)
        await Service().create({"a": 1})
        assert captured["args"] == {"a": 1}

    @pytest.mark.asyncio
    async def test_wrap_hooks_passes_result_to_after(self, manager):
        class Service:
            @manager.wrap_hooks(after="svc_after")
            async def create(self, item_data):
                return {"ok": True}

        captured = {}

        async def after_hook(result, item_data):
            captured["result"] = result
            captured["args"] = item_data

        manager.register("svc_after", after_hook)
        result = await Service().create("x")
        assert result == {"ok": True}
        assert captured == {"result": {"ok": True}, "args": "x"}

    @pytest.mark.asyncio
    async def test_wrap_hooks_preserves_module_metadata(self, manager):
        class Service:
            @manager.wrap_hooks()
            async def create(self):
                return None

        # unregister_by_module 依赖 __module__，装饰器必须保留元数据
        assert Service.create.__module__ == __name__
