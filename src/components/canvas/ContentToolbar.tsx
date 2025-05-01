import React from 'react';
import { ContentItem } from '../../types';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { Trash2, ArrowUp, ArrowDown } from 'lucide-react';

interface ContentToolbarProps {
  content: ContentItem;
  onUpdate: (data: Partial<ContentItem>) => void;
  onDelete: () => void;
  onBringToFront: () => void;
  onSendToBack: () => void;
}

const ContentToolbar: React.FC<ContentToolbarProps> = ({
  content,
  onUpdate,
  onDelete,
  onBringToFront,
  onSendToBack,
}) => {
  const handleSettingsChange = (key: string, value: any) => {
    onUpdate({
      settings: {
        ...content.settings,
        [key]: value,
      },
    });
  };

  const renderContentTypeSettings = () => {
    switch (content.type) {
      case 'video':
      case 'youtube':
        return (
          <>
            <div className="flex items-center justify-between mb-4">
              <label className="text-sm font-medium text-gray-700">Autoplay</label>
              <input
                type="checkbox"
                checked={content.settings.autoplay || false}
                onChange={(e) => handleSettingsChange('autoplay', e.target.checked)}
                className="rounded text-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center justify-between mb-4">
              <label className="text-sm font-medium text-gray-700">Loop</label>
              <input
                type="checkbox"
                checked={content.settings.loop || false}
                onChange={(e) => handleSettingsChange('loop', e.target.checked)}
                className="rounded text-blue-500 focus:ring-blue-500"
              />
            </div>
            {content.type === 'youtube' && (
              <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-medium text-gray-700">Mute</label>
                <input
                  type="checkbox"
                  checked={content.settings.mute || false}
                  onChange={(e) => handleSettingsChange('mute', e.target.checked)}
                  className="rounded text-blue-500 focus:ring-blue-500"
                />
              </div>
            )}
          </>
        );
      
      case 'image':
        return (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Alt Text
            </label>
            <Input
              type="text"
              fullWidth
              value={content.settings.alt || ''}
              onChange={(e) => handleSettingsChange('alt', e.target.value)}
              placeholder="Image description"
            />
          </div>
        );
      
      case 'html':
        return (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Background Color
            </label>
            <Input
              type="color"
              fullWidth
              value={content.settings.backgroundColor || '#ffffff'}
              onChange={(e) => handleSettingsChange('backgroundColor', e.target.value)}
            />
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium capitalize">{content.type} Settings</h3>
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            icon={<ArrowUp size={16} />}
            onClick={onBringToFront}
            title="Bring to Front"
          />
          <Button
            variant="ghost"
            icon={<ArrowDown size={16} />}
            onClick={onSendToBack}
            title="Send to Back"
          />
          <Button
            variant="ghost"
            icon={<Trash2 size={16} className="text-red-500" />}
            onClick={onDelete}
            className="text-red-500 hover:bg-red-50"
          />
        </div>
      </div>
      
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-1">Position</h4>
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="number"
            label="X"
            value={content.position.x}
            onChange={(e) => onUpdate({
              position: {
                ...content.position,
                x: parseInt(e.target.value) || 0,
              },
            })}
          />
          <Input
            type="number"
            label="Y"
            value={content.position.y}
            onChange={(e) => onUpdate({
              position: {
                ...content.position,
                y: parseInt(e.target.value) || 0,
              },
            })}
          />
        </div>
      </div>
      
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-1">Size</h4>
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="number"
            label="Width"
            value={content.position.width}
            onChange={(e) => onUpdate({
              position: {
                ...content.position,
                width: parseInt(e.target.value) || 0,
              },
            })}
          />
          <Input
            type="number"
            label="Height"
            value={content.position.height}
            onChange={(e) => onUpdate({
              position: {
                ...content.position,
                height: parseInt(e.target.value) || 0,
              },
            })}
          />
        </div>
      </div>
      
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-1">Content</h4>
        <Input
          type="text"
          fullWidth
          value={content.content}
          onChange={(e) => onUpdate({ content: e.target.value })}
          placeholder={`${content.type} content URL or code`}
        />
      </div>
      
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-1">Settings</h4>
        {renderContentTypeSettings()}
      </div>
    </div>
  );
};

export default ContentToolbar;