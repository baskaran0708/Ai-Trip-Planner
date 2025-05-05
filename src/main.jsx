import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { createHashRouter, RouterProvider, Outlet } from 'react-router-dom'
import CreateTrip from './create-trip/index.jsx'
import Header from './components/custom/Header.jsx'
import Footer from './components/custom/Footer.jsx'
import { Toaster } from './components/ui/sonner.jsx'
import { GoogleOAuthProvider } from '@react-oauth/google'
import ViewTrip from './view-trip/[tripId]/index.jsx'
import MyTrips from './my-trips/index.jsx'
import ErrorBoundary from './components/custom/ErrorBoundary.jsx'
import { AuthProvider } from './lib/AuthContext.jsx'
import AdminLayout from './components/custom/AdminLayout.jsx'
import AdminDashboard from './components/admin/Dashboard.jsx'
import UserManagement from './components/admin/UserManagement.jsx'
import TripManagement from './components/admin/TripManagement.jsx'
import DownloadAnalytics from './components/admin/DownloadAnalytics.jsx'

// Debug information
console.log('React version:', React.version);
console.log('ReactDOM version:', ReactDOM.version);

// Default client ID (for development purposes only)
// You should create a .env file with your actual Google client ID
const googleClientId = import.meta.env.VITE_GOOGLE_AUTH_CLIENT_ID || '123456789012-abcdefghijklmnopqrstuvwxyz123456.apps.googleusercontent.com';

// Layout component for inner pages that need header/footer
const AppLayout = () => (
  <div className="flex flex-col min-h-screen">
    <Header />
    <main className="flex-grow">
      <Outlet />
    </main>
    <Footer />
  </div>
);

// Use explicit basename for GitHub Pages
const router = createHashRouter(
  [
    {
      path: '/',
      element: <App />,
      errorElement: <ErrorBoundary><div>Something went wrong</div></ErrorBoundary>
    },
    {
      element: <AppLayout />,
      errorElement: <ErrorBoundary><div>Something went wrong</div></ErrorBoundary>,
      children: [
        {
          path: '/create-trip',
          element: <CreateTrip />
        },
        {
          path: '/view-trip/:tripId',
          element: <ViewTrip />
        },
        {
          path: '/my-trips',
          element: <MyTrips />
        }
      ]
    },
    // Admin routes
    {
      path: '/admin',
      element: <AdminLayout />,
      errorElement: <ErrorBoundary><div>Admin access error</div></ErrorBoundary>,
      children: [
        {
          index: true,
          element: <AdminDashboard />
        },
        {
          path: 'users',
          element: <UserManagement />
        },
        {
          path: 'trips',
          element: <TripManagement />
        },
        {
          path: 'analytics',
          element: <DownloadAnalytics />
        }
      ]
    }
  ]
);

// Global error handler for initialization errors
window.addEventListener('error', (event) => {
  console.error('Global error caught:', event.error);
});

// Make sure the root element exists before mounting React
const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('Root element not found!');
  // Create a root element if it doesn't exist
  const newRoot = document.createElement('div');
  newRoot.id = 'root';
  document.body.appendChild(newRoot);
  console.log('Created new root element');
}

try {
  const root = ReactDOM.createRoot(rootElement || document.getElementById('root'));
  
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <GoogleOAuthProvider clientId={googleClientId}>
          <AuthProvider>
            <Toaster />
            <RouterProvider router={router} />
          </AuthProvider>
        </GoogleOAuthProvider>
      </ErrorBoundary>
    </React.StrictMode>
  );
  
  console.log('React app mounted successfully');
} catch (error) {
  console.error('Failed to mount React app:', error);
  document.body.innerHTML = `
    <div style="font-family: sans-serif; padding: 20px; max-width: 800px; margin: 0 auto;">
      <h1 style="color: #d00;">App Initialization Error</h1>
      <p>There was an error initializing the application:</p>
      <pre style="background: #f1f1f1; padding: 10px; border-radius: 4px; overflow: auto;">${error.message}</pre>
      <p>Please try refreshing the page, or contact support if the issue persists.</p>
    </div>
  `;
}
