import React from 'react';
import { ContentItem } from '../../../types';

interface HtmlContentProps {
  content: ContentItem;
}

const HtmlContent: React.FC<HtmlContentProps> = ({ content }) => {
  return (
    <div 
      className="w-full h-full overflow-hidden"
      style={{ 
        backgroundColor: content.settings.backgroundColor || 'transparent',
      }}
    >
      <iframe
        srcDoc={content.content}
        className="w-full h-full border-0"
        sandbox="allow-scripts allow-same-origin"
      />
    </div>
  );
};

export default HtmlContent;