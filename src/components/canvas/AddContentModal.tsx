import React, { useState } from 'react';
import { ContentItem, ContentType } from '../../types';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { ImageIcon, Film, Code, Youtube } from 'lucide-react';

interface AddContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContentAdd: (content: Omit<ContentItem, 'id'>) => void;
  canvasWidth: number;
  canvasHeight: number;
}

const contentTypeOptions: { type: ContentType; icon: JSX.Element; label: string }[] = [
  { type: 'image', icon: <ImageIcon size={20} />, label: 'Image' },
  { type: 'video', icon: <Film size={20} />, label: 'Video' },
  { type: 'youtube', icon: <Youtube size={20} />, label: 'YouTube' },
  { type: 'canva', icon: <Code size={20} />, label: 'Canva Embed' },
  { type: 'html', icon: <Code size={20} />, label: 'HTML Widget' },
];

const AddContentModal: React.FC<AddContentModalProps> = ({
  isOpen,
  onClose,
  onContentAdd,
  canvasWidth,
  canvasHeight,
}) => {
  const [selectedType, setSelectedType] = useState<ContentType | null>(null);
  const [content, setContent] = useState('');
  const [error, setError] = useState('');

  const reset = () => {
    setSelectedType(null);
    setContent('');
    setError('');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleAdd = () => {
    if (!selectedType) {
      setError('Please select a content type');
      return;
    }

    if (!content.trim()) {
      setError('Please enter content URL or code');
      return;
    }

    // Calculate default position and size
    const defaultWidth = canvasWidth * 0.4;
    const defaultHeight = canvasHeight * 0.3;
    const defaultX = (canvasWidth - defaultWidth) / 2;
    const defaultY = (canvasHeight - defaultHeight) / 2;

    // Create default settings based on content type
    const settings: Record<string, any> = {};
    
    if (selectedType === 'video' || selectedType === 'youtube') {
      settings.autoplay = true;
      settings.loop = true;
    }

    onContentAdd({
      type: selectedType,
      content,
      position: {
        x: defaultX,
        y: defaultY,
        width: defaultWidth,
        height: defaultHeight,
      },
      settings,
    });

    reset();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add Content"
      size="md"
      footer={
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAdd} disabled={!selectedType || !content.trim()}>
            Add to Canvas
          </Button>
        </div>
      }
    >
      <div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Content Type
          </label>
          <div className="grid grid-cols-3 gap-2">
            {contentTypeOptions.map(option => (
              <button
                key={option.type}
                className={`
                  p-3 border rounded-md flex flex-col items-center justify-center
                  transition-colors duration-200
                  ${selectedType === option.type
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:bg-gray-50'
                  }
                `}
                onClick={() => setSelectedType(option.type)}
              >
                {option.icon}
                <span className="mt-1 text-sm">{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        {selectedType && (
          <div className="mb-4">
            <Input
              label={
                selectedType === 'image' || selectedType === 'video'
                  ? 'Content URL'
                  : selectedType === 'youtube'
                  ? 'YouTube Video URL'
                  : selectedType === 'canva'
                  ? 'Canva Embed Code'
                  : 'HTML Code'
              }
              type="text"
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                setError('');
              }}
              placeholder={
                selectedType === 'image'
                  ? 'https://example.com/image.jpg'
                  : selectedType === 'video'
                  ? 'https://example.com/video.mp4'
                  : selectedType === 'youtube'
                  ? 'https://www.youtube.com/watch?v=VIDEO_ID'
                  : selectedType === 'canva'
                  ? '<iframe src="https://www.canva.com/design/..." />'
                  : '<div>Your HTML widget code</div>'
              }
              error={error}
              fullWidth
            />
          </div>
        )}
      </div>
    </Modal>
  );
};

export default AddContentModal;