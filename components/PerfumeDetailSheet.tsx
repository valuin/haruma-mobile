import React, { useCallback, useEffect, useState, forwardRef } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  Button,
  Platform,
} from "react-native";
import {
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetBackdrop,
} from "@gorhom/bottom-sheet";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { useFavoriteStore } from "@/store/useFavoriteStore";
import { Perfume, Review } from "@/types/perfume";
import { supabase } from "@/supabase/supabase";

// --- Dummy Reviews Data (you can replace this with Supabase data later) ---
const DUMMY_REVIEWS: Review[] = [
  {
    id: "r1",
    perfumeId: "",
    userId: "user1",
    rating: 5,
    comment: "Absolutely stunning fragrance! Lasts all day.",
    createdAt: new Date().toISOString(),
  },
  {
    id: "r2", 
    perfumeId: "",
    userId: "user2",
    rating: 4,
    comment: "Very nice, a bit strong initially.",
    createdAt: new Date().toISOString(),
  },
  {
    id: "r3",
    perfumeId: "",
    userId: "user3", 
    rating: 5,
    comment: "My new signature scent. Highly recommend.",
    createdAt: new Date().toISOString(),
  },
];

// Fetch perfume details from Supabase
const fetchPerfumeDetails = async (id: string): Promise<Perfume | null> => {
  try {
    console.log("Fetching perfume details for ID:", id);
    
    const { data, error } = await supabase
      .from('perfumes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Supabase error fetching perfume:', error);
      throw error;
    }

    console.log("Fetched perfume data:", data);
    return data;
  } catch (error) {
    console.error("Error in fetchPerfumeDetails:", error);
    return null;
  }
};

// Fetch reviews from Supabase (optional - you can implement this later)
const fetchReviews = async (perfumeId: string): Promise<Review[]> => {
  try {
    // Uncomment this when you have a reviews table
    /*
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('perfumeId', perfumeId)
      .order('createdAt', { ascending: false });

    if (error) {
      console.error('Error fetching reviews:', error);
      return [];
    }

    return data || [];
    */
    
    // For now, return dummy reviews
    return DUMMY_REVIEWS.map(review => ({ ...review, perfumeId }));
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return [];
  }
};

interface PerfumeDetailSheetProps {
  perfumeId: string | null;
  snapPoints: string[];
  onDismiss?: () => void;
}

const PerfumeDetailSheet = forwardRef<
  BottomSheetModal,
  PerfumeDetailSheetProps
>(({ perfumeId, snapPoints, onDismiss }, ref) => {
  const [perfumeDetails, setPerfumeDetails] = useState<Perfume | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReviewText, setNewReviewText] = useState("");
  const MY_RATING = 4;

  const favoriteIds = useFavoriteStore((state) => state.favoriteIds);
  const toggleFavorite = useFavoriteStore((state) => state.toggleFavorite);

  useEffect(() => {
    if (perfumeId) {
      setIsLoading(true);
      setError(null);
      setPerfumeDetails(null);
      setReviews([]);
      setNewReviewText("");

      // Fetch both perfume details and reviews
      Promise.all([
        fetchPerfumeDetails(perfumeId), 
        fetchReviews(perfumeId)
      ])
        .then(([perfumeData, reviewsData]) => {
          if (perfumeData) {
            setPerfumeDetails(perfumeData);
            setReviews(reviewsData);
          } else {
            setError("Perfume details not found.");
          }
        })
        .catch((err) => {
          console.error("Error fetching data:", err);
          setError("Failed to load details.");
        })
        .finally(() => setIsLoading(false));
    } else {
      // Reset state when no perfume is selected
      setPerfumeDetails(null);
      setIsLoading(false);
      setError(null);
      setReviews([]);
      setNewReviewText("");
    }
  }, [perfumeId]);

  const handleSheetDismiss = useCallback(() => {
    setPerfumeDetails(null);
    setIsLoading(false);
    setError(null);
    setReviews([]);
    setNewReviewText("");
    onDismiss?.();
  }, [onDismiss]);

  const handleReviewSubmit = useCallback(() => {
    if (newReviewText.trim() === "" || !perfumeDetails) {
      return;
    }

    const newReview: Review = {
      id: `myReview_${Date.now()}`,
      perfumeId: perfumeDetails.id,
      userId: "currentUser", // Replace with actual user ID
      rating: MY_RATING,
      comment: newReviewText.trim(),
      createdAt: new Date().toISOString(),
    };

    setReviews((prevReviews) => [newReview, ...prevReviews]);
    setNewReviewText("");

    // TODO: Save to Supabase
    // saveReviewToSupabase(newReview);
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

  return (
    <BottomSheetModal
      ref={ref}
      index={0}
      snapPoints={snapPoints}
      enableDynamicSizing={false}
      onDismiss={handleSheetDismiss}
      enablePanDownToClose={true}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: "#ffffff" }}
    >
      <BottomSheetScrollView
        contentContainerStyle={styles.sheetContentContainer}
      >
        {isLoading && (
          <View style={styles.centerContainer}>
            <ActivityIndicator
              size="large"
              color={Colors.primary}
              style={styles.loader}
            />
            <Text style={styles.loadingText}>Loading perfume details...</Text>
          </View>
        )}

        {!isLoading && error && (
          <View style={styles.centerContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <Text style={styles.errorSubtext}>Please try again later</Text>
          </View>
        )}

        {!isLoading && perfumeDetails && (
          <>
            {/* --- Favorite Button --- */}
            <TouchableOpacity
              style={styles.favoriteButton}
              onPress={() => toggleFavorite(perfumeDetails.id)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name={
                  favoriteIds.has(perfumeDetails.id) ? "heart" : "heart-outline"
                }
                size={28}
                color={Colors.primary}
              />
            </TouchableOpacity>

            {/* --- Perfume Details --- */}
            <Image
              source={{ uri: perfumeDetails.imageUrl }}
              style={styles.sheetImage}
            />
            <Text style={styles.sheetName}>{perfumeDetails.name}</Text>
            <Text style={styles.sheetBrand}>{perfumeDetails.brand}</Text>
            <Text style={styles.sheetDetails}>
              Rating: {perfumeDetails.averageRating.toFixed(1)} (
              {perfumeDetails.reviewCount} reviews)
            </Text>
            
            {/* Show description if available */}
            {perfumeDetails.description && (
              <Text style={styles.sheetDetails}>
                {perfumeDetails.description}
              </Text>
            )}

            {/* Show notes if available */}
            {perfumeDetails.notes && perfumeDetails.notes.length > 0 && (
              <Text style={styles.sheetDetails}>
                Notes: {perfumeDetails.notes.join(", ")}
              </Text>
            )}

            {/* --- Reviews Section --- */}
            <View style={styles.reviewsSection}>
              <Text style={styles.reviewsTitle}>Reviews</Text>

              {/* --- Add Review Form --- */}
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

              {/* --- Render Reviews --- */}
              {reviews.length === 0 ? (
                <Text style={styles.noReviewsText}>No reviews yet.</Text>
              ) : (
                reviews.map((item) => (
                  <View key={item.id} style={styles.reviewItem}>
                    <View style={styles.reviewHeader}>
                      <Text style={styles.reviewAuthor}>
                        {item.userId === "currentUser" ? "You" : `User ${item.userId}`}
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
                    <Text style={styles.reviewText}>{item.comment}</Text>
                  </View>
                ))
              )}
            </View>
          </>
        )}
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
});

const styles = StyleSheet.create({
  sheetContentContainer: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 50,
    position: "relative",
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 50,
  },
  loader: {
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
    color: "#6b7280",
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: "#ef4444",
    textAlign: 'center',
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: 'center',
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