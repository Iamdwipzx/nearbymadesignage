import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Monitor, Film, Plus, Edit, ArrowLeft, Trash2 } from 'lucide-react';
import { useScreenStore } from '../../store/screenStore';
import { usePlaylistStore } from '../../store/playlistStore';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';

const ScreenDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { screens, getScreenById, updateScreen, deleteScreen } = useScreenStore();
  const { playlists, fetchPlaylists } = usePlaylistStore();
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [screenPlaylists, setScreenPlaylists] = useState<any[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        await fetchPlaylists();
        
        if (id) {
          const screen = getScreenById(id);
          if (screen) {
            setName(screen.name);
          } else {
            setError('Screen not found');
          }
        }
      } catch (err) {
        console.error('Error loading screen:', err);
        setError('Failed to load screen data');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id, getScreenById, fetchPlaylists]);

  useEffect(() => {
    if (id) {
      const filtered = playlists.filter(playlist => playlist.screenId === id);
      setScreenPlaylists(filtered);
    }
  }, [id, playlists]);

  const screen = id ? getScreenById(id) : undefined;

  const handleSave = async () => {
    if (!id || !user) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      await updateScreen(id, { name });
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating screen:', err);
      setError('Failed to update screen');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteScreen = async () => {
    if (!id) return;
    
    if (screenPlaylists.length > 0) {
      setDeleteError(`Cannot delete this screen because it has ${screenPlaylists.length} associated playlist(s). Please delete the playlists first.`);
      return;
    }
    
    setIsLoading(true);
    
    try {
      await deleteScreen(id);
      navigate('/screens');
    } catch (err) {
      console.error('Error deleting screen:', err);
      setDeleteError('Failed to delete screen');
      setIsLoading(false);
    }
  };

  if (isLoading && !screen) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Loading screen...</p>
      </div>
    );
  }

  if (!screen) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error || 'Screen not found'}</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => navigate('/screens')}
          icon={<ArrowLeft size={16} />}
        >
          Back to Screens
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            icon={<ArrowLeft size={16} />}
            onClick={() => navigate('/screens')}
            className="mr-4"
          />
          {isEditing ? (
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-2xl font-semibold py-1 px-2"
            />
          ) : (
            <h1 className="text-2xl font-semibold text-gray-900">{screen.name}</h1>
          )}
        </div>
        
        <div className="flex space-x-2">
          {isEditing ? (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  setName(screen.name);
                  setIsEditing(false);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSave}
                isLoading={isLoading}
              >
                Save
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                icon={<Edit size={16} />}
                onClick={() => setIsEditing(true)}
              >
                Edit Screen
              </Button>
              <Button
                variant="outline"
                className="border-red-300 text-red-600 hover:bg-red-50"
                icon={<Trash2 size={16} />}
                onClick={() => setIsDeleteModalOpen(true)}
              >
                Delete
              </Button>
            </>
          )}
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      <div className="bg-white shadow overflow-hidden rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Screen Details
          </h3>
        </div>
        <div className="px-4 py-5 sm:p-6">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-gray-500">Aspect Ratio</dt>
              <dd className="mt-1 text-sm text-gray-900">
                <div className="flex items-center">
                  <div className={`
                    w-12 h-${screen.aspectRatio === '16:9' ? '7' : '12'}
                    bg-blue-100 border border-blue-300 rounded mr-2
                    flex items-center justify-center
                  `}>
                    <Monitor size={16} className="text-blue-500" />
                  </div>
                  <span>{screen.aspectRatio}</span>
                </div>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Created On</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {new Date(screen.createdAt).toLocaleDateString()}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {new Date(screen.updatedAt).toLocaleDateString()}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Playlists</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {screenPlaylists.length}
              </dd>
            </div>
          </dl>
        </div>
      </div>
      
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900">Playlists</h2>
          <Button
            variant="primary"
            size="sm"
            icon={<Plus size={16} />}
            onClick={() => navigate(`/playlists/new?screenId=${screen.id}`)}
          >
            Create Playlist
          </Button>
        </div>
        
        {screenPlaylists.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
            <Film className="h-12 w-12 text-gray-400 mx-auto" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No playlists</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating a new playlist for this screen.
            </p>
            <div className="mt-6">
              <Button
                variant="primary"
                icon={<Plus size={16} />}
                onClick={() => navigate(`/playlists/new?screenId=${screen.id}`)}
              >
                Create Playlist
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {screenPlaylists.map((playlist) => (
              <Card key={playlist.id}>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{playlist.name}</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Content items: {playlist.contents.length}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Last updated: {new Date(playlist.updatedAt).toLocaleDateString()}
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
            ))}
          </div>
        )}
      </div>
      
      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeleteError('');
        }}
        title="Delete Screen"
        footer={
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setDeleteError('');
              }}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteScreen}
              isLoading={isLoading}
            >
              Delete
            </Button>
          </div>
        }
      >
        {deleteError ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {deleteError}
          </div>
        ) : (
          <p>Are you sure you want to delete this screen? This action cannot be undone.</p>
        )}
      </Modal>
    </div>
  );
};

export default ScreenDetail;