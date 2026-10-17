import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { App } from 'antd';
import type { AppDispatch, RootState } from '../store';
import { setCategories, setError, setKeys, setLoading } from '../store/catalogSlice';
import api from '../services/api';
import { getErrorMessage } from '../utils';
import { useI18n } from '../i18n';
import type { KeyDefinition } from '../types';

export type KeyPayload = Omit<
  Partial<KeyDefinition>,
  'plugin_name' | 'delete_with_plugin' | 'created_at' | 'updated_at'
>;

export const useKeys = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { message } = App.useApp();
  const { t } = useI18n();
  const { keys, categories, loading, error } = useSelector((state: RootState) => state.catalog);
  const [submitting, setSubmitting] = useState(false);

  const reload = useCallback(async () => {
    dispatch(setLoading(true));
    try {
      const [loadedKeys, loadedCategories] = await Promise.all([api.fetchKeys(), api.fetchCategories()]);
      dispatch(setKeys(loadedKeys));
      dispatch(setCategories(loadedCategories));
    } catch (loadError) {
      dispatch(setError(getErrorMessage(loadError, t('Key 加载失败', 'Failed to load keys'))));
    }
  }, [dispatch, t]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const createKey = useCallback(
    async (payload: KeyPayload): Promise<boolean> => {
      setSubmitting(true);
      try {
        await api.createKey(payload);
        message.success(t('Key 已创建', 'Key created'));
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

  const updateKey = useCallback(
    async (name: string, updates: KeyPayload): Promise<boolean> => {
      setSubmitting(true);
      try {
        await api.updateKey(name, updates);
        message.success(t('Key 已更新', 'Key updated'));
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

  const deleteKey = useCallback(
    async (name: string): Promise<boolean> => {
      try {
        await api.deleteKey(name);
        message.success(t('Key 已删除', 'Key deleted'));
        await reload();
        return true;
      } catch (deleteError) {
        message.error(getErrorMessage(deleteError, t('删除失败', 'Failed to delete')));
        return false;
      }
    },
    [message, reload, t],
  );

  return { keys, categories, loading, error, submitting, reload, createKey, updateKey, deleteKey };
};
