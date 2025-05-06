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
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FcGoogle } from "react-icons/fc";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from '@/lib/AuthContext';
import { toast } from 'sonner';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

function Header() {
  const [openDialog, setOpenDialog] = useState(false);
  const [error, setError] = useState(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [activeTab, setActiveTab] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showResetPassword, setShowResetPassword] = useState(false);
  
  const { 
    currentUser, 
    isAdmin, 
    signInWithGoogle, 
    signInWithEmail, 
    signUpWithEmail, 
    resetPassword,
    signOut, 
    loading 
  } = useAuth();
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

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsAuthenticating(true);
    
    try {
      await signInWithGoogle();
      setOpenDialog(false);
      toast.success(`Welcome, ${currentUser?.displayName || 'User'}!`);
    } catch (err) {
      console.error("Google sign in error:", err);
      
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

  const handleEmailSignIn = async (e) => {
    e.preventDefault();
    setError(null);
    setIsAuthenticating(true);
    
    if (!email || !password) {
      setError("Email and password are required");
      setIsAuthenticating(false);
      return;
    }
    
    try {
      await signInWithEmail(email, password);
      setOpenDialog(false);
      toast.success(`Welcome back!`);
    } catch (err) {
      console.error("Email sign in error:", err);
      
      let errorMessage = "Failed to sign in. Please check your email and password.";
      
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        errorMessage = "Invalid email or password.";
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage = "Too many failed login attempts. Please try again later.";
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleEmailSignUp = async (e) => {
    e.preventDefault();
    setError(null);
    setIsAuthenticating(true);
    
    if (!email || !password) {
      setError("Email and password are required");
      setIsAuthenticating(false);
      return;
    }
    
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setIsAuthenticating(false);
      return;
    }
    
    try {
      await signUpWithEmail(email, password, displayName);
      setOpenDialog(false);
      toast.success(`Account created successfully!`);
    } catch (err) {
      console.error("Email sign up error:", err);
      
      let errorMessage = "Failed to create account.";
      
      if (err.code === 'auth/email-already-in-use') {
        errorMessage = "This email is already registered. Try signing in instead.";
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = "Invalid email address.";
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setError(null);
    setIsAuthenticating(true);
    
    if (!email) {
      setError("Email is required");
      setIsAuthenticating(false);
      return;
    }
    
    try {
      await resetPassword(email);
      toast.success(`Password reset email sent to ${email}`);
      setShowResetPassword(false);
    } catch (err) {
      console.error("Password reset error:", err);
      
      let errorMessage = "Failed to send password reset email.";
      
      if (err.code === 'auth/user-not-found') {
        errorMessage = "No account found with this email.";
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = "Invalid email address.";
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setDisplayName("");
    setError(null);
    setShowResetPassword(false);
    setIsAuthenticating(false);
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
          resetForm();
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">
              <img src="./trip-logo-image.png" alt="Logo" className="h-10 mx-auto mb-4" />
              <h2 className="text-xl">Welcome to AI Trip Planner</h2>
            </DialogTitle>
            <DialogDescription className="text-center pt-2">
              Sign in to plan your dream trips
            </DialogDescription>
          </DialogHeader>
          
          {showResetPassword ? (
            <div className="py-2">
              <h3 className="font-medium mb-4">Reset Password</h3>
              <form onSubmit={handlePasswordReset} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-email">Email</Label>
                  <Input 
                    id="reset-email" 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                  />
                </div>
                
                {error && <p className="text-red-600 text-sm">{error}</p>}
                
                <div className="flex gap-2 pt-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowResetPassword(false)}
                    disabled={isAuthenticating}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button 
                    type="submit"
                    disabled={isAuthenticating}
                    className="flex-1"
                  >
                    {isAuthenticating ? 'Sending...' : 'Send Reset Link'}
                  </Button>
                </div>
              </form>
            </div>
          ) : (
            <Tabs defaultValue="signin" value={activeTab} onValueChange={setActiveTab} className="pt-2">
              <TabsList className="grid grid-cols-2 mb-4">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Create Account</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin" className="space-y-4">
                <Button 
                  onClick={handleGoogleSignIn} 
                  className="w-full gap-4 items-center"
                  variant="outline"
                  disabled={isAuthenticating}
                >
                  <FcGoogle className="h-5 w-5"/>
                  {isAuthenticating ? 'Signing in...' : 'Sign In With Google'}
                </Button>
                
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">or</span>
                  </div>
                </div>
                
                <form onSubmit={handleEmailSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input 
                      id="signin-email" 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="signin-password">Password</Label>
                      <button 
                        type="button"
                        onClick={() => setShowResetPassword(true)} 
                        className="text-xs text-primary hover:underline"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <Input 
                      id="signin-password" 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                    />
                  </div>
                  
                  {error && <p className="text-red-600 text-sm">{error}</p>}
                  
                  <Button 
                    type="submit"
                    disabled={isAuthenticating}
                    className="w-full"
                  >
                    {isAuthenticating ? 'Signing in...' : 'Sign In'}
                  </Button>
                </form>
                
                <p className="text-center text-sm text-gray-500">
                  Don't have an account?{' '}
                  <button 
                    type="button"
                    onClick={() => setActiveTab("signup")} 
                    className="text-primary hover:underline"
                  >
                    Create one
                  </button>
                </p>
              </TabsContent>
              
              <TabsContent value="signup" className="space-y-4">
                <Button 
                  onClick={handleGoogleSignIn} 
                  className="w-full gap-4 items-center"
                  variant="outline"
                  disabled={isAuthenticating}
                >
                  <FcGoogle className="h-5 w-5"/>
                  {isAuthenticating ? 'Signing up...' : 'Sign Up With Google'}
                </Button>
                
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">or</span>
                  </div>
                </div>
                
                <form onSubmit={handleEmailSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Name (Optional)</Label>
                    <Input 
                      id="signup-name" 
                      type="text" 
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Enter your name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input 
                      id="signup-email" 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input 
                      id="signup-password" 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create a password"
                    />
                  </div>
                  
                  {error && <p className="text-red-600 text-sm">{error}</p>}
                  
                  <Button 
                    type="submit"
                    disabled={isAuthenticating}
                    className="w-full"
                  >
                    {isAuthenticating ? 'Creating Account...' : 'Create Account'}
                  </Button>
                </form>
                
                <p className="text-center text-sm text-gray-500">
                  Already have an account?{' '}
                  <button 
                    type="button"
                    onClick={() => setActiveTab("signin")} 
                    className="text-primary hover:underline"
                  >
                    Sign in
                  </button>
                </p>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Header
