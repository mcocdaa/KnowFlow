import { openFileInExplorer, isElectron } from './electron';
import { tr } from '../i18n';

export const getErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof Error && error.message) {
    return tr(error.message);
  }
  if (typeof error === 'string' && error) {
    return tr(error);
  }
  return fallback;
};

export const openFileLocation = async (filePath: string, fallbackToCopy: (path: string) => void): Promise<void> => {
  if (!filePath) return;

  if (isElectron()) {
    try {
      await openFileInExplorer(filePath);
    } catch (err) {
      console.error('Electron open failed:', err);
      fallbackToCopy(filePath);
    }
  } else {
    fallbackToCopy(filePath);
  }
};
