import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  getAuth, 
  onAuthStateChanged, 
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  signInWithPopup,
  setPersistence,
  browserLocalPersistence,
} from 'firebase/auth';
import { app, db } from '@/service/firebaseConfig';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

// Create the authentication context
const AuthContext = createContext();

// Hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

// Authentication provider component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(undefined); // Start undefined
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const auth = getAuth(app);

  // Set up persistence and auth state listener
  useEffect(() => {
    console.log("[AuthContext] Setting up auth persistence and listener...");
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        // Set persistence to LOCAL (this helps maintain the session across page reloads)
        await setPersistence(auth, browserLocalPersistence);
        console.log("[AuthContext] Successfully set persistence to LOCAL");
      } catch (error) {
        console.error("[AuthContext] Error during auth persistence setup:", error);
      }
    };

    // Initialize authentication first, then set up listener
    initializeAuth().then(() => {
      // Set up the auth state listener
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        console.log("[AuthContext] onAuthStateChanged: Received user:", user?.email || user);
        
        if (!isMounted) return;
        
        if (user) {
          console.log("[AuthContext] User is signed in:", user.email);
          await createOrUpdateUserInFirestore(user);
          await checkAdminStatus(user);
        } else {
          console.log("[AuthContext] No user signed in");
          setIsAdmin(false);
        }
        
        setCurrentUser(user);
        setLoading(false);
      });

      return () => {
        isMounted = false;
        unsubscribe();
      };
    });
  }, []);

  // Sign in with Google using POPUP instead of redirect
  const signInWithGoogle = async () => {
    try {
      console.log("[AuthContext] Attempting Google Sign In with popup...");
      const provider = new GoogleAuthProvider();
      
      // Add basic scopes
      provider.addScope('profile');
      provider.addScope('email');
      
      // Important: Use select_account to always show account chooser
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      
      // Use signInWithPopup instead of signInWithRedirect
      const result = await signInWithPopup(auth, provider);
      console.log("[AuthContext] Popup sign in successful:", result.user.email);
      
      // No need to return anything as onAuthStateChanged will handle the user update
      return true;
    } catch (error) {
      console.error("[AuthContext] Google sign in error:", error);
      throw error;
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      console.log("[AuthContext] Sign out successful.");
    } catch (error) {
      console.error("[AuthContext] Sign out error:", error);
      throw error;
    }
  };

  // Create or update user in Firestore
  const createOrUpdateUserInFirestore = async (user) => {
    if (!user) return;
    console.log(`[AuthContext] Running createOrUpdateUserInFirestore for user: ${user.uid}`);
    try {
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        console.log("[AuthContext] Creating new user document...");
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          isAdmin: false,
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp()
        });
        console.log("[AuthContext] New user document CREATED successfully.");
      } else {
        // Update last login timestamp
        console.log("[AuthContext] Updating user last login time");
        await setDoc(userRef, {
          lastLogin: serverTimestamp()
        }, { merge: true });
      }
    } catch (error) {
      console.error("[AuthContext] Error in createOrUpdateUserInFirestore:", error);
    }
  };

  // Check if user is admin
  const checkAdminStatus = async (user) => {
    if (!user) {
      setIsAdmin(false);
      return;
    }
    console.log(`[AuthContext] Running checkAdminStatus for user: ${user.uid}`);
    try {
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      let adminStatus = false;
      if (userSnap.exists()) {
        const userData = userSnap.data();
        adminStatus = userData.isAdmin || false;
      }
      console.log(`[AuthContext] Admin status for ${user.email}: ${adminStatus}`);
      setIsAdmin(adminStatus);
    } catch (error) {
      console.error("[AuthContext] Error in checkAdminStatus:", error);
      setIsAdmin(false); // Default to false on error
    }
  };

  // Context value
  const value = {
    currentUser,
    isAdmin,
    loading,
    signInWithGoogle,
    signOut
  };

  // Render children only when loading is definitively false
  // currentUser can be null (logged out) or a user object (logged in)
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}; 