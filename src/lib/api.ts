import { supabase } from "./supabase";
import type {
  Article,
  DashboardStats,
  TickerItem,
  CarouselItem,
} from "../types";

// Tipo para arreglar el error de "title" en métricas
type ArticleMetricWithArticle = {
  views: number;
  articles: {
    id: string;
    title: string;
  };
};

// User Management
export async function searchUsers(searchTerm: string) {
  const { data, error } = await supabase
    .from("users")
    .select("id, email, is_admin")
    .ilike("email", `%${searchTerm}%`)
    .limit(10);

  if (error) throw error;
  return data;
}

export async function toggleAdminStatus(userId: string, isAdmin: boolean) {
  const { data, error } = await supabase.rpc("toggle_admin_status", {
    user_id: userId,
    new_status: isAdmin,
  });

  if (error) throw error;
  return data;
}

// Dashboard Statistics
export async function fetchStats(): Promise<DashboardStats> {
  const [
    { count: totalArticles },
    { count: totalAuthors },
    { count: activeTickerItems },
    { count: activeCarouselItems },
    metricsResult,
  ] = await Promise.all([
    supabase.from("articles").select("*", { count: "exact", head: true }),
    supabase
      .from("articles")
      .select("author_id", { count: "exact", head: true })
      .not("author_id", "is", null),
    supabase
      .from("ticker_items")
      .select("*", { count: "exact", head: true })
      .eq("active", true),
    supabase
      .from("carousel_items")
      .select("*", { count: "exact", head: true })
      .eq("active", true),
    supabase
      .from("article_metrics")
      .select(
        `
        views,
        articles!inner (
          id,
          title
        )
      `
      )
      .order("views", { ascending: false })
      .limit(5),
  ]);

  const rawMetricsData = metricsResult.data;

  const metricsData = (
    Array.isArray(rawMetricsData)
      ? rawMetricsData.map((m) => ({
          views: m.views,
          articles: Array.isArray(m.articles) ? m.articles[0] : m.articles,
        }))
      : []
  ) as ArticleMetricWithArticle[];

  const totalViews =
    metricsData?.reduce((sum, metric) => sum + (metric.views || 0), 0) || 0;

  const visitedNews =
    metricsData?.map((metric) => ({
      title: metric.articles?.title || "",
      views: metric.views || 0,
    })) || [];

  return {
    totalArticles: totalArticles || 0,
    totalAuthors: totalAuthors || 0,
    activeTickerItems: activeTickerItems || 0,
    activeCarouselItems: activeCarouselItems || 0,
    totalViews,
    visitedNews,
  };
}

// Article Management
export async function fetchArticles() {
  const { data, error } = await supabase
    .from("articles")
    .select(
      `
      *,
      article_metrics(views),
      users!articles_author_id_fkey(email)
    `
    )
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function createArticle(article: Partial<Article>) {
  const { data, error } = await supabase
    .from("articles")
    .insert([
      { ...article, author_id: (await supabase.auth.getUser()).data.user?.id },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateArticle(id: string, updates: Partial<Article>) {
  const { data, error } = await supabase
    .from("articles")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteArticle(id: string) {
  const { error } = await supabase.from("articles").delete().eq("id", id);

  if (error) throw error;
  return true;
}

export async function incrementArticleViews(articleId: string) {
  const { error } = await supabase.rpc("increment_article_views", {
    article_id_param: articleId,
  });

  if (error) throw error;
  return true;
}

// Ticker Management
export async function fetchTickerItems(): Promise<TickerItem[]> {
  const { data, error } = await supabase
    .from("ticker_items")
    .select("*")
    .eq("active", true)
    .order("order");

  if (error) throw error;
  return data;
}

export async function updateTickerItems(items: Omit<TickerItem, "id">[]) {
  // First, deactivate all current items
  await supabase
    .from("ticker_items")
    .update({ active: false })
    .neq("id", "00000000-0000-0000-0000-000000000000");

  // Then insert new items
  const { data, error } = await supabase
    .from("ticker_items")
    .insert(items)
    .select();

  if (error) throw error;
  return data;
}

// Carousel Management
export async function fetchCarouselItems(): Promise<CarouselItem[]> {
  const { data, error } = await supabase
    .from("carousel_items")
    .select("*, articles(*)")
    .eq("active", true)
    .order("order");

  if (error) throw error;
  return data;
}

export async function updateCarouselItems(items: Omit<CarouselItem, "id">[]) {
  // First, deactivate all current items
  await supabase
    .from("carousel_items")
    .update({ active: false })
    .neq("id", "00000000-0000-0000-0000-000000000000");

  // Then insert new items
  const { data, error } = await supabase
    .from("carousel_items")
    .insert(items)
    .select();

  if (error) throw error;
  return data;
}
