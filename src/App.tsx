import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import DashboardLayout from './components/layout/DashboardLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ScreensList from './pages/screens/ScreensList';
import NewScreen from './pages/screens/NewScreen';
import ScreenDetail from './pages/screens/ScreenDetail';
import PlaylistsList from './pages/playlists/PlaylistsList';
import NewPlaylist from './pages/playlists/NewPlaylist';
import PlaylistDetail from './pages/playlists/PlaylistDetail';
import PlaylistEdit from './pages/playlists/PlaylistEdit';
import Preview from './pages/Preview';
import Settings from './pages/Settings';

// Protected route component
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { user, loading } = useAuth();
  
  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/preview/:id" element={<Preview />} />
      
      {/* Protected routes */}
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        
        {/* Screen routes */}
        <Route path="screens" element={<ScreensList />} />
        <Route path="screens/new" element={<NewScreen />} />
        <Route path="screens/:id" element={<ScreenDetail />} />
        
        {/* Playlist routes */}
        <Route path="playlists" element={<PlaylistsList />} />
        <Route path="playlists/new" element={<NewPlaylist />} />
        <Route path="playlists/:id" element={<PlaylistDetail />} />
        <Route path="playlists/:id/edit" element={<PlaylistEdit />} />
        
        {/* Settings */}
        <Route path="settings" element={<Settings />} />
      </Route>
      
      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App = () => {
  useEffect(() => {
    // Set the title from the data-default attribute in index.html or use a fallback
    const titleElement = document.querySelector('title[data-default]');
    if (titleElement) {
      document.title = 'DigiSignCMS - Digital Signage Content Management System';
    }
  }, []);

  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
};

export default App;