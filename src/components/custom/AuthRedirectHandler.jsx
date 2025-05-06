import { useEffect, useState } from 'react';
import { getAuth, getRedirectResult } from 'firebase/auth';
import { app } from '@/service/firebaseConfig';
import { useAuth } from '@/lib/AuthContext';
import { getRedirectStatus, clearRedirectFlag, isRedirectResult, cleanupAuthRedirect } from '@/lib/authUtils';

/**
 * This component handles Firebase auth redirects as a redundancy mechanism
 * It works alongside AuthContext to ensure redirects are properly processed,
 * especially in environments where third-party cookies might be blocked.
 */
function AuthRedirectHandler() {
  const [error, setError] = useState(null);
  const auth = getAuth(app);
  const { currentUser } = useAuth();

  useEffect(() => {
    // Clean up URL parameters that might be left by the auth redirect
    cleanupAuthRedirect();
    
    // Only try to process redirect if no user is detected yet and we have indication of a redirect
    if (currentUser) {
      console.log('[AuthRedirectHandler] User already authenticated:', currentUser.email);
      return;
    }

    // Check if we need to process a redirect result
    const shouldProcessRedirect = getRedirectStatus() || isRedirectResult();
    
    if (!shouldProcessRedirect) {
      console.log('[AuthRedirectHandler] No indication of redirect, skipping processing');
      return;
    }

    const processRedirect = async () => {
      try {
        console.log('[AuthRedirectHandler] Processing redirect result as backup handler...');
        
        // Adding a small delay to ensure this doesn't conflict with AuthContext
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const result = await getRedirectResult(auth);
        
        if (result && result.user) {
          console.log('[AuthRedirectHandler] Successfully processed redirect result:', result.user.email);
          // We don't need to set the user since AuthContext will handle this through onAuthStateChanged
          // This is just a backup to ensure the redirect gets processed
          
          // Clear the redirect flag since we've handled it
          clearRedirectFlag();
          
          // If we get here and AuthContext hasn't updated yet, force a reload
          if (!currentUser) {
            console.log('[AuthRedirectHandler] Auth state not updated yet, forcing reload');
            window.location.reload();
          }
        } else {
          console.log('[AuthRedirectHandler] No redirect result to process in backup handler');
          clearRedirectFlag();
        }
      } catch (err) {
        console.error('[AuthRedirectHandler] Error processing redirect in backup handler:', err);
        setError(err);
        clearRedirectFlag();
        
        // If we get a specific error about third-party cookies, add a useful message
        if (err.message && (err.message.includes('cookie') || err.message.includes('third-party'))) {
          console.error('[AuthRedirectHandler] This may be due to third-party cookie restrictions in your browser.');
        }
      }
    };

    processRedirect();
  }, [auth, currentUser]);

  // This component doesn't render anything visible
  return null;
}

export default AuthRedirectHandler; 