export interface Article {
  id: string;
  created_at: string;
  title: string;
  excerpt: string;
  content: string;
  image_url: string[];
  category: string;
  author_id: string | null;
  author_name: string;
  read_time: string;
  video_url?: string;
  article_metrics?: Array<{ views: number }>;
  users?: {
    email: string;
  };
}

export interface DashboardStats {
  totalArticles: number;
  totalAuthors: number;
  activeTickerItems: number;
  activeCarouselItems: number;
  totalViews: number;
  visitedNews: Array<{
    title: string;
    views: number;
  }>;
}

export interface TickerItem {
  id: string;
  text: string;
  link: string;
  active: boolean;
  order: number;
  created_at?: string;
}

export interface CarouselItem {
  id: string;
  article_id: string;
  active: boolean;
  order: number;
  created_at?: string;
}

export interface Database {
  public: {
    Tables: {
      articles: {
        Row: Article;
        Insert: Omit<Article, "id" | "created_at">;
        Update: Partial<Omit<Article, "id" | "created_at">>;
      };
      ticker_items: {
        Row: TickerItem;
        Insert: Omit<TickerItem, "id" | "created_at">;
        Update: Partial<Omit<TickerItem, "id" | "created_at">>;
      };
      carousel_items: {
        Row: CarouselItem;
        Insert: Omit<CarouselItem, "id" | "created_at">;
        Update: Partial<Omit<CarouselItem, "id" | "created_at">>;
      };
    };
  };
}
