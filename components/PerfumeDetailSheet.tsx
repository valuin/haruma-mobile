import React, {
  useCallback,
  useEffect,
  useState,
  forwardRef,
  ForwardedRef,
} from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  Button,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetBackdrop,
} from "@gorhom/bottom-sheet";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { useFavoriteStore } from "@/store/useFavoriteStore";
import { Perfume } from "@/types/perfume";
import { supabase } from "@/supabase/supabase";

const REVIEWS_STORAGE_KEY_PREFIX = "@reviews_";

interface ReviewWithUser {
  id: string;
  perfume_id: string;
  user_id: string;
  rating: number;
  review_text: string; 
  created_at: string;
  users?: {
    username: string;
  };
}

interface PerfumeDetailSheetProps {
  perfumeId: string | null;
  snapPoints: string[];
  onDismiss?: () => void;
}

// Fetch perfume details
const fetchPerfumeDetails = async (id: string): Promise<Perfume | null> => {
  try {
    const { data, error } = await supabase
      .from("perfumes")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Supabase error fetching perfume:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error in fetchPerfumeDetails:", error);
    return null;
  }
};

// Fetch reviews with joined user data
const fetchReviews = async (perfumeId: string): Promise<ReviewWithUser[]> => {
  try {
    const { data, error } = await supabase
      .from("reviews")
      .select("*, users(username)")
      .eq("perfume_id", perfumeId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching reviews with users:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return [];
  }
};

// Get locally stored reviews
const getStoredReviews = async (
  perfumeId: string
): Promise<ReviewWithUser[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(
      `${REVIEWS_STORAGE_KEY_PREFIX}${perfumeId}`
    );
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error("Failed to fetch reviews from storage", e);
    return [];
  }
};

// Add a review to local storage
const addStoredReview = async (
  perfumeId: string,
  newReview: ReviewWithUser
) => {
  try {
    const existingReviews = await getStoredReviews(perfumeId);
    const updatedReviews = [newReview, ...existingReviews];
    const jsonValue = JSON.stringify(updatedReviews);
    await AsyncStorage.setItem(
      `${REVIEWS_STORAGE_KEY_PREFIX}${perfumeId}`,
      jsonValue
    );
  } catch (e) {
    console.error("Failed to save review to storage", e);
  }
};

const PerfumeDetailSheet = forwardRef<
  BottomSheetModal,
  PerfumeDetailSheetProps
>(
  (
    { perfumeId, snapPoints, onDismiss },
    ref: ForwardedRef<BottomSheetModal>
  ) => {
    const [perfumeDetails, setPerfumeDetails] = useState<Perfume | null>(null);
    const [reviews, setReviews] = useState<ReviewWithUser[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [newReviewText, setNewReviewText] = useState("");

    const favoriteIds = useFavoriteStore((state) => state.favoriteIds);
    const toggleFavorite = useFavoriteStore((state) => state.toggleFavorite);

    const MY_RATING = 4;

    useEffect(() => {
      if (!perfumeId) return;

      const loadData = async () => {
        setIsLoading(true);
        setError(null);
        setPerfumeDetails(null);
        setReviews([]);
        setNewReviewText("");

        try {
          const [perfume, supabaseReviews, storedReviews] = await Promise.all([
            fetchPerfumeDetails(perfumeId),
            fetchReviews(perfumeId),
            getStoredReviews(perfumeId),
          ]);

          setPerfumeDetails(perfume);

          // Combine reviews, ensuring no duplicates, and sort by date
          const allReviews = [...storedReviews, ...supabaseReviews];
          const uniqueReviews: ReviewWithUser[] = [];
          const seenIds = new Set<string>();

          for (const review of allReviews) {
            if (!seenIds.has(review.id)) {
              uniqueReviews.push(review);
              seenIds.add(review.id);
            }
          }

          uniqueReviews.sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
          );

          setReviews(uniqueReviews);
        } catch (err) {
          console.error("Error fetching data:", err);
          setError("Failed to load details.");
        } finally {
          setIsLoading(false);
        }
      };

      loadData();
    }, [perfumeId]);

    const handleSheetDismiss = useCallback(() => {
      setPerfumeDetails(null);
      setReviews([]);
      setNewReviewText("");
      setError(null);
      setIsLoading(false);
      onDismiss?.();
    }, [onDismiss]);

    const handleReviewSubmit = useCallback(async () => {
      if (!newReviewText.trim() || !perfumeDetails) return;

      const newReview: ReviewWithUser = {
        id: `local_${Date.now()}`,
        perfume_id: perfumeDetails.id,
        user_id: "currentUser",
        rating: MY_RATING,
        review_text: newReviewText.trim(),
        created_at: new Date().toISOString(),
        users: {
          username: "You",
        },
      };

      setReviews((prev) => [newReview, ...prev]);
      setNewReviewText("");

      await addStoredReview(perfumeDetails.id, newReview);
    }, [newReviewText, perfumeDetails]);

    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.5}
          pressBehavior="close"
        />
      ),
      []
    );

    // Calculate stats from reviews
    const reviewCount = reviews.length;
    const averageRating =
      reviewCount > 0
        ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviewCount
        : 0;

    return (
      <BottomSheetModal
        ref={ref}
        index={0}
        snapPoints={snapPoints}
        onDismiss={handleSheetDismiss}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: "#fff" }}
      >
        <BottomSheetScrollView
          contentContainerStyle={styles.sheetContentContainer}
        >
          {isLoading ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.loadingText}>Loading perfume details...</Text>
            </View>
          ) : error ? (
            <View style={styles.centerContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <Text style={styles.errorSubtext}>Please try again later</Text>
            </View>
          ) : perfumeDetails ? (
            <>
              <TouchableOpacity
                style={styles.favoriteButton}
                onPress={() => toggleFavorite(perfumeDetails.id)}
              >
                <Ionicons
                  name={
                    favoriteIds.has(perfumeDetails.id)
                      ? "heart"
                      : "heart-outline"
                  }
                  size={28}
                  color={Colors.primary}
                />
              </TouchableOpacity>

              <Image
                source={{ uri: perfumeDetails.image_url }}
                style={styles.sheetImage}
              />
              <Text style={styles.sheetName}>{perfumeDetails.name}</Text>
              <Text style={styles.sheetBrand}>{perfumeDetails.brand}</Text>
              <Text style={styles.sheetDetails}>
                Rating: {averageRating.toFixed(1)} ({reviewCount} reviews)
              </Text>
              {perfumeDetails.description && (
                <Text style={styles.sheetDetails}>
                  {perfumeDetails.description}
                </Text>
              )}
              {perfumeDetails.notes && perfumeDetails.notes.length > 0 && (
                <Text style={styles.sheetDetails}>
                  Notes: {perfumeDetails.notes.join(", ")}
                </Text>
              )}

              <View style={styles.reviewsSection}>
                <Text style={styles.reviewsTitle}>Reviews</Text>

                <View style={styles.addReviewContainer}>
                  <TextInput
                    style={styles.reviewInput}
                    placeholder="Write your review..."
                    value={newReviewText}
                    onChangeText={setNewReviewText}
                    multiline
                  />
                  <Button
                    title="Submit Review"
                    onPress={handleReviewSubmit}
                    disabled={newReviewText.trim() === ""}
                    color={Colors.primary}
                  />
                </View>

                {reviews.length === 0 ? (
                  <Text style={styles.noReviewsText}>No reviews yet.</Text>
                ) : (
                  <View>
                    {reviews.map((item) => (
                      <View key={item.id} style={styles.reviewItem}>
                        <View style={styles.reviewHeader}>
                          <Text style={styles.reviewAuthor}>
                            {item.users?.username ?? `User ${item.user_id}`}
                          </Text>
                          <View style={styles.reviewRating}>
                            {[...Array(5)].map((_, i) => (
                              <Ionicons
                                key={i}
                                name={i < item.rating ? "star" : "star-outline"}
                                size={14}
                                color={
                                  i < item.rating
                                    ? Colors.primary
                                    : Colors.secondary
                                }
                                style={{ marginRight: 2 }}
                              />
                            ))}
                          </View>
                        </View>
                        <Text style={styles.reviewText}>{item.review_text}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </>
          ) : null}
        </BottomSheetScrollView>
      </BottomSheetModal>
    );
  }
);

PerfumeDetailSheet.displayName = "PerfumeDetailSheet";

const styles = StyleSheet.create({
  sheetContentContainer: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 50,
  },
  centerContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50,
  },
  loadingText: {
    fontSize: 16,
    color: "#6b7280",
    marginTop: 10,
  },
  errorText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ef4444",
    textAlign: "center",
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
  },
  sheetImage: {
    width: 120,
    height: 120,
    borderRadius: 10,
    marginBottom: 15,
  },
  sheetName: {
    fontSize: 22,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 4,
    textAlign: "center",
  },
  sheetBrand: {
    fontSize: 16,
    color: Colors.text,
    marginBottom: 12,
    textAlign: "center",
  },
  sheetDetails: {
    fontSize: 15,
    color: Colors.text,
    marginBottom: 8,
    textAlign: "center",
    paddingHorizontal: 10,
  },
  favoriteButton: {
    position: "absolute",
    top: 15,
    right: 20,
    zIndex: 1,
    padding: 5,
  },
  reviewsSection: {
    marginTop: 20,
    width: "100%",
    borderTopWidth: 1,
    borderTopColor: Colors.secondary,
    paddingTop: 15,
  },
  reviewsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 15,
    textAlign: "center",
  },
  addReviewContainer: {
    marginBottom: 20,
    width: "100%",
  },
  reviewInput: {
    borderWidth: 1,
    borderColor: Colors.secondary,
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    minHeight: 60,
    textAlignVertical: "top",
    fontSize: 14,
  },
  reviewItem: {
    backgroundColor: Colors.background,
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.secondary,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  reviewAuthor: {
    fontWeight: "bold",
    color: Colors.text,
    fontSize: 15,
  },
  reviewRating: {
    flexDirection: "row",
  },
  reviewText: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 18,
  },
  noReviewsText: {
    textAlign: "center",
    color: Colors.text,
    marginTop: 10,
  },
});

export default PerfumeDetailSheet;
