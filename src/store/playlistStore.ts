import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Playlist, ContentItem } from '../types';

interface PlaylistStore {
  playlists: Playlist[];
  activePlaylist: Playlist | null;
  loading: boolean;
  error: string | null;
  fetchPlaylists: () => Promise<void>;
  generatePreviewUrl: (playlistId: string) => Promise<string | null>;
  createPlaylist: (name: string, screenId: string, userId: string) => Promise<Playlist>;
  updatePlaylist: (id: string, data: { name?: string; contents?: ContentItem[] }) => Promise<void>;
  deletePlaylist: (id: string) => Promise<void>;
  getPlaylistById: (id: string) => Playlist | undefined;
}

export const usePlaylistStore = create<PlaylistStore>((set, get) => ({
  playlists: [],
  activePlaylist: null,
  loading: false,
  error: null,

  fetchPlaylists: async () => {
    set({ loading: true, error: null });
    try {
      const { data: playlists, error } = await supabase
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
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transformedPlaylists = (playlists || []).map(playlist => ({
        id: playlist.id,
        name: playlist.name,
        screenId: playlist.screen_id,
        createdBy: playlist.created_by,
        previewUrl: playlist.preview_url,
        shortPreviewUrl: playlist.short_preview_url,
        createdAt: playlist.created_at,
        updatedAt: playlist.updated_at,
        contents: (playlist.playlist_contents || []).map(content => ({
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
      }));

      set({ playlists: transformedPlaylists, loading: false });
    } catch (error) {
      console.error('Error fetching playlists:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch playlists',
        loading: false 
      });
    }
  },

  createPlaylist: async (name, screenId, userId) => {
    set({ loading: true, error: null });
    try {
      const { data: playlist, error } = await supabase
        .from('playlists')
        .insert([
          {
            name,
            screen_id: screenId,
            created_by: userId,
          }
        ])
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
        .single();

      if (error) throw error;
      if (!playlist) throw new Error('Failed to create playlist');

      const newPlaylist: Playlist = {
        id: playlist.id,
        name: playlist.name,
        screenId: playlist.screen_id,
        createdBy: playlist.created_by,
        previewUrl: playlist.preview_url,
        shortPreviewUrl: playlist.short_preview_url,
        createdAt: playlist.created_at,
        updatedAt: playlist.updated_at,
        contents: [],
      };

      set(state => ({
        playlists: [newPlaylist, ...state.playlists],
        loading: false
      }));

      return newPlaylist;
    } catch (error) {
      console.error('Error creating playlist:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to create playlist',
        loading: false 
      });
      throw error;
    }
  },

  updatePlaylist: async (id, data) => {
    set({ loading: true, error: null });
    try {
      // Update playlist name if provided
      if (data.name) {
        const { error: nameError } = await supabase
          .from('playlists')
          .update({ name: data.name })
          .eq('id', id);

        if (nameError) throw nameError;
      }

      // Update contents if provided
      if (data.contents) {
        // First, delete existing contents
        const { error: deleteError } = await supabase
          .from('playlist_contents')
          .delete()
          .eq('playlist_id', id);

        if (deleteError) throw deleteError;

        // Then insert new contents
        if (data.contents.length > 0) {
          const { error: insertError } = await supabase
            .from('playlist_contents')
            .insert(
              data.contents.map(content => ({
                playlist_id: id,
                type: content.type,
                content: content.content,
                position_x: Math.round(content.position.x),
                position_y: Math.round(content.position.y),
                width: Math.round(content.position.width),
                height: Math.round(content.position.height),
                settings: content.settings,
              }))
            );

          if (insertError) throw insertError;
        }
      }

      // Fetch updated playlist
      await get().fetchPlaylists();

      set({ loading: false });
    } catch (error) {
      console.error('Error updating playlist:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update playlist',
        loading: false 
      });
      throw error;
    }
  },

  deletePlaylist: async (id) => {
    set({ loading: true, error: null });
    try {
      // First, delete all playlist contents
      const { error: contentsError } = await supabase
        .from('playlist_contents')
        .delete()
        .eq('playlist_id', id);

      if (contentsError) throw contentsError;

      // Then delete the playlist
      const { error: playlistError } = await supabase
        .from('playlists')
        .delete()
        .eq('id', id);

      if (playlistError) throw playlistError;

      set(state => ({
        playlists: state.playlists.filter(playlist => playlist.id !== id),
        loading: false
      }));
    } catch (error) {
      console.error('Error deleting playlist:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete playlist',
        loading: false 
      });
      throw error;
    }
  },

  generatePreviewUrl: async (playlistId) => {
    set({ loading: true, error: null });
    try {
      const playlistIndex = get().playlists.findIndex(playlist => playlist.id === playlistId);
      
      if (playlistIndex === -1) {
        set({ 
          error: `Playlist with ID ${playlistId} not found`, 
          loading: false 
        });
        return null;
      }

      const shortCode = Math.random().toString(36).substring(2, 10).toUpperCase();
      const previewUrl = `/preview/${shortCode}`;
      
      const { error } = await supabase
        .from('playlists')
        .update({
          preview_url: previewUrl,
          short_preview_url: shortCode,
          updated_at: new Date().toISOString()
        })
        .eq('id', playlistId);

      if (error) throw error;
      
      const updatedPlaylist = {
        ...get().playlists[playlistIndex],
        previewUrl,
        shortPreviewUrl: shortCode,
        updatedAt: new Date().toISOString(),
      };
      
      const updatedPlaylists = [...get().playlists];
      updatedPlaylists[playlistIndex] = updatedPlaylist;
      
      set({ 
        playlists: updatedPlaylists, 
        activePlaylist: playlistId === get().activePlaylist?.id ? updatedPlaylist : get().activePlaylist,
        loading: false 
      });
      
      return previewUrl;
    } catch (error) {
      console.error('Error generating preview URL:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to generate preview URL', 
        loading: false 
      });
      throw error;
    }
  },

  getPlaylistById: (id) => {
    return get().playlists.find(playlist => playlist.id === id);
  },
}));