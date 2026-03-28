import React from 'react';

interface MenuItem {
  key: string;
  label: React.ReactNode;
  style?: React.CSSProperties;
  onClick?: () => void;
  children?: MenuItem[];
}

const normalizeParentName = (parentName: string | null): string | null => {
  if (parentName === null || parentName === 'null' || parentName === undefined || parentName === 'None') {
    return null;
  }
  return parentName;
};

export const buildCategoryTree = (
  categories: Array<{ name: string; title: string; parent_name: string | null }>,
  definitionList: Array<{ name: string; title: string; category_name: string }>,
  onKeyClick: (keyName: string) => void
): MenuItem[] => {
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
