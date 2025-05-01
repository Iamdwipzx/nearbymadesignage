import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useScreenStore } from '../../store/screenStore';
import { usePlaylistStore } from '../../store/playlistStore';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Card from '../../components/ui/Card';
import { ArrowLeft } from 'lucide-react';

const NewPlaylist = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { screens, fetchScreens } = useScreenStore();
  const { createPlaylist } = usePlaylistStore();
  
  const [name, setName] = useState('');
  const [screenId, setScreenId] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadScreens = async () => {
      setIsLoading(true);
      try {
      await fetchScreens();
      } catch (error) {
        console.error('Error loading screens:', error);
        setError('Failed to load screens. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadScreens();

    // Check if a screenId was passed in the URL
    const params = new URLSearchParams(location.search);
    const urlScreenId = params.get('screenId');
    
    if (urlScreenId) {
      setScreenId(urlScreenId);
    }
  }, [fetchScreens, location.search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Please enter a playlist name');
      return;
    }
    
    if (!screenId) {
      setError('Please select a screen');
      return;
    }
    
    if (!user) {
      setError('You must be logged in to create a playlist');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const newPlaylist = await createPlaylist(name, screenId, user.id);
      navigate(`/playlists/${newPlaylist.id}/edit`);
    } catch (err) {
      console.error('Error creating playlist:', err);
      setError('Failed to create playlist. Please try again.');
      setIsLoading(false);
    }
  };

  // Add loading state for screens
  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="text-center py-12">
          <p className="text-gray-500">Loading screens...</p>
        </div>
      </div>
    );
  }

  // Add error state for screens
  if (error) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6 flex items-center">
        <Button
          variant="ghost"
          size="sm"
          icon={<ArrowLeft size={16} />}
          onClick={() => navigate('/playlists')}
          className="mr-4"
        >
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Create New Playlist</h1>
          <p className="mt-1 text-sm text-gray-500">
            Add a new playlist for your digital signage screen
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          <div className="mb-4">
            <Input
              label="Playlist Name"
              type="text"
              fullWidth
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Main Lobby Content"
              required
            />
          </div>
          
          <div className="mb-6">
            <Select
              label="Select Screen"
              options={screens.map(screen => ({
                value: screen.id,
                label: `${screen.name} (${screen.aspectRatio})`,
              }))}
              value={screenId}
              onChange={(e) => setScreenId(e.target.value)}
              fullWidth
              required
            />
            
            {screens.length === 0 && (
              <p className="mt-2 text-sm text-red-600">
                No screens available. Please create a screen first.
              </p>
            )}
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => navigate('/playlists')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              disabled={screens.length === 0}
            >
              Create Playlist
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
};

export default NewPlaylist;