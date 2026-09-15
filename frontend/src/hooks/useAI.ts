import { useCallback, useState } from 'react';
import api from '../services/api';
import { getErrorMessage } from '../utils';
import type { KnowledgeItem, PagedItems } from '../types';

export const AI_CORPUS_SIZE = 50;

export const useAI = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [corpus, setCorpus] = useState<PagedItems | null>(null);
  const [searchResults, setSearchResults] = useState<KnowledgeItem[]>([]);
  const [tagResults, setTagResults] = useState<Record<string, string[]> | null>(null);

  const loadCorpus = useCallback(async (): Promise<PagedItems> => {
    if (corpus) return corpus;
    const result = await api.searchItems({ sort: 'recent', page: 1, pageSize: AI_CORPUS_SIZE });
    setCorpus(result);
    return result;
  }, [corpus]);

  const semanticSearch = useCallback(
    async (query: string) => {
      setLoading(true);
      setError(null);
      try {
        const current = await loadCorpus();
        const results = await api.aiSearch(query, current.items);
        setSearchResults(results);
      } catch (searchError) {
        setError(getErrorMessage(searchError, '语义检索失败'));
      } finally {
        setLoading(false);
      }
    },
    [loadCorpus],
  );

  const autoTag = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const current = await loadCorpus();
      const results = await api.autoTag(current.items);
      setTagResults(results);
    } catch (tagError) {
      setError(getErrorMessage(tagError, '自动打标签失败'));
    } finally {
      setLoading(false);
    }
  }, [loadCorpus]);

  return { loading, error, corpus, searchResults, tagResults, semanticSearch, autoTag };
};
