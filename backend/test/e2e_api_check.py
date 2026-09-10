# @file backend/test/e2e_api_check.py
# @brief 真实环境 API 端到端回归检查（需后端已启动，不依赖 pytest）
# @create 2026-09-10 10:00:00
#
# 用法：
#   cd backend && python test/e2e_api_check.py                 # 默认 http://localhost:3000/api/v1，结束后清理测试数据
#   python test/e2e_api_check.py --keep                        # 保留测试数据（便于 UI 查看）
#   python test/e2e_api_check.py --base http://localhost:5177/api/v1   # 经前端 dev server 代理检查
#   环境变量 API_BASE 亦可指定基础地址
#
# 退出码：0 = 全部通过，1 = 存在失败项
#
# 覆盖：健康检查 / 插件清单 / 默认数据种子 / 分类父子 / Key 管理（UI 载荷）/
#       知识项 CRUD / 搜索（关键词、Key 过滤、排序、分页）/ 文件上传与静态访问 /
#       评分插件 / OpenClaw 插件 / AI 优雅降级 / 必填校验 / 删除

import argparse
import json
import os
import sys

import httpx

ITEM_SEARCH_PAGE_SIZE = 100

results: list[tuple[str, str, bool]] = []


def check(feature: str, name: str, cond, detail: str = "") -> bool:
    ok = bool(cond)
    results.append((feature, name, ok))
    print(f"[{'PASS' if ok else 'FAIL'}] {feature} | {name}" + (f" | {detail}" if detail else ""))
    return ok


def envelope(response: httpx.Response) -> dict:
    try:
        return response.json()
    except Exception:
        return {}


def cleanup(client: httpx.Client) -> None:
    """清理本脚本创建的数据（按 E2E 命名约定），保证可重复运行"""
    for key in ("e2e_author",):
        client.delete(f"/keys/{key}")
    response = client.get("/item/search", params={"q": "E2E", "page_size": ITEM_SEARCH_PAGE_SIZE})
    for item in envelope(response).get("data", {}).get("items", []):
        if (item["item"].get("name") or "").startswith("E2E "):
            client.delete(f"/item/{item['item']['id']}")
    for category in ("E2E 后端规范", "E2E 技术文档"):
        client.delete(f"/categories/{category}")


def run_checks(client: httpx.Client) -> None:
    # ---------- 健康检查 ----------
    response = client.get("/health")
    check(
        "健康检查", "GET /health 返回 ok", response.status_code == 200 and envelope(response)["data"]["status"] == "ok"
    )

    # ---------- 插件系统 ----------
    response = client.get("/plugins/manifests")
    names = {m["name"] for m in envelope(response)["data"]}
    check(
        "插件系统", "rating / knowflow_openclaw 均已加载", {"rating", "knowflow_openclaw"} <= names, str(sorted(names))
    )

    # ---------- 默认数据初始化（YAML 种子 + 插件注册） ----------
    response = client.get("/categories")
    categories = envelope(response)["data"]
    names = {x["name"] for x in categories}
    check("默认数据", "内置分类已初始化", {"basic_category", "inner_category"} <= names, str(sorted(names))[:120])
    check("默认数据", "分类响应含服务端时间戳", all(x.get("created_at") and x.get("updated_at") for x in categories))
    response = client.get("/keys")
    key_names = {x["name"] for x in envelope(response)["data"]}
    check(
        "默认数据",
        "内置 Key 与插件 Key 已初始化",
        {"name", "file_path", "rating", "openclaw_project_id"} <= key_names,
        str(sorted(key_names))[:160],
    )

    # ---------- 分类管理：父子层级 ----------
    response = client.post(
        "/categories", json={"name": "E2E 技术文档", "title": "E2E 技术文档", "parent_name": None, "is_builtin": False}
    )
    check("分类管理", "创建父分类", response.status_code == 200, response.text[:100])
    response = client.post(
        "/categories",
        json={"name": "E2E 后端规范", "title": "E2E 后端规范", "parent_name": "E2E 技术文档", "is_builtin": False},
    )
    check("分类管理", "创建子分类", response.status_code == 200, response.text[:100])
    response = client.get("/categories")
    children = [x["name"] for x in envelope(response)["data"] if x.get("parent_name") == "E2E 技术文档"]
    check("分类管理", "父分类下可查到子分类", children == ["E2E 后端规范"], str(children))
    response = client.put("/categories/E2E 后端规范", json={"title": "E2E 后端开发规范"})
    check(
        "分类管理",
        "更新分类标题",
        response.status_code == 200 and envelope(response)["data"]["title"] == "E2E 后端开发规范",
    )

    # ---------- Key 管理（UI 同款载荷：不含服务端托管字段） ----------
    response = client.post(
        "/keys",
        json={
            "name": "e2e_author",
            "title": "E2E 作者",
            "value_type": "string",
            "default_value": "",
            "description": "E2E 检查用 Key",
            "category_name": "E2E 技术文档",
            "is_required": False,
            "is_visible": True,
        },
    )
    check("Key 管理", "创建自定义 Key（UI 载荷）", response.status_code == 200, response.text[:120])
    response = client.get("/keys/e2e_author")
    check(
        "Key 管理",
        "查询 Key 定义",
        response.status_code == 200 and envelope(response)["data"]["value_type"] == "string",
    )
    response = client.put("/keys/e2e_author", json={"description": "E2E 更新后的描述"})
    check(
        "Key 管理",
        "更新 Key 描述",
        response.status_code == 200 and "更新后" in envelope(response)["data"]["description"],
    )

    # ---------- 知识项 CRUD ----------
    response = client.post(
        "/item",
        json={
            "name": "E2E 部署手册",
            "attributes": {
                "name": "E2E 部署手册",
                "file_path": "e2e/deploy.md",
                "file_type": "text/markdown",
                "e2e_author": "张三",
                "openclaw_project_id": "e2e",
            },
        },
    )
    check("知识项 CRUD", "创建知识项（attributes 载荷）", response.status_code == 200, response.text[:140])
    item_id = envelope(response)["data"]["item"]["id"]
    check("知识项 CRUD", "返回属性值正确", envelope(response)["data"]["attributes"]["e2e_author"] == "张三")
    response = client.get(f"/item/{item_id}")
    check(
        "知识项 CRUD",
        "按 ID 查询",
        response.status_code == 200 and envelope(response)["data"]["item"]["name"] == "E2E 部署手册",
    )
    response = client.put(f"/item/{item_id}", json={"name": "E2E 部署手册 v2", "attributes": {"e2e_author": "李四"}})
    check(
        "知识项 CRUD",
        "更新名称与属性",
        response.status_code == 200 and envelope(response)["data"]["attributes"]["e2e_author"] == "李四",
    )
    response = client.get("/item")
    check(
        "知识项 CRUD",
        "获取全部知识项",
        response.status_code == 200 and any(x["item"]["id"] == item_id for x in envelope(response)["data"]),
    )

    # ---------- 搜索：关键词 / Key 过滤 / 排序 / 分页 ----------
    response = client.get("/item/search", params={"q": "E2E", "sort": "recent", "page": 1, "page_size": 10})
    check("搜索", "关键词搜索", response.status_code == 200 and envelope(response)["data"]["total"] >= 1)
    response = client.get("/item/search", params={"key": "e2e_author", "key_value": "李四"})
    check("搜索", "按 Key 过滤", response.status_code == 200 and envelope(response)["data"]["total"] >= 1)
    response = client.get("/item/search", params={"sort": "name", "page_size": 5})
    check("搜索", "按名称排序", response.status_code == 200 and "items" in envelope(response)["data"])
    response = client.get("/item/search", params={"page": 2, "page_size": 1})
    check("搜索", "分页", response.status_code == 200 and envelope(response)["data"]["page"] == 2)

    # ---------- 文件上传 + 静态访问 ----------
    response = client.post(
        "/upload",
        files={"file": ("E2E 架构设计.txt", "E2E 分层架构说明".encode(), "text/plain")},
        data={"data": json.dumps({"attributes": {"name": "E2E 架构设计.txt", "openclaw_project_id": "e2e"}})},
    )
    data = envelope(response)["data"]
    check(
        "文件上传",
        "上传并自动填充 file_path/file_type",
        response.status_code == 200 and data["attributes"]["file_type"] == "text/plain",
        response.text[:140],
    )
    file_path = str(data.get("attributes", {}).get("file_path", ""))
    if file_path:
        static = client.get(f"/uploads/{os.path.basename(file_path)}")
        check("文件上传", "上传文件可通过静态路由访问", static.status_code == 200 and "E2E" in static.text)
    else:
        check("文件上传", "上传文件可通过静态路由访问", False, "file_path 为空")

    # ---------- 评分插件 ----------
    response = client.put(f"/plugins/rating/items/{item_id}/rating", json={"rating": 5})
    check("评分插件", "设置 5 星", response.status_code == 200 and envelope(response)["data"]["rating"] == 5)
    response = client.get(f"/plugins/rating/items/{item_id}/rating")
    check("评分插件", "读取评分", response.status_code == 200 and envelope(response)["data"]["rating"] == 5)
    response = client.get("/item/search", params={"sort": "rating", "page_size": 5})
    top = envelope(response)["data"]["items"]
    check(
        "评分插件",
        "按评分排序生效",
        response.status_code == 200 and bool(top) and top[0]["attributes"].get("rating") in (5, "5"),
    )

    # ---------- OpenClaw 插件 ----------
    response = client.put(
        f"/plugins/knowflow_openclaw/items/{item_id}/openclaw",
        json={
            "openclaw_project_id": "e2e",
            "openclaw_archive_type": "document",
            "openclaw_fold_level": 2,
            "openclaw_agent_source": "e2e-check",
            "openclaw_summary": "E2E 摘要",
            "openclaw_flow_id": "e2e-flow",
        },
    )
    check(
        "OpenClaw 插件",
        "PUT 全量属性",
        response.status_code == 200 and envelope(response)["data"]["openclaw_fold_level"] == 2,
    )
    response = client.patch(
        f"/plugins/knowflow_openclaw/items/{item_id}/openclaw", json={"openclaw_summary": "E2E 更新摘要"}
    )
    check(
        "OpenClaw 插件",
        "PATCH 局部更新",
        response.status_code == 200 and envelope(response)["data"]["openclaw_summary"] == "E2E 更新摘要",
    )
    response = client.get(f"/plugins/knowflow_openclaw/items/{item_id}/openclaw")
    check(
        "OpenClaw 插件",
        "GET 回读一致",
        response.status_code == 200 and envelope(response)["data"]["openclaw_summary"] == "E2E 更新摘要",
    )
    response = client.get("/categories")
    check("OpenClaw 插件", "插件分类已注册", any(x["name"] == "openclaw_category" for x in envelope(response)["data"]))

    # ---------- AI：已配置返回结果 / 未配置优雅降级 ----------
    brief = {"id": item_id, "name": "E2E", "attributes": {"e2e_author": "李四"}}
    response = client.post("/ai/search", json={"query": "E2E", "items": [brief]})
    check(
        "AI 能力", "search 接受 attributes（200 或 503 降级）", response.status_code in (200, 503), response.text[:100]
    )
    response = client.post("/ai/auto-tag", json={"items": [brief]})
    check(
        "AI 能力",
        "auto-tag 接受 attributes（200 或 503 降级）",
        response.status_code in (200, 503),
        response.text[:100],
    )
    response = client.post("/ai/search", json={"query": "   ", "items": []})
    check("AI 能力", "空 query 返回 400", response.status_code == 400 and "不能为空" in envelope(response)["message"])

    # ---------- 必填校验 ----------
    response = client.post("/item", json={"name": "E2E 缺必填", "attributes": {"e2e_author": "无"}})
    message = envelope(response).get("message", "")
    check(
        "必填校验",
        "缺必填 Key 返回 400",
        response.status_code == 400 and "Missing required keys" in message,
        message[:120],
    )

    # ---------- 删除 ----------
    response = client.post(
        "/item",
        json={
            "name": "E2E 临时示例项",
            "attributes": {"name": "E2E 临时示例项", "file_path": "e2e/tmp.txt", "openclaw_project_id": "e2e"},
        },
    )
    temp_id = envelope(response)["data"]["item"]["id"]
    response = client.delete(f"/item/{temp_id}")
    check("删除", "删除知识项", response.status_code == 200)
    response = client.get(f"/item/{temp_id}")
    check("删除", "删除后查询 404", response.status_code == 404)


def main() -> int:
    parser = argparse.ArgumentParser(description="KnowFlow API 端到端回归检查")
    parser.add_argument(
        "--base", default=os.environ.get("API_BASE", "http://localhost:3000/api/v1"), help="API 基础地址"
    )
    parser.add_argument("--keep", action="store_true", help="保留测试数据（默认结束后清理）")
    parser.add_argument("--timeout", type=float, default=30.0, help="请求超时秒数")
    args = parser.parse_args()

    print(f"目标 API：{args.base}")
    with httpx.Client(base_url=args.base, timeout=args.timeout) as client:
        cleanup(client)
        try:
            run_checks(client)
        finally:
            if not args.keep:
                cleanup(client)
                print("已清理测试数据（--keep 可保留）")

    failed = [x for x in results if not x[2]]
    print(f"\n共 {len(results)} 项，PASS {len(results) - len(failed)}，FAIL {len(failed)}")
    if failed:
        for feature, name, _ in failed:
            print(f"  FAIL: {feature} | {name}")
        return 1
    print("全部功能实测通过")
    return 0


if __name__ == "__main__":
    sys.exit(main())
