import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { usePlaylistStore } from '../store/playlistStore';
import { useScreenStore } from '../store/screenStore';
import { ContentItem } from '../types';
import ImageContent from '../components/canvas/contentTypes/ImageContent';
import VideoContent from '../components/canvas/contentTypes/VideoContent';
import YoutubeContent from '../components/canvas/contentTypes/YoutubeContent';
import CanvaContent from '../components/canvas/contentTypes/CanvaContent';
import HtmlContent from '../components/canvas/contentTypes/HtmlContent';
import { supabase } from '../lib/supabase';

const Preview = () => {
  const { id } = useParams<{ id: string }>();
  const { getPlaylistById } = usePlaylistStore();
  const { getScreenById } = useScreenStore();
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playlist, setPlaylist] = useState<any>(null);
  const [screen, setScreen] = useState<any>(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError('');

      try {
        // Fetch playlist data from Supabase
        const { data: playlistData, error: playlistError } = await supabase
          .from('playlists')
          .select(`
            id,
            name,
            screen_id,
            created_by,
            preview_url,
            short_preview_url,
            created_at,
            updated_at,
            playlist_contents (*)
          `)
          .eq('short_preview_url', id)
          .single();

        if (playlistError) throw playlistError;
        if (!playlistData) {
          setError('Playlist not found');
          setIsLoading(false);
          return;
        }

        // Transform playlist data
        const transformedPlaylist = {
          id: playlistData.id,
          name: playlistData.name,
          screenId: playlistData.screen_id,
          createdBy: playlistData.created_by,
          previewUrl: playlistData.preview_url,
          shortPreviewUrl: playlistData.short_preview_url,
          createdAt: playlistData.created_at,
          updatedAt: playlistData.updated_at,
          contents: (playlistData.playlist_contents || []).map((content: any) => ({
            id: content.id,
            type: content.type,
            content: content.content,
            position: {
              x: content.position_x,
              y: content.position_y,
              width: content.width,
              height: content.height,
            },
            settings: content.settings || {},
          })),
        };

        setPlaylist(transformedPlaylist);

        // Fetch screen data
        const { data: screenData, error: screenError } = await supabase
          .from('screens')
          .select('*')
          .eq('id', playlistData.screen_id)
          .single();

        if (screenError) throw screenError;
        if (!screenData) {
          setError('Screen not found');
          setIsLoading(false);
          return;
        }

        // Transform screen data
        const transformedScreen = {
          id: screenData.id,
          name: screenData.name,
          aspectRatio: screenData.aspect_ratio,
          createdAt: screenData.created_at,
          updatedAt: screenData.updated_at,
          createdBy: screenData.created_by,
        };

        setScreen(transformedScreen);

        // Calculate dimensions based on screen aspect ratio
        const width = window.innerWidth;
        const height = screenData.aspect_ratio === '16:9' 
          ? Math.round(width * (9/16))
          : Math.round(width * (16/9));

    setDimensions({ width, height });
      } catch (err) {
        console.error('Error loading preview data:', err);
        setError('Failed to load preview data');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id]);

  const enterFullscreen = async () => {
    try {
      const elem = document.documentElement;
      if (!document.fullscreenElement) {
        if (elem.requestFullscreen) {
          await elem.requestFullscreen();
        } else if ((elem as any).webkitRequestFullscreen) {
          await (elem as any).webkitRequestFullscreen();
        } else if ((elem as any).msRequestFullscreen) {
          await (elem as any).msRequestFullscreen();
        }
        setIsFullscreen(true);
      }
    } catch (err) {
      console.error('Failed to enter fullscreen:', err);
      // Continue showing content even if fullscreen fails
    }
  };

  const exitFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        } else if ((document as any).msExitFullscreen) {
          await (document as any).msExitFullscreen();
        }
        setIsFullscreen(false);
      }
    } catch (err) {
      console.error('Failed to exit fullscreen:', err);
    }
  };

  useEffect(() => {
    // Set title
    document.title = playlist ? `${playlist.name} - Preview` : 'Preview';

    // Handle fullscreen change events
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    // Recalculate on window resize
    window.addEventListener('resize', () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    });
    
    // Set a short timeout to simulate loading and let the components mount properly
    const timer = setTimeout(() => {
      enterFullscreen();
    }, 500);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
      window.removeEventListener('resize', () => {
        setDimensions({ width: window.innerWidth, height: window.innerHeight });
      });
      clearTimeout(timer);
      
      if (isFullscreen) {
        exitFullscreen();
      }
    };
  }, [playlist, screen]);

  const renderContentItem = (content: ContentItem) => {
    switch (content.type) {
      case 'image':
        return <ImageContent content={content} />;
      case 'video':
        return <VideoContent content={content} />;
      case 'youtube':
        return <YoutubeContent content={content} />;
      case 'canva':
        return <CanvaContent content={content} />;
      case 'html':
        return <HtmlContent content={content} />;
      default:
        return <div>Unsupported content type</div>;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-xl">Loading preview...</p>
        </div>
      </div>
    );
  }

  if (!playlist || !screen) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="bg-red-900 text-white p-6 rounded-lg max-w-md">
          <h2 className="text-xl font-bold mb-2">Preview Error</h2>
          <p>{error || 'Playlist or screen not found'}</p>
        </div>
      </div>
    );
  }

  if (playlist.contents.length === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="bg-gray-800 text-white p-6 rounded-lg max-w-md">
          <h2 className="text-xl font-bold mb-2">Empty Playlist</h2>
          <p>This playlist doesn't have any content items yet.</p>
        </div>
      </div>
    );
  }

  // Calculate the scale factor based on the original canvas width
  const scaleFactor = dimensions.width / 1000;

  return (
    <div 
      id="preview-container"
      className="min-h-screen bg-black flex items-center justify-center overflow-hidden"
      style={{
        width: '100vw',
        height: '100vh',
      }}
    >
      <div 
        style={{
          width: `${dimensions.width}px`,
          height: `${dimensions.height}px`,
          position: 'relative',
          backgroundColor: 'black',
        }}
      >
        {playlist.contents.map((content: ContentItem) => (
          <div
            key={content.id}
            className="absolute overflow-hidden"
            style={{
              left: `${Math.round(content.position.x * scaleFactor)}px`,
              top: `${Math.round(content.position.y * scaleFactor)}px`,
              width: `${Math.round(content.position.width * scaleFactor)}px`,
              height: `${Math.round(content.position.height * scaleFactor)}px`,
            }}
          >
            {renderContentItem(content)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Preview;