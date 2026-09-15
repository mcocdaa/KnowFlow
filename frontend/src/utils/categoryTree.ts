import type { CategoryDefinition } from '../types';

export const collectDescendants = (
  categories: CategoryDefinition[],
  name: string,
): Set<string> => {
  const result = new Set<string>([name]);
  let changed = true;

  while (changed) {
    changed = false;
    categories.forEach((category) => {
      if (category.parent_name && result.has(category.parent_name) && !result.has(category.name)) {
        result.add(category.name);
        changed = true;
      }
    });
  }

  return result;
};

export interface CategoryTreeNode {
  value: string;
  title: string;
  children: CategoryTreeNode[];
}

export const buildCategoryTree = (
  categories: CategoryDefinition[],
  excluded: Set<string> = new Set(),
): CategoryTreeNode[] => {
  const childrenOf = (parent: string) =>
    categories.filter((category) => category.parent_name === parent && !excluded.has(category.name));

  const toNode = (category: CategoryDefinition): CategoryTreeNode => ({
    value: category.name,
    title: category.title,
    children: childrenOf(category.name).map(toNode),
  });

  return categories
    .filter((category) => !category.parent_name && !excluded.has(category.name))
    .map(toNode);
};
