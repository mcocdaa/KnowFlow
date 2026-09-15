import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { App } from 'antd';
import type { AppDispatch, RootState } from '../store';
import { setCategories, setError, setLoading } from '../store/catalogSlice';
import api from '../services/api';
import { getErrorMessage } from '../utils';
import type { CategoryInput } from '../types';

export const useCategories = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { message } = App.useApp();
  const { categories, loading, error } = useSelector((state: RootState) => state.catalog);
  const [submitting, setSubmitting] = useState(false);

  const reload = useCallback(async () => {
    dispatch(setLoading(true));
    try {
      const list = await api.fetchCategories();
      dispatch(setCategories(list));
    } catch (loadError) {
      dispatch(setError(getErrorMessage(loadError, '分类加载失败')));
    }
  }, [dispatch]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const createCategory = useCallback(
    async (input: CategoryInput): Promise<boolean> => {
      setSubmitting(true);
      try {
        await api.createCategory(input);
        message.success('分类已创建');
        await reload();
        return true;
      } catch (createError) {
        message.error(getErrorMessage(createError, '创建失败'));
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [message, reload],
  );

  const updateCategory = useCallback(
    async (name: string, updates: Partial<CategoryInput>): Promise<boolean> => {
      setSubmitting(true);
      try {
        await api.updateCategory(name, updates);
        message.success('分类已更新');
        await reload();
        return true;
      } catch (updateError) {
        message.error(getErrorMessage(updateError, '保存失败'));
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [message, reload],
  );

  const deleteCategory = useCallback(
    async (name: string): Promise<boolean> => {
      try {
        await api.deleteCategory(name);
        message.success('分类已删除');
        await reload();
        return true;
      } catch (deleteError) {
        message.error(getErrorMessage(deleteError, '删除失败'));
        return false;
      }
    },
    [message, reload],
  );

  return { categories, loading, error, submitting, reload, createCategory, updateCategory, deleteCategory };
};
