export const openFileInExplorer = (filePath: string): void => {
  if (!filePath) return;
  const isElectron = window.require && window.require('electron');
  if (isElectron) {
    try {
      const electron = window.require?.('electron');
      if (electron?.shell) {
        electron.shell.showItemInFolder(filePath);
      }
    } catch (err) {
      console.error('Electron open failed:', err);
    }
  }
};

export const copyToClipboard = async (text: string): Promise<void> => {
  if (!text) return;
  await navigator.clipboard.writeText(text);
};
