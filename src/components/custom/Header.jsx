import React, { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { Link } from 'react-router-dom';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { googleLogout, useGoogleLogin } from '@react-oauth/google';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
} from "@/components/ui/dialog"
import { FcGoogle } from "react-icons/fc";
import axios from 'axios';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from '@/lib/AuthContext';

function Header() {
  const [user, setUser] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [error, setError] = useState(null);
  const [profileImage, setProfileImage] = useState('');
  const { currentUser, isAdmin, signInWithGoogle, signOut } = useAuth();

  // Process profile image URL to ensure it works correctly
  const processProfileImageUrl = (url) => {
    if (!url) return '';
    
    // If it's a Google profile picture, ensure it doesn't have size restrictions
    if (url.includes('googleusercontent.com')) {
      // Remove any size parameters and return the full-size image
      return url.split('=')[0] + '=s400-c';
    }
    
    return url;
  };

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        console.log("User data from localStorage:", parsedUser);
        setUser(parsedUser);
        
        // Handle different possible profile picture field names
        const imageUrl = parsedUser.picture || 
                         parsedUser.image || 
                         parsedUser.profile_image || 
                         parsedUser.avatar ||
                         parsedUser.photo;
        
        console.log("Profile image URL:", imageUrl);
        setProfileImage(processProfileImageUrl(imageUrl));
      }
    } catch (error) {
      console.error("Error parsing user from localStorage:", error);
      localStorage.removeItem('user'); // Clear invalid data
    }
  }, []);

  const login = useGoogleLogin({
    onSuccess: (codeResp) => GetUserProfile(codeResp),
    onError: (error) => {
      console.error("Google login error:", error);
      setError("Failed to login with Google. Please try again.");
    }
  });
  
  const GetUserProfile = (tokenInfo) => {
    try {
      console.log("Token info:", tokenInfo);
      axios.get(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${tokenInfo?.access_token}`, {
        headers: {
          Authorization: `Bearer ${tokenInfo?.access_token}`,
          Accept: 'application/json'
        }
      }).then((resp) => {
        console.log("Google user data:", resp.data);
        const userData = resp.data;
        
        // Ensure the 'picture' field is properly set
        if (!userData.picture && userData.image) {
          userData.picture = userData.image;
        }
        
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        setProfileImage(processProfileImageUrl(userData.picture || ''));
        setOpenDialog(false);
        
        // Also trigger sign in with our auth context
        if (signInWithGoogle) {
          signInWithGoogle().catch(err => console.error("Auth context sign in error:", err));
        }
      }).catch(err => {
        console.error("Error fetching user profile:", err);
        setError("Failed to get user profile. Please try again.");
      });
    } catch (error) {
      console.error("Exception in GetUserProfile:", error);
      setError("An unexpected error occurred. Please try again.");
    }
  }

  // Function to get user's initials for the avatar fallback
  const getUserInitials = () => {
    if (!user) return 'U';
    const name = user.name || '';
    return name.split(' ').map(part => part[0]).join('').toUpperCase();
  };

  const handleLogout = () => {
    googleLogout();
    localStorage.clear();
    setUser(null);
    setProfileImage('');
    
    // Also sign out with our auth context
    if (signOut) {
      signOut().catch(err => console.error("Auth context sign out error:", err));
    }
  };

  return (
    <div className='p-3 shadow-sm flex justify-between items-center px-4'>
      <Link to="/">
        <img src="./trip-logo-image.png" alt="Logo" className="max-h-12" />
      </Link>
      <div >
       {user ? 
       <div className='flex items-center gap-4'>
        <Link to="/create-trip">
          <Button variant="outline" className="rounded-full">Create Trip</Button> 
        </Link>
        <Link to="/my-trips">
          <Button variant="outline" className="rounded-full">My Trips</Button> 
        </Link>
         <Popover>
          <PopoverTrigger>
            <Avatar className="cursor-pointer">
              {profileImage ? (
                <AvatarImage src={profileImage} alt="User profile" />
              ) : null}
              <AvatarFallback>{getUserInitials()}</AvatarFallback>
            </Avatar>
          </PopoverTrigger>
          <PopoverContent>
            <div className="flex flex-col gap-2">
              <p className="font-medium">{user.name || 'User'}</p>
              <p className="text-sm text-gray-500">{user.email || ''}</p>
              <hr className="my-2" />
              
              {/* Admin panel link - only shown to admin users */}
              {isAdmin && (
                <Link 
                  to="/admin" 
                  className="py-2 text-sm hover:text-primary transition-colors"
                >
                  Admin Panel
                </Link>
              )}
              
              <h2 className="cursor-pointer hover:text-red-500 py-2 text-sm" onClick={handleLogout}>
                Logout
              </h2>
            </div>
          </PopoverContent>
         </Popover>

       </div>
       : <Button onClick={()=>setOpenDialog(true)}>Sign In</Button> 
       }
      </div>
      
      <Dialog open={openDialog} onOpenChange={(open) => {
        setOpenDialog(open);
        if (!open) setError(null); // Clear errors when dialog is closed
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogDescription>
              <img src="./trip-logo-image.png" alt="Logo" />
              <h2 className="font-bold text-lg mt-6">Sign In with Google</h2>
              <p>Sign In to the App with Google authentication securely</p>
              {error && <p className="text-red-600 mt-2">{error}</p>}
              <Button 
              onClick={login} className="w-full mt-5 flex gap-4 items-center">
                <FcGoogle className="h-7 w-7"/>
                Sign In With Google
              </Button>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

    </div>
  )
}

export default Header
