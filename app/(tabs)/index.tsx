import React from "react";
import { View, Text, FlatList } from "react-native";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import PerfumeCard from "@/components/PerfumeCard";
import SAMPLE_PERFUMES from "@/constants/PerfumeData";

export default function HomeScreen() {
  return (
    <BottomSheetModalProvider>
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
                // Removed onPress prop
              />
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        </View>

        {/* Removed PerfumeDetailSheet instance */}
      </View>
    </BottomSheetModalProvider>
  );
}

// Styles are no longer needed here for the sheet content
