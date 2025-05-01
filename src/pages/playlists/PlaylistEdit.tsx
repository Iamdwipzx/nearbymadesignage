import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Eye } from 'lucide-react';
import { usePlaylistStore } from '../../store/playlistStore';
import { useScreenStore } from '../../store/screenStore';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import CanvasEditor from '../../components/canvas/CanvasEditor';
import Modal from '../../components/ui/Modal';

const PlaylistEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { playlists, getPlaylistById, updatePlaylist, generatePreviewUrl } = usePlaylistStore();
  const { screens, fetchScreens } = useScreenStore();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        await fetchScreens();
        
        if (id) {
          const playlist = getPlaylistById(id);
          if (playlist) {
            setName(playlist.name);
            setPreviewUrl(playlist.previewUrl || null);
          } else {
            setError('Playlist not found');
          }
        }
      } catch (err) {
        console.error('Error loading playlist:', err);
        setError('Failed to load playlist data');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id, getPlaylistById, fetchScreens]);

  const playlist = id ? getPlaylistById(id) : undefined;
  const screen = playlist ? screens.find(s => s.id === playlist.screenId) : undefined;

  const handleSave = async (newContents?: any[]) => {
    if (!id || !user) return;
    
    setIsSaving(true);
    setError('');
    
    try {
      await updatePlaylist(id, { 
        name,
        contents: newContents || playlist?.contents || [],
      });
      
      // Show success briefly
      setTimeout(() => {
        setIsSaving(false);
      }, 500);
    } catch (err) {
      console.error('Error updating playlist:', err);
      setError('Failed to update playlist');
      setIsSaving(false);
    }
  };

  const handleNameSave = async () => {
    await handleSave();
  };

  const handleGeneratePreview = async () => {
    if (!id) return;
    
    setIsGeneratingPreview(true);
    setError('');
    
    try {
      const url = await generatePreviewUrl(id);
      if (url) {
        setPreviewUrl(url);
        setIsSuccessModalOpen(true);
      }
    } catch (err) {
      console.error('Error generating preview:', err);
      setError('Failed to generate preview URL');
    } finally {
      setIsGeneratingPreview(false);
    }
  };

  if (isLoading && !playlist) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Loading playlist...</p>
      </div>
    );
  }

  if (!playlist || !screen) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error || 'Playlist or screen not found'}</p>
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
    <div className="flex flex-col h-full space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            icon={<ArrowLeft size={16} />}
            onClick={() => navigate(`/playlists/${playlist.id}`)}
            className="mr-4"
          />
          <div className="flex items-center space-x-2">
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-xl font-semibold py-1 px-2 w-72"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleNameSave}
              isLoading={isSaving}
            >
              Save
            </Button>
          </div>
        </div>
        
        <div className="flex space-x-2">
          {previewUrl && (
            <Button
              variant="outline"
              icon={<Eye size={16} />}
              onClick={() => navigate(previewUrl)}
            >
              View Preview
            </Button>
          )}
          
          <Button
            variant="primary"
            icon={<Save size={16} />}
            onClick={handleGeneratePreview}
            isLoading={isGeneratingPreview}
          >
            Generate Preview
          </Button>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      <div className="flex-1 -mt-2">
        <CanvasEditor
          aspectRatio={screen.aspectRatio}
          contents={playlist.contents}
          onSave={handleSave}
        />
      </div>
      
      {/* Success Modal */}
      <Modal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        title="Preview Generated"
        footer={
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setIsSuccessModalOpen(false)}
            >
              Close
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setIsSuccessModalOpen(false);
                if (previewUrl) {
                  navigate(previewUrl);
                }
              }}
            >
              View Preview
            </Button>
          </div>
        }
      >
        <div className="text-center py-4">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <svg
              className="h-6 w-6 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              ></path>
            </svg>
          </div>
          <h3 className="mt-3 text-lg font-medium text-gray-900">Preview Ready</h3>
          <p className="mt-2 text-sm text-gray-500">
            Your playlist preview has been generated and is ready to view.
          </p>
          {previewUrl && (
            <div className="mt-4 bg-gray-50 p-2 rounded border border-gray-200">
              <a 
                href={previewUrl} 
                className="text-blue-600 hover:underline break-all"
                target="_blank"
                rel="noopener noreferrer"
              >
                {window.location.origin}{previewUrl}
              </a>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default PlaylistEdit;