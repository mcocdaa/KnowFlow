export const isElectron = (): boolean => {
  return typeof window !== 'undefined' && !!window.knowflow;
};

export const openFileInExplorer = async (filePath: string): Promise<void> => {
  if (!filePath) return;
  if (!isElectron()) return;
  try {
    await window.knowflow?.showItemInFolder(filePath);
  } catch (err) {
    console.error('Electron open failed:', err);
    throw err;
  }
};
