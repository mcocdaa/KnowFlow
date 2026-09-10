# @file backend/test/test_doc_util.py
# @brief 文档工具单元测试
# @create 2026-08-22 10:00:00

from bson import ObjectId

from utils.doc_util import convert_doc, convert_docs, parse_object_id


class TestParseObjectId:
    def test_valid(self):
        oid = parse_object_id("507f1f77bcf86cd799439011")
        assert isinstance(oid, ObjectId)

    def test_invalid_inputs_return_none(self):
        assert parse_object_id("abc") is None
        assert parse_object_id("") is None
        assert parse_object_id(None) is None
        assert parse_object_id("zzzzzzzzzzzzzzzzzzzzzzzz") is None
        assert parse_object_id(123) is None


class TestConvertDoc:
    def test_converts_id_and_keeps_other_fields(self):
        doc = {"_id": ObjectId("507f1f77bcf86cd799439011"), "name": "x"}
        converted = convert_doc(doc)
        assert converted["id"] == "507f1f77bcf86cd799439011"
        assert "_id" not in converted
        assert converted["name"] == "x"
        # 原始入参不被修改
        assert "_id" in doc

    def test_none_and_empty(self):
        assert convert_doc(None) is None
        assert convert_docs([]) == []
