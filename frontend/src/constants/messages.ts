export const MESSAGES = {
  SUCCESS: {
    UPLOAD: '文件上传成功',
    DELETE: '删除成功',
    UPDATE: '更新成功',
    CREATE: '创建成功',
    COPY: '已复制到剪贴板',
  },
  ERROR: {
    UPLOAD: '文件上传失败',
    DELETE: '删除失败',
    UPDATE: '更新失败',
    CREATE: '创建失败',
    FETCH: '数据获取失败',
  },
  INFO: {
    EMPTY: '暂无数据',
    LOADING: '加载中...',
  },
} as const;

export const PLACEHOLDERS = {
  SEARCH: '搜索文件...',
  INPUT: '请输入',
  SELECT: '请选择',
} as const;
