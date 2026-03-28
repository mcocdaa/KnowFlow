import { useState, useCallback } from 'react';
import type { KnowledgeItem } from '../types';

interface UseModalStateReturn {
  isVisible: boolean;
  show: () => void;
  hide: () => void;
  toggle: () => void;
}

export const useModalState = (initialVisible = false): UseModalStateReturn => {
  const [isVisible, setIsVisible] = useState(initialVisible);

  const show = useCallback(() => setIsVisible(true), []);
  const hide = useCallback(() => setIsVisible(false), []);
  const toggle = useCallback(() => setIsVisible(prev => !prev), []);

  return { isVisible, show, hide, toggle };
};

interface UseMediaPreviewReturn {
  isVisible: boolean;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  showPreview: (url: string, type: 'image' | 'video') => void;
  hidePreview: () => void;
}

export const useMediaPreview = (): UseMediaPreviewReturn => {
  const [isVisible, setIsVisible] = useState(false);
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');

  const showPreview = useCallback((url: string, type: 'image' | 'video') => {
    setMediaUrl(url);
    setMediaType(type);
    setIsVisible(true);
  }, []);

  const hidePreview = useCallback(() => {
    setIsVisible(false);
    setMediaUrl('');
  }, []);

  return { isVisible, mediaUrl, mediaType, showPreview, hidePreview };
};

interface UseEditFormReturn {
  isVisible: boolean;
  editingItem: KnowledgeItem | null;
  formValues: Record<string, unknown>;
  pendingFile: File | null;
  showAddForm: (defaultValues?: Record<string, unknown>) => void;
  showEditForm: (item: KnowledgeItem) => void;
  showUploadForm: (file: File, defaultValues: Record<string, unknown>) => void;
  hideForm: () => void;
  getEditingItem: () => KnowledgeItem | null;
  getFormValues: () => Record<string, unknown>;
  getPendingFile: () => File | null;
}

export const useEditForm = (getDefaultFormValues: () => Record<string, unknown>): UseEditFormReturn => {
  const [isVisible, setIsVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<KnowledgeItem | null>(null);
  const [formValues, setFormValues] = useState<Record<string, unknown>>({});
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const showAddForm = useCallback((defaultValues?: Record<string, unknown>) => {
    setEditingItem(null);
    setFormValues(defaultValues || getDefaultFormValues());
    setPendingFile(null);
    setIsVisible(true);
  }, [getDefaultFormValues]);

  const showEditForm = useCallback((item: KnowledgeItem) => {
    setEditingItem(item);
    const values: Record<string, unknown> = {};
    Object.entries(item.keyValues || {}).forEach(([keyName, value]) => {
      values[keyName] = value;
    });
    values['name'] = item.name;
    setFormValues(values);
    setPendingFile(null);
    setIsVisible(true);
  }, []);

  const showUploadForm = useCallback((file: File, defaultValues: Record<string, unknown>) => {
    setEditingItem(null);
    const values = { ...defaultValues };
    values['name'] = file.name;
    values['file_path'] = file.name;
    values['file_type'] = file.type || '';
    setFormValues(values);
    setPendingFile(file);
    setIsVisible(true);
  }, []);

  const hideForm = useCallback(() => {
    setIsVisible(false);
    setEditingItem(null);
    setFormValues({});
    setPendingFile(null);
  }, []);

  const getEditingItem = useCallback(() => editingItem, [editingItem]);
  const getFormValues = useCallback(() => formValues, [formValues]);
  const getPendingFile = useCallback(() => pendingFile, [pendingFile]);

  return {
    isVisible,
    editingItem,
    formValues,
    pendingFile,
    showAddForm,
    showEditForm,
    showUploadForm,
    hideForm,
    getEditingItem,
    getFormValues,
    getPendingFile,
  };
};
