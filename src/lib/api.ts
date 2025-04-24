import { supabase } from "./supabase";
import type {
  Article,
  DashboardStats,
  TickerItem,
  CarouselItem,
} from "../types";

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
    { data: metricsData },
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

  const totalViews =
    metricsData?.reduce((sum, metric) => sum + (metric.views || 0), 0) || 0;

  const visitedNews =
    metricsData?.map((metric) => ({
      title: metric.articles?.[0]?.title || "",
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
  const { data: articles, error: articlesError } = await supabase
    .from("articles")
    .select("*")
    .order("created_at", { ascending: false });

  if (articlesError) throw articlesError;

  // Fetch metrics separately
  const { data: metrics, error: metricsError } = await supabase
    .from("article_metrics")
    .select("article_id, views");

  if (metricsError) throw metricsError;

  // Create a map of article_id to views
  const metricsMap = new Map(
    metrics?.map((m) => [m.article_id, m.views]) || []
  );

  // Combine articles with their metrics
  return articles?.map((article) => ({
    ...article,
    article_metrics: [{ views: metricsMap.get(article.id) || 0 }],
  }));
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
  try {
    // First verify the article exists
    const { data: existingArticle, error: checkError } = await supabase
      .from("articles")
      .select("id")
      .eq("id", id)
      .maybeSingle();

    if (checkError) throw checkError;
    if (!existingArticle) throw new Error("Artículo no encontrado");

    // Remove non-column fields from updates
    const { article_metrics, users, ...articleUpdates } = updates;

    // Perform the update
    const { data, error } = await supabase
      .from("articles")
      .update(articleUpdates)
      .eq("id", id)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error("Error al actualizar el artículo");

    // Get the current metrics
    const { data: metrics } = await supabase
      .from("article_metrics")
      .select("views")
      .eq("article_id", id)
      .maybeSingle();

    return {
      ...data,
      article_metrics: [{ views: metrics?.views || 0 }],
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Error al actualizar el artículo: ${errorMessage}`);
  }
}

export async function deleteArticle(id: string) {
  try {
    // First verify the article exists
    const { data: existingArticle, error: checkError } = await supabase
      .from("articles")
      .select("id")
      .eq("id", id)
      .maybeSingle();

    if (checkError) throw checkError;
    if (!existingArticle) throw new Error("Artículo no encontrado");

    // Delete the article
    const { error } = await supabase.from("articles").delete().eq("id", id);

    if (error) throw error;
    return true;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Error al eliminar el artículo: ${errorMessage}`);
  }
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
