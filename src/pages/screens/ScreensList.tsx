import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Monitor, Trash2, Edit, Film } from 'lucide-react';
import { useScreenStore } from '../../store/screenStore';
import { usePlaylistStore } from '../../store/playlistStore';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';

const ScreensList = () => {
  const navigate = useNavigate();
  const { screens, fetchScreens, deleteScreen } = useScreenStore();
  const { playlists, fetchPlaylists } = usePlaylistStore();
  const [isLoading, setIsLoading] = useState(true);
  const [deleteConfirmation, setDeleteConfirmation] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchScreens(), fetchPlaylists()]);
      setIsLoading(false);
    };

    loadData();
  }, [fetchScreens, fetchPlaylists]);

  const handleDeleteScreen = async (screenId: string) => {
    // Check if there are any playlists associated with this screen
    const associatedPlaylists = playlists.filter(
      (playlist) => playlist.screenId === screenId
    );

    if (associatedPlaylists.length > 0) {
      setDeleteError(
        `Cannot delete this screen because it has ${associatedPlaylists.length} associated playlist(s). Please delete the playlists first.`
      );
      return;
    }

    try {
      await deleteScreen(screenId);
      setDeleteConfirmation(null);
    } catch (error) {
      console.error('Error deleting screen:', error);
      setDeleteError('Failed to delete screen. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Screens</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your display screens
          </p>
        </div>
        <Button
          variant="primary"
          icon={<Plus size={16} />}
          onClick={() => navigate('/screens/new')}
        >
          Add Screen
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading screens...</p>
        </div>
      ) : screens.length === 0 ? (
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
                  Aspect Ratio
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Playlists
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Created At
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
              {screens.map((screen) => {
                const screenPlaylists = playlists.filter(
                  (playlist) => playlist.screenId === screen.id
                );
                return (
                  <tr key={screen.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-md bg-blue-100 flex items-center justify-center">
                          <Monitor className="h-6 w-6 text-blue-500" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{screen.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{screen.aspectRatio}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {screenPlaylists.length > 0 ? (
                          <span className="flex items-center">
                            <Film className="h-4 w-4 mr-1 text-blue-500" />
                            {screenPlaylists.length}
                          </span>
                        ) : (
                          <span className="text-gray-500">No playlists</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(screen.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          icon={<Edit size={16} />}
                          onClick={() => navigate(`/screens/${screen.id}`)}
                        >
                          Manage
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<Trash2 size={16} className="text-red-500" />}
                          className="text-red-500 hover:bg-red-50"
                          onClick={() => setDeleteConfirmation(screen.id)}
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
        title="Delete Screen"
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
              onClick={() => deleteConfirmation && handleDeleteScreen(deleteConfirmation)}
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

export default ScreensList;