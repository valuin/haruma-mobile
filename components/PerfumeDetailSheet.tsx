import React, { useCallback, useEffect, useState, forwardRef } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  FlatList, // Keep FlatList
  Button,
  // ScrollView, // No longer needed here
} from "react-native";
import {
  BottomSheetModal,
  BottomSheetView, // Use BottomSheetView instead of ScrollView
  BottomSheetBackdrop,
  BottomSheetScrollView, // Remove BottomSheetScrollView
} from "@gorhom/bottom-sheet";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import SAMPLE_PERFUMES from "@/constants/PerfumeData";
import { useFavoriteStore } from "@/store/useFavoriteStore";
import { Perfume } from "./PerfumeCard";

// --- Define Review Type ---
interface Review {
  id: string;
  author: string;
  rating: number;
  text: string;
}
const DUMMY_REVIEWS: Review[] = [
  {
    id: "r1",
    author: "Alice",
    rating: 5,
    text: "Absolutely stunning fragrance! Lasts all day.",
  },
  {
    id: "r2",
    author: "Bob",
    rating: 4,
    text: "Very nice, a bit strong initially.",
  },
  {
    id: "r3",
    author: "Charlie",
    rating: 5,
    text: "My new signature scent. Highly recommend.",
  },
];
// --- End Dummy Reviews Data ---

// Replicate or import the fetch function
const fetchPerfumeDetails = async (id: string): Promise<Perfume | null> => {
  console.log("Fetching details for ID:", id);
  await new Promise((resolve) => setTimeout(resolve, 1)); // Simulate network delay
  const perfumeData = SAMPLE_PERFUMES.find((p) => p.id === id);
  return perfumeData || null;
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
      fetchPerfumeDetails(perfumeId)
        .then((data) => {
          if (data) {
            setPerfumeDetails(data);
            setReviews(DUMMY_REVIEWS);
          } else {
            setError("Perfume details not found.");
          }
        })
        .catch((err) => {
          console.error("Error fetching perfume details:", err);
          setError("Failed to load details.");
        })
        .finally(() => setIsLoading(false));
    } else {
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
    if (newReviewText.trim() === "") {
      return;
    }
    const newReview: Review = {
      id: `myReview_${Date.now()}`,
      author: "You",
      rating: MY_RATING,
      text: newReviewText.trim(),
    };
    setReviews((prevReviews) => [newReview, ...prevReviews]);
    setNewReviewText("");
  }, [newReviewText]);

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

  const renderReviewItem = ({ item }: { item: Review }) => (
    <View style={styles.reviewItem}>
      <View style={styles.reviewHeader}>
        <Text style={styles.reviewAuthor}>{item.author}</Text>
        <View style={styles.reviewRating}>
          {[...Array(5)].map((_, i) => (
            <Ionicons
              key={i}
              name={i < item.rating ? "star" : "star-outline"}
              size={14}
              color={i < item.rating ? Colors.primary : Colors.secondary}
              style={{ marginRight: 2 }}
            />
          ))}
        </View>
      </View>
      <Text style={styles.reviewText}>{item.text}</Text>
    </View>
  );

  // --- Component to render the header content ---
  const ListHeader = () => (
    <>
      {/* --- Favorite Button --- */}
      <TouchableOpacity
        style={styles.favoriteButton}
        onPress={() => perfumeDetails && toggleFavorite(perfumeDetails.id)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        disabled={!perfumeDetails} // Disable if details aren't loaded
      >
        <Ionicons
          name={
            perfumeDetails && favoriteIds.has(perfumeDetails.id)
              ? "heart"
              : "heart-outline"
          }
          size={28}
          color={Colors.primary}
        />
      </TouchableOpacity>

      <Image
        source={{ uri: perfumeDetails!.imageUrl }} // Use non-null assertion or check
        style={styles.sheetImage}
      />
      <Text style={styles.sheetName}>{perfumeDetails!.name}</Text>
      <Text style={styles.sheetBrand}>{perfumeDetails!.brand}</Text>
      <Text style={styles.sheetDetails}>
        Rating: {perfumeDetails!.averageRating.toFixed(1)} (
        {perfumeDetails!.reviewCount} reviews)
      </Text>
      <Text style={styles.sheetDetails}>
        A captivating scent with notes of lol...
      </Text>

      {/* --- Reviews Section Title & Add Review Form --- */}
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

        {/* Replace FlatList with direct rendering */}
        {reviews.length > 0 ? (
          reviews.map((item) => (
            <View key={item.id} style={styles.reviewItem}>
              <View style={styles.reviewHeader}>
                <Text style={styles.reviewAuthor}>{item.author}</Text>
                <View style={styles.reviewRating}>
                  {[...Array(5)].map((_, i) => (
                    <Ionicons
                      key={i}
                      name={i < item.rating ? "star" : "star-outline"}
                      size={14}
                      color={
                        i < item.rating ? Colors.primary : Colors.secondary
                      }
                      style={{ marginRight: 2 }}
                    />
                  ))}
                </View>
              </View>
              <Text style={styles.reviewText}>{item.text}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.noReviewsText}>No reviews yet.</Text>
        )}
      </View>
    </>
  );
  // --- End Header Component ---

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
      {/* Use BottomSheetView as the direct child */}
      <BottomSheetScrollView
        contentContainerStyle={styles.sheetContentContainer}
      >
        {isLoading && (
          <ActivityIndicator
            size="large"
            color={Colors.primary}
            style={styles.loader}
          />
        )}
        {!isLoading && error && <Text style={styles.errorText}>{error}</Text>}
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
            <Text style={styles.sheetDetails}>
              A captivating scent with notes of...
            </Text>

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

              {/* --- Render Reviews using map() instead of FlatList --- */}
              {reviews.length === 0 && !isLoading && perfumeDetails ? (
                // Show empty text only if details are loaded and reviews are empty
                <Text style={styles.noReviewsText}>No reviews yet.</Text>
              ) : (
                reviews.map((item) => (
                  // Render each review item directly.
                  // IMPORTANT: Add the key prop here!
                  <View key={item.id} style={styles.reviewItem}>
                    <View style={styles.reviewHeader}>
                      <Text style={styles.reviewAuthor}>{item.author}</Text>
                      <View style={styles.reviewRating}>
                        {[...Array(5)].map((_, i) => (
                          <Ionicons
                            key={i} // Inner key for the stars map
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
                    <Text style={styles.reviewText}>{item.text}</Text>
                  </View>
                ))
              )}
              {/* --- End Review Rendering --- */}
            </View>
            {/* --- End Reviews Section --- */}
          </>
        )}
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
});
const styles = StyleSheet.create({
  sheetContainer: {
    flex: 1, // Allow FlatList to take full height
    // Remove alignment/padding here, apply to FlatList's contentContainerStyle
  },
  sheetContentContainer: {
    // flex: 1, // Remove flex: 1 if using ScrollView
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 50, // Add more padding at the bottom for scroll
    position: "relative",
  },
  loader: {
    marginTop: 50,
  },
  listContentContainer: {
    alignItems: "center", // Center header items
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 50, // Ensure space at the bottom
    position: "relative", // Needed for absolute positioning of favorite button
  },
  reviewsSectionHeader: {
    marginTop: 20,
    width: "100%", // Take full width within the centered content
    borderTopWidth: 1,
    borderTopColor: Colors.secondary,
    paddingTop: 15,
    alignItems: "center", // Center title and form
  },
  errorText: {
    marginTop: 50,
    fontSize: 16,
    color: Colors.error,
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
  },
  favoriteButton: {
    position: "absolute",
    top: 15,
    right: 20,
    zIndex: 1,
    padding: 5,
  },
  // --- Review Styles ---
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
    textAlignVertical: "top", // Align placeholder text to top for multiline
    fontSize: 14,
  },
  reviewItem: {
    backgroundColor: Colors.background, // Light background for each review
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
  // --- End Review Styles ---
});

export default PerfumeDetailSheet;
