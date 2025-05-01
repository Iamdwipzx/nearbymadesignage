import React from 'react';
import { ContentItem } from '../../../types';

interface VideoContentProps {
  content: ContentItem;
}

const VideoContent: React.FC<VideoContentProps> = ({ content }) => {
  return (
    <div className="w-full h-full">
      <video
        src={content.content}
        className="w-full h-full object-cover"
        autoPlay={content.settings.autoplay}
        loop={content.settings.loop}
        muted
        playsInline
        controls={!content.settings.autoplay}
      />
    </div>
  );
};

export default VideoContent;