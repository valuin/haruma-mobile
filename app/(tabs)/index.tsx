import React, { useRef, useState, useCallback } from "react";
import { View, Text, FlatList } from "react-native";
import { BottomSheetModal } from "@gorhom/bottom-sheet"; // Only need the type here now
import PerfumeCard from "@/components/PerfumeCard";
import PerfumeDetailSheet from "@/components/PerfumeDetailSheet"; // Import the new component
import SAMPLE_PERFUMES from "@/constants/PerfumeData";

export default function HomeScreen() {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const [selectedPerfumeId, setSelectedPerfumeId] = useState<string | null>(
    null
  );

  const handlePerfumePress = useCallback((perfumeId: string) => {
    setSelectedPerfumeId(perfumeId);
    bottomSheetModalRef.current?.present();
  }, []);

  // Callback for when the sheet is dismissed (by swipe or backdrop press)
  const handleSheetDismiss = useCallback(() => {
    setSelectedPerfumeId(null); // Clear the ID when sheet closes
    console.log("Sheet dismissed");
  }, []);
  return (
    <View className="flex-1 bg-background">
      {/* Main Screen Content */}
      <View className="p-5 pt-10 flex-1">
        {/* Header */}
        <View className="pb-5">
          <Text className="text-3xl font-bold text-gray-800 mb-1">
            Discover Fragrances
          </Text>
          <Text className="text-lg text-gray-500">
            Find your signature scent
          </Text>
        </View>

        {/* Perfume List */}
        <FlatList
          data={SAMPLE_PERFUMES}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PerfumeCard
              perfume={item}
              onPress={() => handlePerfumePress(item.id)}
            />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      </View>

      {/* Render the Bottom Sheet Component */}
      <PerfumeDetailSheet
        ref={bottomSheetModalRef} // Pass the ref
        perfumeId={selectedPerfumeId} // Pass the selected ID
        onDismiss={handleSheetDismiss} // Pass the dismiss handler
      />
    </View>
  );
}

// Styles are no longer needed here for the sheet content
