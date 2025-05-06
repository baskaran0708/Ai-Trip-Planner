/**
 * Utility functions to help with Firebase Authentication
 */

/**
 * Checks if the current browser context is likely to have third-party cookie issues
 * @returns {boolean} - True if third-party cookies might be a problem
 */
export const checkCookieRestrictions = () => {
  // Check for Safari browser (known for third-party cookie issues)
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  
  // Check for chrome's third-party cookie restrictions
  const isChrome = /chrome/i.test(navigator.userAgent) && !/edge|edg/i.test(navigator.userAgent);
  
  // Check if user is in incognito mode (approximate detection)
  const checkIncognito = () => {
    try {
      localStorage.setItem('test', 'test');
      localStorage.removeItem('test');
      return false;
    } catch (e) {
      return true;
    }
  };
  
  const maybeIncognito = checkIncognito();
  
  return isSafari || (isChrome && maybeIncognito);
};

/**
 * Detects if the page was just loaded after a redirect from authentication
 * @returns {boolean} - True if the page was just loaded after a redirect
 */
export const isRedirectResult = () => {
  // Check URL for auth-related parameters
  const url = new URL(window.location.href);
  return url.hash.includes('_token=') || 
         url.hash.includes('id_token=') || 
         url.searchParams.has('code') ||
         sessionStorage.getItem('returnFromRedirect') === 'true';
};

/**
 * Clears any auth-related URL parameters
 */
export const cleanupAuthRedirect = () => {
  // Remove URL parameters by replacing state
  if (window.history && window.history.replaceState) {
    window.history.replaceState({}, document.title, window.location.pathname);
  }
  
  // Clear session flag
  sessionStorage.removeItem('returnFromRedirect');
};

/**
 * Set a flag indicating a redirect is about to happen
 */
export const setRedirectFlag = () => {
  sessionStorage.setItem('returnFromRedirect', 'true');
};

/**
 * Get the current redirect status
 * @returns {boolean} - True if we're returning from a redirect
 */
export const getRedirectStatus = () => {
  return sessionStorage.getItem('returnFromRedirect') === 'true';
};

/**
 * Clear the redirect flag
 */
export const clearRedirectFlag = () => {
  sessionStorage.removeItem('returnFromRedirect');
}; 