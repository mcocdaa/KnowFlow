import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router';
import { App } from 'antd';
import type { AppDispatch, RootState } from '../store';
import {
  removeItem as removeItemAction,
  setError,
  setLoading,
  setQuery,
  setResult,
} from '../store/librarySlice';
import api from '../services/api';
import { getErrorMessage } from '../utils';
import { useI18n } from '../i18n';
import type { ItemSort } from '../types';

export const DEFAULT_PAGE_SIZE = 20;

export interface LibraryQueryParams {
  q: string;
  key: string;
  keyValue: string;
  categoryName?: string;
  sort: ItemSort;
  page: number;
  pageSize: number;
}

export const useLibrary = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { message } = App.useApp();
  const { t } = useI18n();
  const [searchParams, setSearchParams] = useSearchParams();
  const { items, total, page, pageSize, loading, error } = useSelector((state: RootState) => state.library);
  const [refreshKey, setRefreshKey] = useState(0);
  const requestIdRef = useRef(0);

  const params: LibraryQueryParams = useMemo(() => {
    const categoryName = searchParams.get('category_name') ?? '';
    return {
      q: searchParams.get('q') ?? '',
      key: searchParams.get('key') ?? '',
      keyValue: searchParams.get('key_value') ?? '',
      ...(categoryName ? { categoryName } : {}),
      sort: (searchParams.get('sort') as ItemSort) || 'recent',
      page: Math.max(1, Number(searchParams.get('page')) || 1),
      pageSize: Number(searchParams.get('page_size')) || DEFAULT_PAGE_SIZE,
    };
  }, [searchParams]);

  useEffect(() => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    dispatch(
      setQuery({
        q: params.q,
        key: params.key,
        keyValue: params.keyValue,
        sort: params.sort,
        page: params.page,
      }),
    );
    dispatch(setLoading(true));

    api
      .searchItems(params)
      .then((result) => {
        if (requestIdRef.current === requestId) {
          dispatch(setResult(result));
        }
      })
      .catch((requestError) => {
        if (requestIdRef.current === requestId) {
          dispatch(setError(getErrorMessage(requestError, t('知识列表加载失败', 'Failed to load items'))));
        }
      });
  }, [params, refreshKey, dispatch, t]);

  const updateParams = useCallback(
    (patch: Partial<LibraryQueryParams>) => {
      const merged = { ...params, ...patch };
      const next = new URLSearchParams(searchParams);

      const setOrDelete = (key: string, value: string, defaultValue: string) => {
        if (value && value !== defaultValue) {
          next.set(key, value);
        } else {
          next.delete(key);
        }
      };

      setOrDelete('q', merged.q, '');
      setOrDelete('key', merged.key, '');
      setOrDelete('key_value', merged.keyValue, '');
      setOrDelete('category_name', merged.categoryName ?? '', '');
      setOrDelete('sort', merged.sort, 'recent');
      setOrDelete('page', String(merged.page), '1');
      setOrDelete('page_size', String(merged.pageSize), String(DEFAULT_PAGE_SIZE));

      setSearchParams(next);
    },
    [params, searchParams, setSearchParams],
  );

  const refresh = useCallback(() => {
    setRefreshKey((key) => key + 1);
  }, []);

  const removeItem = useCallback(
    async (id: string) => {
      try {
        await api.deleteItem(id);
        dispatch(removeItemAction(id));
        message.success(t('记录已删除', 'Item deleted'));
        if (items.length === 1 && page > 1) {
          updateParams({ page: page - 1 });
        } else {
          refresh();
        }
      } catch (removeError) {
        message.error(getErrorMessage(removeError, t('删除失败', 'Failed to delete')));
      }
    },
    [dispatch, items.length, page, message, refresh, updateParams, t],
  );

  return { items, total, page, pageSize, params, loading, error, updateParams, refresh, removeItem };
};
