import { supabase } from "@/supabase/supabase";
import { Perfume, Review } from "@/types/perfume";

export const fetchPerfumesWithStats = async (
  filterIds?: string[]
): Promise<Perfume[]> => {
  // Fetch perfumes (optionally filter by IDs)
  let perfumeQuery = supabase.from("perfumes").select("*");
  if (filterIds && filterIds.length > 0) {
    perfumeQuery = perfumeQuery.in("id", filterIds);
  }
  const { data: perfumes, error: perfumeError } = await perfumeQuery;
  if (perfumeError) throw perfumeError;

  // Fetch all reviews
  const { data: reviews, error: reviewError } = await supabase
    .from("reviews")
    .select("id, perfume_id, rating");
  if (reviewError) throw reviewError;

  // Group reviews by perfume_id
  const reviewsByPerfume: Record<
    string,
    { id: string; perfume_id: string; rating: number }[]
  > = {};
  (reviews || []).forEach((review) => {
    if (!reviewsByPerfume[review.perfume_id])
      reviewsByPerfume[review.perfume_id] = [];
    reviewsByPerfume[review.perfume_id].push(review);
  });

  // Attach stats to each perfume
  return (perfumes || []).map((perfume: Perfume) => {
    const perfumeReviews = reviewsByPerfume[perfume.id] || [];
    const reviewCount = perfumeReviews.length;
    const averageRating =
      reviewCount > 0
        ? perfumeReviews.reduce((sum, r) => sum + (r.rating || 0), 0) /
          reviewCount
        : 0;
    return {
      ...perfume,
      averageRating,
      reviewCount,
    };
  });
};
