import React, { useRef, useCallback, useMemo, useState } from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useFavoriteStore } from "@/store/useFavoriteStore";
import PerfumeDetailSheet from "./PerfumeDetailSheet";

export interface Perfume {
  id: string;
  name: string;
  brand: string;
  imageUrl: string;
  averageRating: number;
  reviewCount: number;
}

interface PerfumeCardProps {
  perfume: Perfume;
}

const PerfumeCard: React.FC<PerfumeCardProps> = ({ perfume }) => {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  // --- State for selected perfume ID ---
  const [selectedPerfumeId, setSelectedPerfumeId] = useState<string | null>(
    null
  );
  // --- End state ---

  // --- Zustand store integration ---
  const favoriteIds = useFavoriteStore((state) => state.favoriteIds);
  const toggleFavorite = useFavoriteStore((state) => state.toggleFavorite);
  // --- End Zustand integration ---

  const snapPoints = useMemo(() => ["85%"], []);

  const handlePresentModal = useCallback(() => {
    setSelectedPerfumeId(perfume.id); // Set the ID to load in the sheet
    bottomSheetModalRef.current?.present();
  }, [perfume.id]);

  const handleSheetDismiss = useCallback(() => {
    console.log(`Sheet for ${perfume.name} dismissed`);
    setSelectedPerfumeId(null); // Clear the selected ID
  }, [perfume.name]);

  return (
    <>
      <TouchableOpacity
        style={styles.cardContainer}
        onPress={handlePresentModal}
      >
        <Image
          source={{ uri: perfume.imageUrl }}
          style={styles.cardImage}
          resizeMode="cover"
        />
        <View style={styles.cardContent}>
          <View style={styles.favoriteIconContainer}>
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                toggleFavorite(perfume.id);
              }}
              style={styles.favoriteIconButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name={favoriteIds.has(perfume.id) ? "heart" : "heart-outline"}
                size={22}
                color={Colors.primary}
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.perfumeName} numberOfLines={1}>
            {perfume.name}
          </Text>
          <Text style={styles.brandName}>{perfume.brand}</Text>
          {/* Rating */}
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={16} color={Colors.primary} />
            <Text style={styles.ratingText}>
              {perfume.averageRating?.toFixed(1) || "0.0"}
            </Text>
            <Text style={styles.reviewText}>
              ({perfume.reviewCount || 0} reviews)
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      <PerfumeDetailSheet
        ref={bottomSheetModalRef}
        perfumeId={selectedPerfumeId}
        snapPoints={snapPoints}
        onDismiss={handleSheetDismiss}
      />
    </>
  );
};

// --- Copied Styles ---
const styles = StyleSheet.create({
  sheetContentContainer: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    position: "relative",
  },
  cardContainer: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 8,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#f3f4f6",
  },
  cardImage: {
    width: 96,
    height: "100%", // Make sure to set a fixed height for the parent if needed
    minHeight: 120, // Add this to ensure a minimum height
  },
  cardContent: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
    position: "relative",
  },
  favoriteIconContainer: {
    position: "absolute",
    top: 8,
    right: 8,
    zIndex: 10,
  },
  favoriteIconButton: {
    padding: 4,
  },
  perfumeName: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.primary, // Instead of text-red-500
    marginBottom: 4,
  },
  brandName: {
    fontSize: 14,
    color: "#6b7280", // text-gray-500 equivalent
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  ratingText: {
    marginLeft: 4,
    fontWeight: "600",
    color: "#374151", // text-gray-700 equivalent
  },
  reviewText: {
    marginLeft: 4,
    fontSize: 12,
    color: "#6b7280", // text-gray-500 equivalent
  },
  loader: {
    marginTop: 50,
  },
  errorText: {
    marginTop: 50,
    fontSize: 16,
    color: Colors.error,
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
});

export default PerfumeCard;
