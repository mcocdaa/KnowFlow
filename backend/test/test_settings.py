# @file backend/test/test_settings.py
# @brief 配置读取单元测试
# @create 2026-08-22 10:00:00

from config.settings import read_secret


class TestReadSecret:
    def test_file_env_ignores_comments_and_blank_lines(self, tmp_path, monkeypatch):
        secret_file = tmp_path / "secret.txt"
        secret_file.write_text("# comment line\n\nreal-value\n", encoding="utf-8")
        monkeypatch.setenv("MY_TEST_SECRET_FILE", str(secret_file))

        assert read_secret("MY_TEST_SECRET", "fallback") == "real-value"

    def test_file_env_only_comments_returns_empty(self, tmp_path, monkeypatch):
        secret_file = tmp_path / "secret.txt"
        secret_file.write_text("# 豆包 AI API Key\n# 尚未填写\n", encoding="utf-8")
        monkeypatch.setenv("MY_TEST_SECRET_FILE", str(secret_file))

        assert read_secret("MY_TEST_SECRET", "fallback") == ""

    def test_falls_back_to_env_var(self, monkeypatch):
        monkeypatch.delenv("MY_TEST_SECRET_FILE", raising=False)
        monkeypatch.setenv("MY_TEST_SECRET", "env-value")

        assert read_secret("MY_TEST_SECRET", "fallback") == "env-value"

    def test_falls_back_to_default(self, monkeypatch):
        monkeypatch.delenv("MY_TEST_SECRET_FILE", raising=False)
        monkeypatch.delenv("MY_TEST_SECRET", raising=False)

        assert read_secret("MY_TEST_SECRET", "fallback") == "fallback"
