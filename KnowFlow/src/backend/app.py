from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json
import uuid
import time
from datetime import datetime
import requests
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app)

# 配置
app.config['UPLOAD_FOLDER'] = os.environ.get('UPLOAD_DIR', './uploads')
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB

# 确保上传目录存在
if not os.path.exists(app.config['UPLOAD_FOLDER']):
    os.makedirs(app.config['UPLOAD_FOLDER'])

# 数据存储文件
db_file = './db.json'

# 初始化数据库
db = {
    'knowledgeItems': [],
    'categories': [
        {'id': '1', 'name': '内置 Key', 'parentId': None, 'isBuiltin': True},
        {'id': '2', 'name': '基础属性', 'parentId': '1', 'isBuiltin': True},
        {'id': '3', 'name': '统计属性', 'parentId': '1', 'isBuiltin': True},
        {'id': '4', 'name': '评价属性', 'parentId': '1', 'isBuiltin': True},
        {'id': '5', 'name': '时间属性', 'parentId': '1', 'isBuiltin': True},
        {'id': '6', 'name': '媒体属性', 'parentId': '1', 'isBuiltin': True},
        {'id': '7', 'name': '文献属性', 'parentId': '1', 'isBuiltin': True},
        {'id': '8', 'name': '自定义 Key', 'parentId': None, 'isBuiltin': False},
    ],
    'keyDefinitions': [
        {'id': '1', 'name': 'file_path', 'categoryId': '2', 'isBuiltin': True, 'dataType': 'string', 'script': '', 'description': '文件路径'},
        {'id': '2', 'name': 'file_type', 'categoryId': '2', 'isBuiltin': True, 'dataType': 'string', 'script': '', 'description': '文件类型'},
        {'id': '3', 'name': 'click_count', 'categoryId': '3', 'isBuiltin': True, 'dataType': 'number', 'script': '', 'description': '点击次数'},
        {'id': '4', 'name': 'star_rating', 'categoryId': '4', 'isBuiltin': True, 'dataType': 'number', 'script': '', 'description': '星级'},
        {'id': '5', 'name': 'created_at', 'categoryId': '5', 'isBuiltin': True, 'dataType': 'timestamp', 'script': '', 'description': '创建时间'},
        {'id': '6', 'name': 'image_resolution', 'categoryId': '6', 'isBuiltin': True, 'dataType': 'string', 'script': '', 'description': '图片分辨率'},
        {'id': '7', 'name': 'video_duration', 'categoryId': '6', 'isBuiltin': True, 'dataType': 'number', 'script': '', 'description': '视频时长'},
        {'id': '8', 'name': 'author', 'categoryId': '7', 'isBuiltin': True, 'dataType': 'string', 'script': '', 'description': '作者'},
        {'id': '9', 'name': 'publication_date', 'categoryId': '7', 'isBuiltin': True, 'dataType': 'date', 'script': '', 'description': '发表日期'},
    ],
}

# 加载数据
def load_data():
    global db
    try:
        if os.path.exists(db_file):
            with open(db_file, 'r', encoding='utf-8') as f:
                db = json.load(f)
            print('Data loaded from file')
        else:
            print('No data file found, using default data')
    except Exception as e:
        print(f'Error loading data: {e}')

# 保存数据
def save_data():
    try:
        with open(db_file, 'w', encoding='utf-8') as f:
            json.dump(db, f, indent=2, ensure_ascii=False)
        print('Data saved to file')
    except Exception as e:
        print(f'Error saving data: {e}')

# 加载数据
load_data()

# 插件管理
class PluginManager:
    def __init__(self):
        self.plugins = {}
        self.load_plugins()
    
    def load_plugins(self):
        plugins_dir = os.path.join(os.path.dirname(__file__), '../../plugins')
        if os.path.exists(plugins_dir):
            for plugin_dir in os.listdir(plugins_dir):
                plugin_path = os.path.join(plugins_dir, plugin_dir, 'main.py')
                if os.path.exists(plugin_path):
                    try:
                        # 动态导入插件
                        import importlib.util
                        spec = importlib.util.spec_from_file_location(plugin_dir, plugin_path)
                        if spec and spec.loader:
                            plugin = importlib.util.module_from_spec(spec)
                            spec.loader.exec_module(plugin)
                            if hasattr(plugin, 'info'):
                                self.plugins[plugin_dir] = plugin
                                print(f'Loaded plugin: {plugin_dir}')
                    except Exception as e:
                        print(f'Error loading plugin {plugin_dir}: {e}')
    
    def get_plugin(self, name):
        return self.plugins.get(name)
    
    def get_all_plugins(self):
        return [{'name': name, **plugin.info} for name, plugin in self.plugins.items()]
    
    def reload_plugin(self, name):
        if name in self.plugins:
            del self.plugins[name]
        self.load_plugins()
        return name in self.plugins

plugin_manager = PluginManager()

# API路由

# 获取所有知识项
@app.route('/api/knowledge', methods=['GET'])
def get_knowledge():
    return jsonify(db['knowledgeItems'])

# 添加知识项
@app.route('/api/knowledge', methods=['POST'])
def add_knowledge():
    data = request.json
    new_item = {
        'id': str(len(db['knowledgeItems']) + 1),
        **data,
        'clickCount': 0,
        'starRating': 0,
        'createdAt': datetime.now().isoformat(),
    }
    db['knowledgeItems'].append(new_item)
    save_data()
    return jsonify(new_item), 201

# 删除知识项
@app.route('/api/knowledge/<item_id>', methods=['DELETE'])
def delete_knowledge(item_id):
    for i, item in enumerate(db['knowledgeItems']):
        if item['id'] == item_id:
            db['knowledgeItems'].pop(i)
            save_data()
            return jsonify({'success': True}), 200
    return jsonify({'error': 'Item not found'}), 404

# 更新知识项
@app.route('/api/knowledge/<item_id>', methods=['PUT'])
def update_knowledge(item_id):
    data = request.json
    for i, item in enumerate(db['knowledgeItems']):
        if item['id'] == item_id:
            db['knowledgeItems'][i] = {**item, **data}
            save_data()
            return jsonify(db['knowledgeItems'][i]), 200
    return jsonify({'error': 'Item not found'}), 404

# 获取所有分类
@app.route('/api/categories', methods=['GET'])
def get_categories():
    return jsonify(db['categories'])

# 添加分类
@app.route('/api/categories', methods=['POST'])
def add_category():
    data = request.json
    new_category = {
        'id': str(len(db['categories']) + 1),
        **data,
    }
    db['categories'].append(new_category)
    save_data()
    return jsonify(new_category), 201

# 获取所有Key定义
@app.route('/api/keys', methods=['GET'])
def get_keys():
    return jsonify(db['keyDefinitions'])

# 添加Key定义
@app.route('/api/keys', methods=['POST'])
def add_key():
    data = request.json
    new_key = {
        'id': str(len(db['keyDefinitions']) + 1),
        **data,
    }
    db['keyDefinitions'].append(new_key)
    save_data()
    return jsonify(new_key), 201

# 文件上传API
@app.route('/api/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    filename = secure_filename(file.filename)
    unique_filename = f"{int(time.time())}-{uuid.uuid4()}-{filename}"
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
    file.save(file_path)
    
    new_item = {
        'id': str(len(db['knowledgeItems']) + 1),
        'filePath': file_path,
        'fileType': file.mimetype,
        'clickCount': 0,
        'starRating': 0,
        'createdAt': datetime.now().isoformat(),
        'keyValues': [],
    }
    
    db['knowledgeItems'].append(new_item)
    save_data()
    return jsonify(new_item), 201

# AI语义检索API
@app.route('/api/ai/search', methods=['POST'])
def ai_search():
    data = request.json
    query = data.get('query', '')
    
    try:
        # 简单的关键词匹配作为fallback
        results = [item for item in db['knowledgeItems'] if 
                  query.lower() in item['filePath'].lower() or 
                  (item.get('fileType') and query.lower() in item['fileType'].lower())]
        return jsonify(results)
    except Exception as e:
        print(f'AI search error: {e}')
        # 出错时使用简单的关键词匹配
        results = [item for item in db['knowledgeItems'] if 
                  query.lower() in item['filePath'].lower() or 
                  (item.get('fileType') and query.lower() in item['fileType'].lower())]
        return jsonify(results)

# AI自动打标签API
@app.route('/api/ai/auto-tag', methods=['POST'])
def auto_tag():
    try:
        # 简单的标签生成作为fallback
        tagged_items = [{
            **item,
            'tags': [item.get('fileType', 'unknown')]
        } for item in db['knowledgeItems']]
        return jsonify(tagged_items)
    except Exception as e:
        print(f'AI auto-tag error: {e}')
        # 出错时使用简单的标签生成
        tagged_items = [{
            **item,
            'tags': [item.get('fileType', 'unknown')]
        } for item in db['knowledgeItems']]
        return jsonify(tagged_items)

# 健康检查
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'ok'})

# 插件系统API

# 获取所有插件
@app.route('/api/plugins', methods=['GET'])
def get_plugins():
    plugins = plugin_manager.get_all_plugins()
    return jsonify(plugins)

# 获取单个插件
@app.route('/api/plugins/<name>', methods=['GET'])
def get_plugin(name):
    plugin = plugin_manager.get_plugin(name)
    if plugin:
        return jsonify({'name': name, **plugin.info})
    else:
        return jsonify({'error': 'Plugin not found'}), 404

# 重载插件
@app.route('/api/plugins/<name>/reload', methods=['POST'])
def reload_plugin(name):
    success = plugin_manager.reload_plugin(name)
    if success:
        return jsonify({'success': True, 'message': f'Plugin {name} reloaded'})
    else:
        return jsonify({'success': False, 'error': 'Plugin not found'}), 404

# 调用插件方法
@app.route('/api/plugins/<name>/run', methods=['POST'])
def run_plugin(name):
    data = request.json
    method = data.get('method')
    params = data.get('params', {})
    
    plugin = plugin_manager.get_plugin(name)
    if not plugin:
        return jsonify({'error': 'Plugin not found'}), 404
    
    if hasattr(plugin, method):
        try:
            result = getattr(plugin, method)(params)
            return jsonify({'success': True, 'result': result})
        except Exception as e:
            print(f'Error running plugin {name} method {method}: {e}')
            return jsonify({'success': False, 'error': str(e)}), 500
    else:
        return jsonify({'error': f'Method {method} not found in plugin {name}'}), 404

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3000, debug=True)
