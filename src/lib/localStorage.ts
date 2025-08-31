/**
 * Safe localStorage wrapper that works during SSR/SSG
 * Always returns null/undefined during server-side rendering
 */

export const safeLocalStorage = {
  getItem(key: string): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(key);
    }
    return null;
  },

  setItem(key: string, value: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, value);
    }
  },

  removeItem(key: string): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(key);
    }
  },

  clear(): void {
    if (typeof window !== 'undefined') {
      localStorage.clear();
    }
  },

  /**
   * Get and parse JSON from localStorage
   */
  getJSON<T>(key: string, defaultValue: T): T {
    if (typeof window !== 'undefined') {
      const item = localStorage.getItem(key);
      if (item) {
        try {
          return JSON.parse(item);
        } catch {
          return defaultValue;
        }
      }
    }
    return defaultValue;
  },

  /**
   * Set JSON in localStorage
   */
  setJSON(key: string, value: any): void {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        console.error('Failed to save to localStorage:', error);
      }
    }
  }
};

// Export as default for easier migration
export default safeLocalStorage;