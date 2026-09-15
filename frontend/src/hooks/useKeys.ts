import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { App } from 'antd';
import type { AppDispatch, RootState } from '../store';
import { setCategories, setError, setKeys, setLoading } from '../store/catalogSlice';
import api from '../services/api';
import { getErrorMessage } from '../utils';
import type { KeyDefinition } from '../types';

export type KeyPayload = Omit<
  Partial<KeyDefinition>,
  'plugin_name' | 'delete_with_plugin' | 'created_at' | 'updated_at'
>;

export const useKeys = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { message } = App.useApp();
  const { keys, categories, loading, error } = useSelector((state: RootState) => state.catalog);
  const [submitting, setSubmitting] = useState(false);

  const reload = useCallback(async () => {
    dispatch(setLoading(true));
    try {
      const [loadedKeys, loadedCategories] = await Promise.all([api.fetchKeys(), api.fetchCategories()]);
      dispatch(setKeys(loadedKeys));
      dispatch(setCategories(loadedCategories));
    } catch (loadError) {
      dispatch(setError(getErrorMessage(loadError, 'Key 加载失败')));
    }
  }, [dispatch]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const createKey = useCallback(
    async (payload: KeyPayload): Promise<boolean> => {
      setSubmitting(true);
      try {
        await api.createKey(payload);
        message.success('Key 已创建');
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

  const updateKey = useCallback(
    async (name: string, updates: KeyPayload): Promise<boolean> => {
      setSubmitting(true);
      try {
        await api.updateKey(name, updates);
        message.success('Key 已更新');
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

  const deleteKey = useCallback(
    async (name: string): Promise<boolean> => {
      try {
        await api.deleteKey(name);
        message.success('Key 已删除');
        await reload();
        return true;
      } catch (deleteError) {
        message.error(getErrorMessage(deleteError, '删除失败'));
        return false;
      }
    },
    [message, reload],
  );

  return { keys, categories, loading, error, submitting, reload, createKey, updateKey, deleteKey };
};
