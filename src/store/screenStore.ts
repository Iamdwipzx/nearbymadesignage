import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { AspectRatio, Screen } from '../types';

type ScreenState = {
  screens: Screen[];
  loading: boolean;
  error: string | null;
  createScreen: (name: string, aspectRatio: AspectRatio, userId: string) => Promise<Screen>;
  updateScreen: (id: string, data: Partial<Screen>) => Promise<Screen | null>;
  deleteScreen: (id: string) => Promise<boolean>;
  getScreenById: (id: string) => Screen | undefined;
  fetchScreens: () => Promise<void>;
};

export const useScreenStore = create<ScreenState>((set, get) => ({
  screens: [],
  loading: false,
  error: null,
  
  fetchScreens: async () => {
    set({ loading: true, error: null });
    try {
      const { data: screens, error } = await supabase
        .from('screens')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedScreens = (screens || []).map(screen => ({
        id: screen.id,
        name: screen.name,
        aspectRatio: screen.aspect_ratio,
        createdAt: screen.created_at,
        updatedAt: screen.updated_at,
        createdBy: screen.created_by,
      }));

      set({ screens: mappedScreens, loading: false });
    } catch (error) {
      console.error('Error fetching screens:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch screens', 
        loading: false 
      });
    }
  },
  
  createScreen: async (name, aspectRatio, userId) => {
    set({ loading: true, error: null });
    try {
      const now = new Date().toISOString();
      const { data: screen, error } = await supabase
        .from('screens')
        .insert([
          {
            name,
            aspect_ratio: aspectRatio,
            created_by: userId,
            created_at: now,
            updated_at: now
          }
        ])
        .select()
        .single();

      if (error) throw error;
      if (!screen) throw new Error('Failed to create screen');

      const newScreen: Screen = {
        id: screen.id,
        name: screen.name,
        aspectRatio: screen.aspect_ratio,
        createdAt: screen.created_at,
        updatedAt: screen.updated_at,
        createdBy: screen.created_by,
      };

      set(state => ({
        screens: [newScreen, ...state.screens],
        loading: false
      }));

      return newScreen;
    } catch (error) {
      console.error('Error creating screen:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to create screen', 
        loading: false 
      });
      throw error;
    }
  },
  
  updateScreen: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const { data: screen, error } = await supabase
        .from('screens')
        .update({
          name: data.name,
          aspect_ratio: data.aspectRatio,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      if (!screen) throw new Error('Screen not found');

      const updatedScreen: Screen = {
        id: screen.id,
        name: screen.name,
        aspectRatio: screen.aspect_ratio,
        createdAt: screen.created_at,
        updatedAt: screen.updated_at,
        createdBy: screen.created_by,
      };

      set(state => ({
        screens: state.screens.map(s => s.id === id ? updatedScreen : s),
        loading: false
      }));

      return updatedScreen;
    } catch (error) {
      console.error('Error updating screen:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update screen', 
        loading: false 
      });
      throw error;
    }
  },
  
  deleteScreen: async (id) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('screens')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set(state => ({
        screens: state.screens.filter(screen => screen.id !== id),
        loading: false
      }));

      return true;
    } catch (error) {
      console.error('Error deleting screen:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete screen', 
        loading: false 
      });
      throw error;
    }
  },
  
  getScreenById: (id) => {
    return get().screens.find(screen => screen.id === id);
  },
}));