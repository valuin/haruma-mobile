import React, { useState } from "react";
import { View, Text, TextInput, FlatList, StyleSheet } from "react-native";
import { Colors } from "@/constants/Colors";
import { Feather } from "@expo/vector-icons";
import SAMPLE_PERFUMES from "@/constants/PerfumeData";
import PerfumeCard from "@/components/PerfumeCard";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { SafeAreaView } from "react-native-safe-area-context";

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
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Search</Text>
          </View>

          <View style={styles.searchContainer}>
            <Feather
              name="search"
              size={20}
              color={Colors.text}
              style={{ marginRight: 8 }}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search perfumes..."
              placeholderTextColor={`${Colors.text}80`}
              value={searchQuery}
              onChangeText={handleSearch}
            />
          </View>

          <View style={styles.resultsContainer}>
            <Text style={styles.resultsTitle}>Perfume Results</Text>
            <FlatList
              data={filteredPerfumes}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => <PerfumeCard perfume={item} />}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No perfumes found.</Text>
              }
              contentContainerStyle={{ paddingBottom: 20 }}
            />
          </View>
        </View>
      </SafeAreaView>
    </BottomSheetModalProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.text,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 12,
    marginBottom: 24,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
  },
  resultsContainer: {
    marginTop: 8,
    flex: 1,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 16,
  },
  emptyText: {
    textAlign: "center",
    color: "#6b7280",
    marginTop: 16,
  },
});
