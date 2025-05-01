import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useScreenStore } from '../../store/screenStore';
import { AspectRatio } from '../../types';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import { Monitor } from 'lucide-react';

const NewScreen = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createScreen, fetchScreens } = useScreenStore();
  
  const [name, setName] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Please enter a screen name');
      return;
    }
    
    if (!user) {
      setError('You must be logged in to create a screen');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const newScreen = await createScreen(name, aspectRatio, user.id);
      await fetchScreens();
      navigate(`/screens/${newScreen.id}`);
    } catch (err) {
      console.error('Error creating screen:', err);
      setError('Failed to create screen. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Add New Screen</h1>
        <p className="mt-1 text-sm text-gray-500">
          Create a new digital signage screen
        </p>
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
              label="Screen Name"
              type="text"
              fullWidth
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Lobby Display"
              required
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Screen Aspect Ratio
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div
                className={`
                  border rounded-lg p-4 cursor-pointer
                  ${aspectRatio === '16:9'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:bg-gray-50'
                  }
                `}
                onClick={() => setAspectRatio('16:9')}
              >
                <div className="flex items-center justify-center">
                  <div className="w-24 h-14 bg-gray-100 border border-gray-300 rounded relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Monitor size={24} className="text-gray-400" />
                    </div>
                  </div>
                </div>
                <div className="mt-2 text-center">
                  <div className="font-medium">Landscape (16:9)</div>
                  <div className="text-xs text-gray-500">Standard horizontal display</div>
                </div>
              </div>
              
              <div
                className={`
                  border rounded-lg p-4 cursor-pointer
                  ${aspectRatio === '9:16'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:bg-gray-50'
                  }
                `}
                onClick={() => setAspectRatio('9:16')}
              >
                <div className="flex items-center justify-center">
                  <div className="w-14 h-24 bg-gray-100 border border-gray-300 rounded relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Monitor size={24} className="text-gray-400" />
                    </div>
                  </div>
                </div>
                <div className="mt-2 text-center">
                  <div className="font-medium">Portrait (9:16)</div>
                  <div className="text-xs text-gray-500">Vertical display</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => navigate('/screens')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
            >
              Create Screen
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
};

export default NewScreen;