import React, {
  useEffect,
  useState,
  forwardRef,
  ForwardedRef,
  useCallback,
} from "react";
import { View, Text, StyleSheet, ActivityIndicator, Image } from "react-native";
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetFlatList,
} from "@gorhom/bottom-sheet";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "@/supabase/supabase";
import { Perfume } from "@/types/perfume";
import { Colors } from "@/constants/Colors";

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

interface ReviewWithPerfume extends ReviewWithUser {
  perfume: Perfume | null;
}

interface MyReviewsSheetProps {}

const fetchAllStoredReviews = async (): Promise<ReviewWithUser[]> => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const reviewKeys = keys.filter((key) =>
      key.startsWith(REVIEWS_STORAGE_KEY_PREFIX)
    );
    if (reviewKeys.length === 0) return [];

    const reviewPairs = await AsyncStorage.multiGet(reviewKeys);
    const allReviews = reviewPairs.flatMap(([, value]) =>
      value ? JSON.parse(value) : []
    );

    return allReviews.filter((review) => review.user_id === "currentUser");
  } catch (e) {
    console.error("Failed to fetch all stored reviews", e);
    return [];
  }
};

const fetchPerfumesForReviews = async (
  reviews: ReviewWithUser[]
): Promise<Perfume[]> => {
  const perfumeIds = [...new Set(reviews.map((r) => r.perfume_id))];
  if (perfumeIds.length === 0) return [];

  try {
    const { data, error } = await supabase
      .from("perfumes")
      .select("*")
      .in("id", perfumeIds);

    if (error) {
      console.error("Error fetching perfumes for reviews:", error);
      return [];
    }
    return data || [];
  } catch (error) {
    console.error("Error in fetchPerfumesForReviews:", error);
    return [];
  }
};

const MyReviewsSheet = forwardRef<BottomSheetModal, MyReviewsSheetProps>(
  (_, ref: ForwardedRef<BottomSheetModal>) => {
    const [reviews, setReviews] = useState<ReviewWithPerfume[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadReviews = useCallback(async () => {
      setIsLoading(true);
      const storedReviews = await fetchAllStoredReviews();
      if (storedReviews.length > 0) {
        const perfumes = await fetchPerfumesForReviews(storedReviews);
        const perfumeMap = new Map(perfumes.map((p) => [p.id, p]));

        const combinedData = storedReviews
          .map((review) => ({
            ...review,
            perfume: perfumeMap.get(review.perfume_id) || null,
          }))
          .sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
          );

        setReviews(combinedData);
      } else {
        setReviews([]);
      }
      setIsLoading(false);
    }, []);

    const handleSheetChanges = useCallback(
      (index: number) => {
        if (index > -1) {
          loadReviews();
        }
      },
      [loadReviews]
    );

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

    const renderReviewItem = ({ item }: { item: ReviewWithPerfume }) => (
      <View style={styles.reviewItem}>
        {item.perfume && (
          <View style={styles.perfumeHeader}>
            <Image
              source={{ uri: item.perfume.image_url }}
              style={styles.perfumeImage}
            />
            <View style={styles.perfumeInfo}>
              <Text style={styles.perfumeName}>{item.perfume.name}</Text>
              <Text style={styles.perfumeBrand}>{item.perfume.brand}</Text>
            </View>
          </View>
        )}
        <View style={styles.reviewContent}>
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
          <Text style={styles.reviewText}>{item.review_text}</Text>
        </View>
      </View>
    );

    const renderHeader = () => (
      <View style={styles.sheetHeader}>
        <Text style={styles.sheetTitle}>My Reviews</Text>
      </View>
    );

    const renderEmptyComponent = () => (
      <View style={styles.emptyContainer}>
        <Ionicons name="chatbox-ellipses-outline" size={64} color="#9ca3af" />
        <Text style={styles.emptyText}>No Reviews Yet</Text>
        <Text style={styles.emptySubtext}>
          Your written reviews will appear here.
        </Text>
      </View>
    );

    if (isLoading) {
      return (
        <BottomSheetModal
          ref={ref}
          snapPoints={["70%", "85%"]}
          enablePanDownToClose
          backdropComponent={renderBackdrop}
          backgroundStyle={{ backgroundColor: Colors.background }}
          onChange={handleSheetChanges}
        >
          {renderHeader()}
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        </BottomSheetModal>
      );
    }

    return (
      <BottomSheetModal
        ref={ref}
        snapPoints={["70%", "85%"]}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: Colors.background }}
        onChange={handleSheetChanges}
      >
        <BottomSheetFlatList
          data={reviews}
          keyExtractor={(item) => item.id}
          renderItem={renderReviewItem}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmptyComponent}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        />
      </BottomSheetModal>
    );
  }
);

MyReviewsSheet.displayName = "MyReviewsSheet";

const styles = StyleSheet.create({
  sheetHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    alignItems: "center",
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.text,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 50,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    textAlign: "center",
    marginBottom: 8,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
  },
  reviewItem: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  perfumeHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 10,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.secondary,
  },
  perfumeImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  },
  perfumeInfo: {
    flex: 1,
  },
  perfumeName: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.text,
  },
  perfumeBrand: {
    fontSize: 14,
    color: Colors.text,
    opacity: 0.8,
  },
  reviewContent: {},
  reviewRating: {
    flexDirection: "row",
    marginBottom: 6,
  },
  reviewText: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
});

export default MyReviewsSheet;
