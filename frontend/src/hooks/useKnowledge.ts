import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import useApp from 'antd/es/app/useApp';
import type { RootState } from '../store';
import { setItems, setSearchResults, selectItem, updateKnowledgeItem, deleteKnowledgeItem, addKnowledgeItem } from '../store/knowledgeSlice';
import { setCategories, setDefinitions } from '../store/keySlice';
import api from '../services/api';
import type { KnowledgeItem } from '../types';

export const useInitialData = () => {
  const dispatch = useDispatch();
  const { message } = useApp();

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const [items, categories, keys] = await Promise.all([
          api.fetchItems(),
          api.fetchCategories(),
          api.fetchKeys(),
        ]);

        if (isMounted) {
          dispatch(setItems(items));
          dispatch(setCategories(categories));
          dispatch(setDefinitions(keys));
        }
      } catch (error) {
        if (isMounted) {
          console.error('Error loading data:', error);
          message.error('加载数据失败，请确保后端服务已在 http://localhost:3000 启动');
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [dispatch, message]);
};

export const useKnowledgeItems = () => {
  const dispatch = useDispatch();
  const { message } = useApp();
  const { items, searchResults, selectedItem } = useSelector((state: RootState) => state.knowledge);
  const { definitionList, categories } = useSelector((state: RootState) => state.key);

  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  const handleItemClick = useCallback((item: KnowledgeItem) => {
    dispatch(selectItem(item.id));
    setSelectedItemId(item.id);
  }, [dispatch]);

  const handleSearch = useCallback((value: string, sortBy: string) => {
    const searchTerms = value.trim().toLowerCase();
    let results = [...items];

    if (searchTerms) {
      results = results.filter(item => {
        if (!item) return false;
        const name = item.name?.toLowerCase() || '';
        const file_path = String(item.keyValues?.['file_path'] || '').toLowerCase();
        return name.includes(searchTerms) || file_path.includes(searchTerms);
      });
    }

    if (sortBy === 'recent') {
      results.sort((a: KnowledgeItem, b: KnowledgeItem) => {
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bTime - aTime;
      });
    }

    dispatch(setSearchResults(results));
  }, [dispatch, items]);

  const handleKeyClick = useCallback((keyName: string) => {
    const filteredItems = items.filter(item => {
      const value = item.keyValues?.[keyName];
      return value !== undefined && value !== null && value !== '';
    });

    dispatch(setSearchResults(filteredItems));
    message.success(`找到 ${filteredItems.length} 个包含 "${keyName}" 的文件`);
    return filteredItems;
  }, [dispatch, items, message]);

  const handleDeleteItem = useCallback(async (itemId: string) => {
    try {
      await api.deleteItem(itemId);
      dispatch(deleteKnowledgeItem(itemId));
      message.success('文件删除成功');
    } catch (error) {
      console.error('Error deleting item:', error);
      message.error('文件删除失败');
    }
  }, [dispatch, message]);

  const handleUpdateItem = useCallback(async (item: KnowledgeItem) => {
    try {
      const savedItem = await api.updateItem(item);
      dispatch(updateKnowledgeItem(savedItem));
      message.success('文件参数更新成功');
      return savedItem;
    } catch (error) {
      console.error('Error updating item:', error);
      message.error('文件参数更新失败');
      throw error;
    }
  }, [dispatch, message]);

  const handleUploadFile = useCallback(async (file: File, values: Record<string, unknown>) => {
    try {
      const newItem = await api.uploadFile(file, values);
      dispatch(addKnowledgeItem(newItem));
      message.success('文件上传成功');
      return newItem;
    } catch (error) {
      console.error('Upload error:', error);
      message.error((error as Error).message || '文件上传失败');
      throw error;
    }
  }, [dispatch, message]);

  const handleCreateItem = useCallback(async (values: Record<string, unknown>) => {
    try {
      const newItem = await api.createItem(values['name'] as string || '', values);
      dispatch(addKnowledgeItem(newItem));
      message.success('知识记录添加成功');
      return newItem;
    } catch (error) {
      console.error('Error adding item:', error);
      message.error('添加失败');
      throw error;
    }
  }, [dispatch, message]);

  const getSortedItems = useCallback((sortBy: string) => {
    const sorted = [...items];
    if (sortBy === 'recent') {
      sorted.sort((a, b) => {
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bTime - aTime;
      });
    }
    return sorted;
  }, [items]);

  const getDefaultFormValues = useCallback(() => {
    const defaultValues: Record<string, unknown> = {};
    definitionList.forEach(def => {
      defaultValues[def.name] = def.default_value;
    });
    return defaultValues;
  }, [definitionList]);

  return {
    items,
    searchResults,
    selectedItem,
    selectedItemId,
    setSelectedItemId,
    handleItemClick,
    handleSearch,
    handleKeyClick,
    handleDeleteItem,
    handleUpdateItem,
    handleUploadFile,
    handleCreateItem,
    getSortedItems,
    getDefaultFormValues,
    definitionList,
    categories,
  };
};
