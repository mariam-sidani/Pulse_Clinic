/**
 * Utility functions for working with localStorage
 */

/**
 * Store an item in localStorage with the given key
 * @param {string} key - The key to store the item under
 * @param {any} value - The value to store (will be JSON stringified)
 */
export const setItemInStorage = (key, value) => {
  try {
    if (typeof window !== 'undefined') {
      const serializedValue = JSON.stringify(value);
      localStorage.setItem(key, serializedValue);
      return true;
    }
  } catch (error) {
    console.error(`Error storing ${key} in localStorage:`, error);
  }
  return false;
};

/**
 * Retrieve an item from localStorage by key
 * @param {string} key - The key to retrieve
 * @returns {any|null} - The parsed value or null if not found
 */
export const getItemFromStorage = (key) => {
  try {
    if (typeof window !== 'undefined') {
      const item = localStorage.getItem(key);
      if (item === null) return null;
      return JSON.parse(item);
    }
  } catch (error) {
    console.error(`Error retrieving ${key} from localStorage:`, error);
  }
  return null;
};

/**
 * Remove an item from localStorage by key
 * @param {string} key - The key to remove
 */
export const removeItemFromStorage = (key) => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(key);
      return true;
    }
  } catch (error) {
    console.error(`Error removing ${key} from localStorage:`, error);
  }
  return false;
};

/**
 * Clear all items from localStorage
 */
export const clearStorage = () => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.clear();
      return true;
    }
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
  return false;
}; 