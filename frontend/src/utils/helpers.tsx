import React from 'react';
import { FileOutlined, FileImageOutlined, FilePdfOutlined, FileTextOutlined, VideoCameraOutlined } from '@ant-design/icons';

export const getFileIcon = (fileType?: string): React.ReactNode => {
  if (!fileType) return <FileOutlined />;
  if (fileType.includes('image')) return <FileImageOutlined />;
  if (fileType.includes('video')) return <VideoCameraOutlined />;
  if (fileType.includes('pdf')) return <FilePdfOutlined />;
  if (fileType.includes('text') || fileType.includes('markdown')) return <FileTextOutlined />;
  return <FileOutlined />;
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const openFileLocation = (filePath: string, fallbackToCopy: (path: string) => void): void => {
  if (!filePath) return;

  const isElectron = window.require && window.require('electron');

  if (isElectron) {
    try {
      const { shell } = window.require('electron');
      shell.showItemInFolder(filePath);
    } catch (err) {
      console.error('Electron open failed:', err);
      fallbackToCopy(filePath);
    }
  } else {
    fallbackToCopy(filePath);
  }
};

interface MenuItem {
  key: string;
  label: React.ReactNode;
  style?: React.CSSProperties;
  onClick?: () => void;
  children?: MenuItem[];
}

export const buildCategoryTree = (
  categories: Array<{ name: string; title: string; parent_name: string | null }>,
  definitionList: Array<{ name: string; title: string; category_name: string }>,
  onKeyClick: (keyName: string) => void
): MenuItem[] => {
  const normalizeParentName = (parentName: string | null): string | null => {
    if (parentName === null || parentName === 'null' || parentName === undefined || parentName === 'None') {
      return null;
    }
    return parentName;
  };

  const buildTree = (parentName: string | null): MenuItem[] => {
    const normalizedParent = normalizeParentName(parentName);
    return categories
      .filter(cat => normalizeParentName(cat.parent_name) === normalizedParent)
      .map(cat => {
        const normalizedCatName = normalizeParentName(cat.name);
        const hasChildCategories = categories.some(c => normalizeParentName(c.parent_name) === normalizedCatName);
        const categoryKeys = definitionList.filter(def => def.category_name === cat.name);

        const children: MenuItem[] = [];

        if (hasChildCategories) {
          children.push(...buildTree(normalizedCatName));
        }

        if (categoryKeys.length > 0) {
          children.push(...categoryKeys.map(keyDef => ({
            key: `key-${keyDef.name}`,
            label: (
              <span style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#52c41a',
              }}>
                <span style={{ fontSize: '12px' }}>🔑</span>
                <span>{keyDef.title}</span>
              </span>
            ),
            onClick: () => onKeyClick(keyDef.name),
            style: {
              borderRadius: '6px',
              marginLeft: '8px',
              fontSize: '13px',
              fontWeight: 500,
            },
          })));
        }

        return {
          key: `cat-${cat.name}`,
          label: cat.title,
          style: {
            borderRadius: '6px',
            marginLeft: parentName ? '8px' : '0',
            fontSize: hasChildCategories ? '14px' : '13px',
            fontWeight: hasChildCategories ? 600 : 400,
          },
          children: children.length > 0 ? children : undefined,
        };
      });
  };

  return buildTree(null);
};
