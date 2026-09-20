import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store';
import { setCategories, setError, setKeys } from '../store/catalogSlice';
import api from '../services/api';
import { getErrorMessage } from '../utils';

export const useCatalog = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { keys, categories } = useSelector((state: RootState) => state.catalog);
  const [reloadKey, setReloadKey] = useState(0);

  const refreshCatalog = () => {
    setReloadKey((k) => k + 1);
  };

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const [loadedKeys, loadedCategories] = await Promise.all([api.fetchKeys(), api.fetchCategories()]);
        if (!cancelled) {
          dispatch(setKeys(loadedKeys));
          dispatch(setCategories(loadedCategories));
        }
      } catch (error) {
        if (!cancelled) {
          dispatch(setError(getErrorMessage(error, '加载 Key/分类配置失败')));
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [dispatch, reloadKey]);

  return { keys, categories, refreshCatalog };
};
