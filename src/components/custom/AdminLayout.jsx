import React, { useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useNavigate, Link, Outlet } from 'react-router-dom';
import { LayoutDashboard, Users, Map, Settings, BarChart, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AdminLayout = () => {
  const { currentUser, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();

  // Protect admin routes
  useEffect(() => {
    if (!loading) {
      if (!currentUser) {
        navigate('/login', { replace: true });
      } else if (!isAdmin) {
        navigate('/', { replace: true });
      }
    }
  }, [currentUser, isAdmin, loading, navigate]);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!currentUser || !isAdmin) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md">
        <div className="p-4">
          <h2 className="text-2xl font-bold text-primary mb-6">Admin Panel</h2>
          
          <nav className="space-y-1">
            <NavItem to="/admin" icon={<LayoutDashboard size={20} />} exact>
              Dashboard
            </NavItem>
            <NavItem to="/admin/users" icon={<Users size={20} />}>
              User Management
            </NavItem>
            <NavItem to="/admin/trips" icon={<Map size={20} />}>
              Trip Management
            </NavItem>
            <NavItem to="/admin/analytics" icon={<BarChart size={20} />}>
              Analytics
            </NavItem>
            <NavItem to="/admin/settings" icon={<Settings size={20} />}>
              Settings
            </NavItem>
          </nav>
        </div>
        
        <div className="mt-auto p-4 border-t">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-red-500 hover:text-red-700 hover:bg-red-50"
            onClick={handleSignOut}
          >
            <LogOut size={20} className="mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
};

// Navigation item component
const NavItem = ({ to, icon, children, exact }) => {
  const isActive = window.location.pathname === to || 
                  (!exact && window.location.pathname.startsWith(to));
  
  return (
    <Link
      to={to}
      className={`flex items-center px-4 py-3 text-sm rounded-lg transition-colors ${
        isActive
          ? 'bg-primary text-white'
          : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      <span className="mr-3">{icon}</span>
      {children}
    </Link>
  );
};

export default AdminLayout; 