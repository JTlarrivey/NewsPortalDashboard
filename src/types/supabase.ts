export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      articles: {
        Row: {
          id: string;
          created_at: string;
          title: string;
          excerpt: string;
          content: string;
          image_url: string[];
          category: string;
          author_id: string | null;
          read_time: string;
          video_url: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          title: string;
          excerpt: string;
          content: string;
          image_url: string[];
          category: string;
          author_id?: string | null;
          read_time: string;
          video_url?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          title?: string;
          excerpt?: string;
          content?: string;
          image_url?: string[];
          category?: string;
          author_id?: string | null;
          read_time?: string;
          video_url?: string | null;
        };
      };
    };
  };
}
