import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  forwardRef,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
} from "react-native";
import BottomSheet, {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
} from "@gorhom/bottom-sheet";
import { Colors } from "@/constants/Colors";
import { Perfume } from "@/components/PerfumeCard";
import SAMPLE_PERFUMES from "@/constants/PerfumeData";

const fetchPerfumeDetails = async (id: string): Promise<Perfume | null> => {
  console.log("Fetching details for ID:", id);
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 1)); // Simulate network delay
  const perfume = SAMPLE_PERFUMES.find((p) => p.id === id);
  return perfume || null;
};


interface PerfumeDetailSheetProps {
  perfumeId: string | null; // ID of the perfume to display, null if none
  onDismiss: () => void; // Callback when the sheet is dismissed
}

const PerfumeDetailSheet = forwardRef<
  BottomSheetModal,
  PerfumeDetailSheetProps
>(({ perfumeId, onDismiss }, ref) => {
  const [perfumeDetails, setPerfumeDetails] = useState<Perfume | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Define snap points
  const snapPoints = useMemo(() => ["85%"], []); 
  useEffect(() => {
    if (perfumeId) {
      setIsLoading(true);
      setPerfumeDetails(null); // Clear previous details
      fetchPerfumeDetails(perfumeId)
        .then((data) => {
          setPerfumeDetails(data);
        })
        .catch(console.error)
        .finally(() => setIsLoading(false));
    } else {
      // If perfumeId becomes null (e.g., sheet closed), clear details
      setPerfumeDetails(null);
      setIsLoading(false);
    }
  }, [perfumeId, ref]); // Depend on perfumeId

  // Handle sheet closing/dismissal
  const handleSheetChanges = useCallback(
    (index: number) => {
      console.log("Sheet index changed (Detail Sheet):", index);
      if (index === -1) {
        onDismiss(); // Notify parent component
      }
    },
    [onDismiss]
  );

  // Custom backdrop
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

  // Don't render the modal if there's no perfumeId to show yet
  // This prevents unnecessary rendering/fetching when sheet is closed
  // However, we need the Modal present in the tree for the ref to work.
  // We control content visibility inside instead.

  return (
    <BottomSheetModal
      ref={ref}
      index={0} // Start snapped to the first point (85%)
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      enableDynamicSizing={false}
      backdropComponent={renderBackdrop}
      enablePanDownToClose={true} // Allow closing by swiping down
      // backgroundStyle={{ backgroundColor: Colors.white }} // Optional background
      // handleIndicatorStyle={{ backgroundColor: Colors.border }} // Optional handle
    >
      <BottomSheetView style={styles.sheetContentContainer}>
        {isLoading && (
          <ActivityIndicator
            size="large"
            color={Colors.primary}
            style={styles.loader}
          />
        )}
        {!isLoading && !perfumeDetails && perfumeId && ( // Show error only if loading finished and no data
          <Text style={styles.errorText}>Perfume details not found.</Text>
        )}
        {!isLoading && perfumeDetails && (
          <>
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
            {/* Add more details or buttons here */}
          </>
        )}
      </BottomSheetView>
    </BottomSheetModal>
  );
});

// --- Styles (Copied from HomeScreen, adjust if needed) ---
const styles = StyleSheet.create({
  sheetContentContainer: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
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
});

export default PerfumeDetailSheet;