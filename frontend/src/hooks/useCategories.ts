import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { App } from 'antd';
import type { AppDispatch, RootState } from '../store';
import { setCategories, setError, setLoading } from '../store/catalogSlice';
import api from '../services/api';
import { getErrorMessage } from '../utils';
import { useI18n } from '../i18n';
import type { CategoryInput } from '../types';

export const useCategories = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { message } = App.useApp();
  const { t } = useI18n();
  const { categories, loading, error } = useSelector((state: RootState) => state.catalog);
  const [submitting, setSubmitting] = useState(false);

  const reload = useCallback(async () => {
    dispatch(setLoading(true));
    try {
      const list = await api.fetchCategories();
      dispatch(setCategories(list));
    } catch (loadError) {
      dispatch(setError(getErrorMessage(loadError, t('分类加载失败', 'Failed to load categories'))));
    }
  }, [dispatch, t]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const createCategory = useCallback(
    async (input: CategoryInput): Promise<boolean> => {
      setSubmitting(true);
      try {
        await api.createCategory(input);
        message.success(t('分类已创建', 'Category created'));
        await reload();
        return true;
      } catch (createError) {
        message.error(getErrorMessage(createError, t('创建失败', 'Failed to create')));
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [message, reload, t],
  );

  const updateCategory = useCallback(
    async (name: string, updates: Partial<CategoryInput>): Promise<boolean> => {
      setSubmitting(true);
      try {
        await api.updateCategory(name, updates);
        message.success(t('分类已更新', 'Category updated'));
        await reload();
        return true;
      } catch (updateError) {
        message.error(getErrorMessage(updateError, t('保存失败', 'Failed to save')));
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [message, reload, t],
  );

  const deleteCategory = useCallback(
    async (name: string): Promise<boolean> => {
      try {
        await api.deleteCategory(name);
        message.success(t('分类已删除', 'Category deleted'));
        await reload();
        return true;
      } catch (deleteError) {
        message.error(getErrorMessage(deleteError, t('删除失败', 'Failed to delete')));
        return false;
      }
    },
    [message, reload, t],
  );

  return { categories, loading, error, submitting, reload, createCategory, updateCategory, deleteCategory };
};
