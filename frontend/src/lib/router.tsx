// Router Configuration with Lazy Loading

import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { lazy, Suspense, type ReactNode } from 'react';
import { useAuthStore } from '../stores';
import { Layout } from '../components/Layout';
import { PageLoader } from '../components/common';

// Lazy load all pages
const Home = lazy(() => import('../pages/Home'));
const Properties = lazy(() => import('../pages/Properties'));
const PropertyDetail = lazy(() => import('../pages/PropertyDetail'));
const MapView = lazy(() => import('../pages/MapView'));
const Favorites = lazy(() => import('../pages/Favorites'));
const Messages = lazy(() => import('../pages/Messages'));
const Bookings = lazy(() => import('../pages/Bookings'));
const Login = lazy(() => import('../pages/Login'));
const Dashboard = lazy(() => import('../pages/Dashboard'));
const Profile = lazy(() => import('../pages/Profile'));
const Subscriptions = lazy(() => import('../pages/Subscriptions'));
const NotFound = lazy(() => import('../pages/NotFound'));

// Wrapper component for lazy loading
function LazyWrapper({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<PageLoader />}>
      {children}
    </Suspense>
  );
}

// Protected route wrapper
function ProtectedRoute({ children }: { children: ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <LazyWrapper>{children}</LazyWrapper>;
}

// Public route (redirect if already logged in)
function PublicRoute({ children }: { children: ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <LazyWrapper>{children}</LazyWrapper>;
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout><Outlet /></Layout>,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'properties',
        element: <Properties />,
      },
      {
        path: 'properties/:id',
        element: <PropertyDetail />,
      },
      {
        path: 'map',
        element: <MapView />,
      },
      {
        path: 'favorites',
        element: (
          <ProtectedRoute>
            <Favorites />
          </ProtectedRoute>
        ),
      },
      {
        path: 'messages',
        element: (
          <ProtectedRoute>
            <Messages />
          </ProtectedRoute>
        ),
      },
      {
        path: 'bookings',
        element: (
          <ProtectedRoute>
            <Bookings />
          </ProtectedRoute>
        ),
      },
      {
        path: 'login',
        element: (
          <PublicRoute>
            <Login />
          </PublicRoute>
        ),
      },
      {
        path: 'dashboard',
        element: (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: 'profile',
        element: (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        ),
      },
      {
        path: 'subscriptions',
        element: <Subscriptions />,
      },
      {
        path: '*',
        element: <NotFound />,
      },
    ],
  },
]);

export default router;
