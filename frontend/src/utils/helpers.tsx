import { openFileInExplorer, isElectron } from './electron';

export const getErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof Error && error.message) {
    return error.message;
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
