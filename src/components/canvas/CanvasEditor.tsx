import React, { useState } from 'react';
import { Rnd } from 'react-rnd';
import { ContentItem, AspectRatio, ContentType } from '../../types';
import { ImageIcon, Film, Code, Youtube, Maximize2 } from 'lucide-react';
import Button from '../ui/Button';
import ContentToolbar from './ContentToolbar';
import ImageContent from './contentTypes/ImageContent';
import VideoContent from './contentTypes/VideoContent';
import CanvaContent from './contentTypes/CanvaContent';
import HtmlContent from './contentTypes/HtmlContent';
import YoutubeContent from './contentTypes/YoutubeContent';
import AddContentModal from './AddContentModal';

interface CanvasEditorProps {
  aspectRatio: AspectRatio;
  contents: ContentItem[];
  onSave: (contents: ContentItem[]) => void;
}

const CanvasEditor: React.FC<CanvasEditorProps> = ({
  aspectRatio,
  contents,
  onSave,
}) => {
  const [editableContents, setEditableContents] = useState<ContentItem[]>(contents);
  const [selectedContentId, setSelectedContentId] = useState<string | null>(null);
  const [showAddContentModal, setShowAddContentModal] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Canvas dimensions
  const canvasWidth = 1000;
  const canvasHeight = aspectRatio === '16:9' ? Math.round(canvasWidth * (9/16)) : Math.round(canvasWidth * (16/9));

  const getSelectedContent = () => {
    return editableContents.find(content => content.id === selectedContentId) || null;
  };

  const handleContentUpdate = (contentId: string, data: Partial<ContentItem>) => {
    setEditableContents(prev => 
      prev.map(content => 
        content.id === contentId ? { ...content, ...data } : content
      )
    );
  };

  const handleContentDelete = (contentId: string) => {
    setEditableContents(prev => prev.filter(content => content.id !== contentId));
    if (selectedContentId === contentId) {
      setSelectedContentId(null);
    }
  };

  const handleContentAdd = (contentItem: Omit<ContentItem, 'id'>) => {
    const newContent: ContentItem = {
      ...contentItem,
      id: `content-${Date.now()}`,
    };
    
    setEditableContents(prev => [...prev, newContent]);
    setSelectedContentId(newContent.id);
    setShowAddContentModal(false);
  };

  const handleBringToFront = (contentId: string) => {
    setEditableContents(prev => {
      const content = prev.find(c => c.id === contentId);
      if (!content) return prev;
      return [...prev.filter(c => c.id !== contentId), content];
    });
  };

  const handleSendToBack = (contentId: string) => {
    setEditableContents(prev => {
      const content = prev.find(c => c.id === contentId);
      if (!content) return prev;
      return [content, ...prev.filter(c => c.id !== contentId)];
    });
  };

  const toggleFullscreen = () => {
    const element = document.getElementById('canvas-container');
    if (!element) return;

    if (!isFullscreen) {
      if (element.requestFullscreen) {
        element.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  const renderContentItem = (content: ContentItem) => {
    switch (content.type) {
      case 'image':
        return <ImageContent content={content} />;
      case 'video':
        return <VideoContent content={content} />;
      case 'canva':
        return <CanvaContent content={content} />;
      case 'html':
        return <HtmlContent content={content} />;
      case 'youtube':
        return <YoutubeContent content={content} />;
      default:
        return <div>Unsupported content type</div>;
    }
  };

  const getContentIcon = (type: ContentType) => {
    switch (type) {
      case 'image':
        return <ImageIcon size={16} />;
      case 'video':
      case 'youtube':
        return <Film size={16} />;
      case 'canva':
      case 'html':
        return <Code size={16} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white p-4 border-b mb-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold">Canvas Editor <span className="text-sm text-gray-500 ml-2">({aspectRatio})</span></h2>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            icon={<Maximize2 size={16} />}
            onClick={toggleFullscreen}
          >
            {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAddContentModal(true)}
          >
            Add Content
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              // Round all position values before saving
              const roundedContents = editableContents.map(content => ({
                ...content,
                position: {
                  x: Math.round(content.position.x),
                  y: Math.round(content.position.y),
                  width: Math.round(content.position.width),
                  height: Math.round(content.position.height),
                },
              }));
              onSave(roundedContents);
            }}
          >
            Save Changes
          </Button>
        </div>
      </div>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Canvas Area */}
        <div id="canvas-container" className="flex-1 overflow-auto bg-gray-200 p-4">
          <div 
            className="bg-white shadow-lg mx-auto relative"
            style={{
              width: canvasWidth,
              height: canvasHeight,
              minHeight: canvasHeight,
            }}
          >
            {editableContents.map((content) => (
              <Rnd
                key={content.id}
                default={{
                  x: content.position.x,
                  y: content.position.y,
                  width: content.position.width,
                  height: content.position.height,
                }}
                bounds="parent"
                onDragStop={(e, d) => {
                  handleContentUpdate(content.id, {
                    position: {
                      ...content.position,
                      x: Math.round(d.x),
                      y: Math.round(d.y),
                    },
                  });
                }}
                onResizeStop={(e, direction, ref, delta, position) => {
                  handleContentUpdate(content.id, {
                    position: {
                      x: Math.round(position.x),
                      y: Math.round(position.y),
                      width: Math.round(parseInt(ref.style.width)),
                      height: Math.round(parseInt(ref.style.height)),
                    },
                  });
                }}
                className={`${
                  selectedContentId === content.id
                    ? 'ring-2 ring-blue-500'
                    : 'hover:ring-2 hover:ring-gray-400'
                }`}
                onClick={() => setSelectedContentId(content.id)}
              >
                <div className="h-full w-full overflow-hidden">
                  {/* Content type indicator */}
                  <div className="absolute top-0 left-0 bg-gray-800 text-white text-xs px-2 py-1 z-10 flex items-center">
                    {getContentIcon(content.type)}
                    <span className="ml-1 capitalize">{content.type}</span>
                  </div>
                  {renderContentItem(content)}
                </div>
              </Rnd>
            ))}
          </div>
        </div>
        
        {/* Properties Panel */}
        <div className="w-80 bg-white border-l overflow-y-auto">
          {selectedContentId ? (
            <ContentToolbar
              content={getSelectedContent()!}
              onUpdate={(data) => handleContentUpdate(selectedContentId, data)}
              onDelete={() => handleContentDelete(selectedContentId)}
              onBringToFront={() => handleBringToFront(selectedContentId)}
              onSendToBack={() => handleSendToBack(selectedContentId)}
            />
          ) : (
            <div className="p-4 text-center text-gray-500">
              <p>Select an item to edit its properties</p>
              <p className="mt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowAddContentModal(true)}
                >
                  Add Content
                </Button>
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* Add Content Modal */}
      <AddContentModal
        isOpen={showAddContentModal}
        onClose={() => setShowAddContentModal(false)}
        onContentAdd={handleContentAdd}
        canvasWidth={canvasWidth}
        canvasHeight={canvasHeight}
      />
    </div>
  );
};

export default CanvasEditor;