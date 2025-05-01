import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Edit, Eye, Film, Monitor } from 'lucide-react';
import { usePlaylistStore } from '../../store/playlistStore';
import { useScreenStore } from '../../store/screenStore';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

const PlaylistDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { playlists, getPlaylistById, fetchPlaylists } = usePlaylistStore();
  const { screens, fetchScreens } = useScreenStore();
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([fetchPlaylists(), fetchScreens()]);
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load playlist data');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id, fetchPlaylists, fetchScreens]);

  const playlist = id ? getPlaylistById(id) : undefined;
  const screen = playlist ? screens.find(s => s.id === playlist.screenId) : undefined;

  if (isLoading && !playlist) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Loading playlist...</p>
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error || 'Playlist not found'}</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => navigate('/playlists')}
          icon={<ArrowLeft size={16} />}
        >
          Back to Playlists
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
            onClick={() => navigate('/playlists')}
            className="mr-4"
          />
          <h1 className="text-2xl font-semibold text-gray-900">{playlist.name}</h1>
        </div>
        
        <div className="flex space-x-2">
          <Button
            variant="outline"
            icon={<Edit size={16} />}
            onClick={() => navigate(`/playlists/${playlist.id}/edit`)}
          >
            Edit Playlist
          </Button>
          
          {playlist.previewUrl && (
            <Button
              variant="primary"
              icon={<Eye size={16} />}
              onClick={() => navigate(playlist.previewUrl!)}
            >
              Preview
            </Button>
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
            Playlist Details
          </h3>
        </div>
        <div className="px-4 py-5 sm:p-6">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-gray-500">Screen</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {screen ? (
                  <div className="flex items-center">
                    <Monitor className="h-4 w-4 mr-1 text-gray-500" />
                    {screen.name} ({screen.aspectRatio})
                  </div>
                ) : (
                  <span className="text-red-500">Screen not found</span>
                )}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Content Items</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {playlist.contents.length}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Created On</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {new Date(playlist.createdAt).toLocaleDateString()}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {new Date(playlist.updatedAt).toLocaleDateString()}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Status</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {playlist.previewUrl ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Published
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    Draft
                  </span>
                )}
              </dd>
            </div>
            {playlist.previewUrl && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Preview URL</dt>
                <dd className="mt-1 text-sm text-blue-600">
                  <a href={playlist.previewUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                    {playlist.previewUrl}
                  </a>
                </dd>
              </div>
            )}
          </dl>
        </div>
      </div>
      
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Preview</h2>
        
        {playlist.contents.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
            <Film className="h-12 w-12 text-gray-400 mx-auto" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No content items</h3>
            <p className="mt-1 text-sm text-gray-500">
              This playlist doesn't have any content yet.
            </p>
            <div className="mt-6">
              <Button
                variant="primary"
                icon={<Edit size={16} />}
                onClick={() => navigate(`/playlists/${playlist.id}/edit`)}
              >
                Edit Playlist
              </Button>
            </div>
          </div>
        ) : (
          <Card>
            <div className="overflow-hidden" style={{
              width: '100%',
              height: screen?.aspectRatio === '16:9' ? 'calc(9 / 16 * 100%)' : 'calc(16 / 9 * 100%)',
              paddingBottom: screen?.aspectRatio === '16:9' ? 'calc(9 / 16 * 100%)' : 'calc(16 / 9 * 100%)',
              position: 'relative',
              backgroundColor: '#f3f4f6',
            }}>
              <div className="absolute inset-0 flex items-center justify-center">
                <Button
                  variant="primary"
                  icon={<Eye size={16} />}
                  onClick={() => navigate(playlist.previewUrl || `/preview/${playlist.id}`)}
                >
                  View Full Preview
                </Button>
              </div>
            </div>
            
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Content Items</h3>
              <div className="space-y-2">
                {playlist.contents.map((content, index) => (
                  <div key={content.id} className="flex items-center p-2 bg-gray-50 rounded border border-gray-200">
                    <div className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-full mr-2">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium capitalize">{content.type}</div>
                      <div className="text-xs text-gray-500 truncate max-w-md">
                        {content.content}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {content.position.width} x {content.position.height}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PlaylistDetail;