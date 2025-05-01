import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom'
import CreateTrip from './create-trip/index.jsx'
import Header from './components/custom/Header.jsx'
import Footer from './components/custom/Footer.jsx'
import { Toaster } from './components/ui/sonner.jsx'
import { GoogleOAuthProvider } from '@react-oauth/google'
import ViewTrip from './view-trip/[tripId]/index.jsx'
import MyTrips from './my-trips/index.jsx'
import ErrorBoundary from './components/custom/ErrorBoundary.jsx'

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

const router = createBrowserRouter([
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
  }
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <GoogleOAuthProvider clientId={googleClientId}>
        <Toaster />
        <RouterProvider router={router} />
      </GoogleOAuthProvider>
    </ErrorBoundary>
  </React.StrictMode>,
)
