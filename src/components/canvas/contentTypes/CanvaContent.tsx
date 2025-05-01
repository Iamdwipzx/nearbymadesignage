import React from 'react';
import { ContentItem } from '../../../types';

interface CanvaContentProps {
  content: ContentItem;
}

const CanvaContent: React.FC<CanvaContentProps> = ({ content }) => {
  // Try to extract the iframe from the Canva embed code
  const getCanvaIframe = () => {
    try {
      // Simple regex to extract iframe src
      const srcMatch = content.content.match(/src=["'](https:\/\/www\.canva\.com\/[^"']+)["']/i);
      if (srcMatch && srcMatch[1]) {
        return srcMatch[1];
      }
      
      // If it's already just the URL, use it directly
      if (content.content.startsWith('https://www.canva.com/')) {
        return content.content;
      }
      
      // If we couldn't parse it, use the content as-is
      return content.content;
    } catch (error) {
      console.error('Error parsing Canva embed code:', error);
      return content.content;
    }
  };

  // Get the Canva iframe URL
  const iframeUrl = getCanvaIframe();

  return (
    <div className="w-full h-full">
      {iframeUrl.includes('iframe') ? (
        <div 
          className="w-full h-full" 
          dangerouslySetInnerHTML={{ __html: content.content }} 
        />
      ) : (
        <iframe
          src={iframeUrl}
          className="w-full h-full border-0"
          allowFullScreen
        />
      )}
    </div>
  );
};

export default CanvaContent;