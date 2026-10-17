import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store';
import { setError, setLoading, setManifests } from '../store/pluginsSlice';
import api from '../services/api';
import { getErrorMessage } from '../utils';
import { useI18n } from '../i18n';

export const usePlugins = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useI18n();
  const { manifests, loading, error } = useSelector((state: RootState) => state.plugins);

  const reload = useCallback(async () => {
    dispatch(setLoading(true));
    try {
      const list = await api.fetchPluginManifests();
      dispatch(setManifests(list));
    } catch (loadError) {
      dispatch(setError(getErrorMessage(loadError, t('插件加载失败', 'Failed to load plugins'))));
    }
  }, [dispatch, t]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { manifests, loading, error, reload };
};
