import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store';
import { setError, setLoading, setManifests } from '../store/pluginsSlice';
import api from '../services/api';
import { getErrorMessage } from '../utils';

export const usePlugins = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { manifests, loading, error } = useSelector((state: RootState) => state.plugins);

  const reload = useCallback(async () => {
    dispatch(setLoading(true));
    try {
      const list = await api.fetchPluginManifests();
      dispatch(setManifests(list));
    } catch (loadError) {
      dispatch(setError(getErrorMessage(loadError, '插件加载失败')));
    }
  }, [dispatch]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { manifests, loading, error, reload };
};
