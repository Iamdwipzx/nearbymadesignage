import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Monitor, Film, Plus, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useScreenStore } from '../store/screenStore';
import { usePlaylistStore } from '../store/playlistStore';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { screens, fetchScreens } = useScreenStore();
  const { playlists, fetchPlaylists } = usePlaylistStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchScreens(), fetchPlaylists()]);
      setIsLoading(false);
    };

    loadData();
  }, [fetchScreens, fetchPlaylists]);

  // Get counts
  const screenCount = screens.length;
  const playlistCount = playlists.length;
  const activeScreensCount = screens.filter(
    (screen) => playlists.some((playlist) => playlist.screenId === screen.id)
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Welcome back, {user?.name}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            icon={<Plus size={16} />}
            onClick={() => navigate('/screens/new')}
          >
            Add Screen
          </Button>
          <Button
            variant="primary"
            icon={<Plus size={16} />}
            onClick={() => navigate('/playlists/new')}
            disabled={screenCount === 0}
          >
            New Playlist
          </Button>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-blue-50 border border-blue-100">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="p-3 bg-blue-500 rounded-md">
                <Monitor className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500">Total Screens</p>
              <p className="mt-1 text-3xl font-semibold text-gray-900">
                {isLoading ? '...' : screenCount}
              </p>
            </div>
          </div>
        </Card>

        <Card className="bg-teal-50 border border-teal-100">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="p-3 bg-teal-500 rounded-md">
                <Film className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500">Total Playlists</p>
              <p className="mt-1 text-3xl font-semibold text-gray-900">
                {isLoading ? '...' : playlistCount}
              </p>
            </div>
          </div>
        </Card>

        <Card className="bg-purple-50 border border-purple-100">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="p-3 bg-purple-500 rounded-md">
                <Monitor className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500">Active Screens</p>
              <p className="mt-1 text-3xl font-semibold text-gray-900">
                {isLoading ? '...' : activeScreensCount}
              </p>
            </div>
          </div>
        </Card>

        <Card className="bg-amber-50 border border-amber-100">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="p-3 bg-amber-500 rounded-md">
                <Film className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500">Published Playlists</p>
              <p className="mt-1 text-3xl font-semibold text-gray-900">
                {isLoading ? '...' : playlists.filter(p => p.previewUrl).length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent screens */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900">Recent Screens</h2>
          <Button
            variant="ghost"
            size="sm"
            icon={<ArrowRight size={16} />}
            iconPosition="right"
            onClick={() => navigate('/screens')}
          >
            View all
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading screens...</p>
          </div>
        ) : screenCount === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
            <Monitor className="h-12 w-12 text-gray-400 mx-auto" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No screens</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating a new screen.
            </p>
            <div className="mt-6">
              <Button
                variant="primary"
                icon={<Plus size={16} />}
                onClick={() => navigate('/screens/new')}
              >
                Add Screen
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {screens
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .slice(0, 3)
              .map((screen) => (
                <Card key={screen.id}>
                  <div className="flex justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{screen.name}</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Aspect ratio: {screen.aspectRatio}
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        {new Date(screen.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="w-16 h-9 bg-gray-100 rounded border border-gray-300 flex items-center justify-center text-xs">
                      {screen.aspectRatio}
                    </div>
                  </div>
                  <div className="mt-4">
                    <Button
                      fullWidth
                      onClick={() => navigate(`/screens/${screen.id}`)}
                    >
                      Manage Screen
                    </Button>
                  </div>
                </Card>
              ))}
          </div>
        )}
      </div>

      {/* Recent playlists */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900">Recent Playlists</h2>
          <Button
            variant="ghost"
            size="sm"
            icon={<ArrowRight size={16} />}
            iconPosition="right"
            onClick={() => navigate('/playlists')}
          >
            View all
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading playlists...</p>
          </div>
        ) : playlistCount === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
            <Film className="h-12 w-12 text-gray-400 mx-auto" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No playlists</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating a new playlist.
            </p>
            <div className="mt-6">
              <Button
                variant="primary"
                icon={<Plus size={16} />}
                onClick={() => navigate('/playlists/new')}
                disabled={screenCount === 0}
              >
                New Playlist
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {playlists
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .slice(0, 3)
              .map((playlist) => {
                const screen = screens.find((s) => s.id === playlist.screenId);
                return (
                  <Card key={playlist.id}>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{playlist.name}</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Screen: {screen?.name || 'Unknown'}
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        Content items: {playlist.contents.length}
                      </p>
                      {playlist.previewUrl && (
                        <div className="mt-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Published
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="mt-4 flex space-x-2">
                      <Button
                        variant="outline"
                        fullWidth
                        onClick={() => navigate(`/playlists/${playlist.id}`)}
                      >
                        View
                      </Button>
                      <Button
                        variant="primary"
                        fullWidth
                        onClick={() => navigate(`/playlists/${playlist.id}/edit`)}
                      >
                        Edit
                      </Button>
                    </div>
                  </Card>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;