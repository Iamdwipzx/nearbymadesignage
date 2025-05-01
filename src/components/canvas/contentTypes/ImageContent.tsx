import React from 'react';
import { ContentItem } from '../../../types';

interface ImageContentProps {
  content: ContentItem;
}

const ImageContent: React.FC<ImageContentProps> = ({ content }) => {
  return (
    <div className="w-full h-full">
      <img 
        src={content.content} 
        alt={content.settings.alt || 'Image content'} 
        className="w-full h-full object-cover"
      />
    </div>
  );
};

export default ImageContent;