import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Link, useNavigate } from 'react-router-dom';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
} from "@/components/ui/dialog"
import { FcGoogle } from "react-icons/fc";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from '@/lib/AuthContext';
import { toast } from 'sonner';

function Header() {
  const [openDialog, setOpenDialog] = useState(false);
  const [error, setError] = useState(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const { currentUser, isAdmin, signInWithGoogle, signOut, loading } = useAuth();
  const navigate = useNavigate();

  // Don't render anything until Firebase Auth has loaded
  if (loading) {
    return (
      <div className="p-3 shadow-sm flex justify-between items-center px-4">
        <Link to="/">
          <img src="./trip-logo-image.png" alt="Logo" className="max-h-12" />
        </Link>
        <div className="flex items-center">
          <div className="h-10 w-24 animate-pulse bg-gray-200 rounded-md"></div>
        </div>
      </div>
    );
  }

  // Process profile image URL to ensure it works correctly
  const processProfileImageUrl = (url) => {
    if (!url) return '';
    if (url.includes('googleusercontent.com')) {
      return url.split('=')[0] + '=s400-c';
    }
    return url;
  };

  // Function to get user's initials for the avatar fallback
  const getUserInitials = () => {
    if (!currentUser) return 'U';
    const name = currentUser.displayName || '';
    return name.split(' ').map(part => part[0]).join('').toUpperCase() || 'U';
  };

  const handleLogout = () => {
    signOut().then(() => {
      toast.success('You have been signed out');
      // Redirect to home page
      navigate('/');
    }).catch(err => {
      console.error("Auth context sign out error:", err);
      setError("Failed to log out. Please try again.");
      toast.error('Failed to sign out. Please try again.');
    });
  };

  const handleSignIn = async () => {
    setError(null);
    setIsAuthenticating(true);
    
    try {
      await signInWithGoogle();
      setOpenDialog(false);
      toast.success(`Welcome, ${currentUser?.displayName || 'User'}!`);
    } catch (err) {
      console.error("Sign in error:", err);
      
      let errorMessage = "Failed to sign in. Please try again.";
      
      // Handle specific Firebase errors
      if (err.code === 'auth/popup-blocked') {
        errorMessage = "Popup was blocked. Please allow popups for this website.";
      } else if (err.code === 'auth/cancelled-popup-request') {
        errorMessage = "Sign-in was cancelled.";
      } else if (err.code === 'auth/configuration-not-found') {
        errorMessage = "Authentication configuration issue. Please contact support.";
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <div className='p-3 shadow-sm flex justify-between items-center px-4'>
      <Link to="/">
        <img src="./trip-logo-image.png" alt="Logo" className="max-h-12" />
      </Link>
      <div >
       {currentUser ? 
       <div className='flex items-center gap-4'>
        <Link to="/create-trip">
          <Button variant="outline" className="rounded-full">Create Trip</Button> 
        </Link>
        <Link to="/my-trips">
          <Button variant="outline" className="rounded-full">My Trips</Button> 
        </Link>
         <Popover>
          <PopoverTrigger>
            <div className="flex items-center gap-2 rounded-full px-2 py-1 hover:bg-gray-100 cursor-pointer transition-colors">
              <Avatar className="h-9 w-9 border-2 border-primary">
                {currentUser.photoURL ? (
                  <AvatarImage src={processProfileImageUrl(currentUser.photoURL)} alt="User profile" />
                ) : null}
                <AvatarFallback>{getUserInitials()}</AvatarFallback>
              </Avatar>
              <span className="font-medium text-sm hidden md:inline">{currentUser.displayName?.split(' ')[0] || 'User'}</span>
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-64">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 pb-3 border-b">
                <Avatar className="h-12 w-12">
                  {currentUser.photoURL ? (
                    <AvatarImage src={processProfileImageUrl(currentUser.photoURL)} alt="User profile" />
                  ) : null}
                  <AvatarFallback>{getUserInitials()}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{currentUser.displayName || 'User'}</p>
                  <p className="text-xs text-gray-500">{currentUser.email || ''}</p>
                </div>
              </div>
              <div className="flex flex-col gap-2 pt-1">
                <Link to="/my-trips" className="py-2 text-sm hover:text-primary transition-colors">
                  My Trips
                </Link>
                {isAdmin && (
                  <Link 
                    to="/admin" 
                    className="py-2 text-sm hover:text-primary transition-colors"
                  >
                    Admin Panel
                  </Link>
                )}
                <button 
                  className="text-left cursor-pointer hover:text-red-500 py-2 text-sm" 
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            </div>
          </PopoverContent>
         </Popover>
       </div>
       : <Button onClick={()=>setOpenDialog(true)}>Sign In</Button> 
       }
      </div>
      <Dialog open={openDialog} onOpenChange={(open) => {
        setOpenDialog(open);
        if (!open) {
          setError(null);
          setIsAuthenticating(false);
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogDescription>
              <img src="./trip-logo-image.png" alt="Logo" />
              <h2 className="font-bold text-lg mt-6">Sign In with Google</h2>
              <p>Sign In to the App with Google authentication securely</p>
              
              {error && <p className="text-red-600 mt-2">{error}</p>}
              
              <div className="mt-2 text-sm text-gray-500">
                <p>A popup will appear for you to select your Google account.</p>
              </div>
              
              <Button 
                onClick={handleSignIn} 
                className="w-full mt-5 flex gap-4 items-center"
                disabled={isAuthenticating}
              >
                <FcGoogle className="h-7 w-7"/>
                {isAuthenticating ? 'Signing in...' : 'Sign In With Google'}
              </Button>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Header
