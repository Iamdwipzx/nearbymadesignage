import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Film, Trash2, Edit, Eye, Monitor } from 'lucide-react';
import { usePlaylistStore } from '../../store/playlistStore';
import { useScreenStore } from '../../store/screenStore';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';

const PlaylistsList = () => {
  const navigate = useNavigate();
  const { playlists, fetchPlaylists, deletePlaylist } = usePlaylistStore();
  const { screens, fetchScreens } = useScreenStore();
  const [isLoading, setIsLoading] = useState(true);
  const [deleteConfirmation, setDeleteConfirmation] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchPlaylists(), fetchScreens()]);
      setIsLoading(false);
    };

    loadData();
  }, [fetchPlaylists, fetchScreens]);

  const handleDeletePlaylist = async (playlistId: string) => {
    try {
      await deletePlaylist(playlistId);
      setDeleteConfirmation(null);
    } catch (error) {
      console.error('Error deleting playlist:', error);
      setDeleteError('Failed to delete playlist. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Playlists</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your content playlists
          </p>
        </div>
        <Button
          variant="primary"
          icon={<Plus size={16} />}
          onClick={() => navigate('/playlists/new')}
          disabled={screens.length === 0}
        >
          New Playlist
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading playlists...</p>
        </div>
      ) : screens.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
          <Monitor className="h-12 w-12 text-gray-400 mx-auto" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No screens available</h3>
          <p className="mt-1 text-sm text-gray-500">
            You need to create a screen before you can create playlists.
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
      ) : playlists.length === 0 ? (
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
            >
              New Playlist
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Name
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Screen
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Content Items
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {playlists.map((playlist) => {
                const screen = screens.find((s) => s.id === playlist.screenId);
                return (
                  <tr key={playlist.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-md bg-blue-100 flex items-center justify-center">
                          <Film className="h-6 w-6 text-blue-500" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{playlist.name}</div>
                          <div className="text-sm text-gray-500">
                            {new Date(playlist.updatedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {screen ? (
                          <div className="flex items-center">
                            <Monitor className="h-4 w-4 mr-1 text-gray-500" />
                            <span>{screen.name}</span>
                            <span className="ml-1 text-xs text-gray-500">({screen.aspectRatio})</span>
                          </div>
                        ) : (
                          <span className="text-red-500">Screen not found</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {playlist.contents.length} items
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {playlist.previewUrl ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Published
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Draft
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        {playlist.previewUrl && (
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={<Eye size={16} />}
                            onClick={() => navigate(playlist.previewUrl!)}
                            className="text-green-600 hover:bg-green-50"
                          >
                            Preview
                          </Button>
                        )}
                        
                        <Button
                          variant="outline"
                          size="sm"
                          icon={<Edit size={16} />}
                          onClick={() => navigate(`/playlists/${playlist.id}/edit`)}
                        >
                          Edit
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<Trash2 size={16} className="text-red-500" />}
                          className="text-red-500 hover:bg-red-50"
                          onClick={() => setDeleteConfirmation(playlist.id)}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteConfirmation !== null}
        onClose={() => {
          setDeleteConfirmation(null);
          setDeleteError(null);
        }}
        title="Delete Playlist"
        footer={
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteConfirmation(null);
                setDeleteError(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => deleteConfirmation && handleDeletePlaylist(deleteConfirmation)}
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
          <p>Are you sure you want to delete this playlist? This action cannot be undone.</p>
        )}
      </Modal>
    </div>
  );
};

export default PlaylistsList;