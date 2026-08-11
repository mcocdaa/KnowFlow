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

    def test_run_sync_executes_sync_callback(self, manager):
        calls = []

        def cb(*args, **kwargs):
            calls.append(1)

        manager.register("test_hook", cb)
        errors = manager.run_sync("test_hook")
        assert calls == [1]
        assert errors == []

    def test_run_sync_skips_async_callback(self, manager):
        calls = []

        async def cb(*args, **kwargs):
            calls.append(1)

        manager.register("test_hook", cb)
        errors = manager.run_sync("test_hook")
        assert calls == []
        assert errors == []

    def test_run_sync_collects_errors(self, manager):
        def bad(*args, **kwargs):
            raise RuntimeError("boom")

        manager.register("test_hook", bad)
        errors = manager.run_sync("test_hook")
        assert len(errors) == 1
        assert errors[0][0] == "bad"

    def test_run_sync_unknown_hook_returns_empty(self, manager):
        assert manager.run_sync("unknown_hook") == []
