export type User = {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
};

export type AspectRatio = '16:9' | '9:16';

export type Screen = {
  id: string;
  name: string;
  aspectRatio: AspectRatio;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
};

export type ContentType = 'image' | 'video' | 'canva' | 'html' | 'youtube';

export type ContentItem = {
  id: string;
  type: ContentType;
  content: string;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  settings: {
    autoplay?: boolean;
    loop?: boolean;
    [key: string]: any;
  };
};

export type Playlist = {
  id: string;
  name: string;
  screenId: string;
  contents: ContentItem[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  previewUrl?: string;
};