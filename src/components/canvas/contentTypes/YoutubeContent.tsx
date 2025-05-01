import React from 'react';
import { ContentItem } from '../../../types';

interface YoutubeContentProps {
  content: ContentItem;
}

// Helper to extract YouTube video ID from various URL formats
const getYoutubeId = (url: string): string | null => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

const YoutubeContent: React.FC<YoutubeContentProps> = ({ content }) => {
  const videoId = getYoutubeId(content.content);
  
  if (!videoId) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500">
        Invalid YouTube URL
      </div>
    );
  }
  
  // Construct embed URL with parameters
  const embedUrl = `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1${
    content.settings.autoplay ? '&autoplay=1' : ''
  }${content.settings.loop ? '&loop=1&playlist=' + videoId : ''}${
    content.settings.mute ? '&mute=1' : ''
  }`;

  return (
    <div className="w-full h-full">
      <iframe
        src={embedUrl}
        className="w-full h-full border-0"
        allowFullScreen
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      />
    </div>
  );
};

export default YoutubeContent;