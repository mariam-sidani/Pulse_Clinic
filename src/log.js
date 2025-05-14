/**
 * Simple logging utility for the application
 */

/**
 * Log information with a source tag
 * 
 * @param {string} source - The source of the log (component or module name)
 * @param {string} message - The message to log
 */
export function logInfo(source, message) {
  console.log(`[${source}] ${message}`);
}

/**
 * Log errors with a source tag
 * 
 * @param {string} source - The source of the error (component or module name)
 * @param {string} message - The error message
 * @param {Error} [error] - Optional error object
 */
export function logError(source, message, error) {
  console.error(`[${source}] ${message}`, error || '');
}

export default {
  logInfo,
  logError
}; 