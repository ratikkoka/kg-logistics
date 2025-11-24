/* eslint-disable no-console */
// Utility functions for localStorage with error handling

export const localStorageService = {
  get: <T>(key: string, defaultValue: T): T => {
    if (typeof window === 'undefined') return defaultValue;

    try {
      const item = window.localStorage.getItem(key);

      if (item === null) return defaultValue;

      return JSON.parse(item) as T;
    } catch (error) {
      console.error(`Error reading from localStorage key "${key}":`, error);

      return defaultValue;
    }
  },

  set: <T>(key: string, value: T): boolean => {
    if (typeof window === 'undefined') return false;

    try {
      window.localStorage.setItem(key, JSON.stringify(value));

      return true;
    } catch (error) {
      console.error(`Error writing to localStorage key "${key}":`, error);
      // Handle quota exceeded error
      if (
        error instanceof DOMException &&
        error.name === 'QuotaExceededError'
      ) {
        console.warn('localStorage quota exceeded. Clearing old data...');
        // Optionally clear old form data
        try {
          window.localStorage.removeItem(key);
          window.localStorage.setItem(key, JSON.stringify(value));

          return true;
        } catch (retryError) {
          console.error('Failed to save after clearing:', retryError);
        }
      }

      return false;
    }
  },

  remove: (key: string): void => {
    if (typeof window === 'undefined') return;

    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  },

  clear: (): void => {
    if (typeof window === 'undefined') return;

    try {
      window.localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  },
};
