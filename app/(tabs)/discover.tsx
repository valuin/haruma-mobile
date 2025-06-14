import React, { useState } from "react";
import { View, Text, TextInput, FlatList } from "react-native";
import { Colors } from "@/constants/Colors";
import { Feather } from "@expo/vector-icons";
import SAMPLE_PERFUMES from "@/constants/PerfumeData";
import PerfumeCard from "@/components/PerfumeCard";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet"; // Import provider

export default function DiscoverScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredPerfumes, setFilteredPerfumes] = useState(SAMPLE_PERFUMES);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const filtered = SAMPLE_PERFUMES.filter(
      (perfume) =>
        perfume.name.toLowerCase().includes(query.toLowerCase()) ||
        perfume.brand.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredPerfumes(filtered);
  };

  return (
    <BottomSheetModalProvider>
      <View className="flex-1 bg-background p-4">
        <View className="mt-[60px] mb-6">
          <Text className="text-[28px] font-bold text-text">Search</Text>
        </View>

        <View className="flex-row items-center bg-white rounded-xl p-3 mb-6">
          <Feather
            name="search"
            size={20}
            color={Colors.text}
            style={{ marginRight: 8 }}
          />
          <TextInput
            className="flex-1 text-base text-text"
            placeholder="Search perfumes..."
            placeholderTextColor={`${Colors.text}80`}
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>

        <View className="mt-2 flex-1">
          <Text className="text-lg font-semibold text-text mb-4">
            Perfume Results
          </Text>
          <FlatList
            data={filteredPerfumes}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <PerfumeCard perfume={item} />}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <Text className="text-center text-gray-500 mt-4">
                No perfumes found.
              </Text>
            }
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        </View>
      </View>
    </BottomSheetModalProvider>
  );
}
