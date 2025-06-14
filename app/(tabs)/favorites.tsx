import { View, Text, StyleSheet, FlatList } from "react-native";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { useFavoriteStore } from "@/store/useFavoriteStore";
import SAMPLE_PERFUMES from "@/constants/PerfumeData";
import PerfumeCard, { Perfume } from "@/components/PerfumeCard";
import { useMemo } from "react";

export default function FavoritesScreen() {
  const favoriteIds = useFavoriteStore((state) => state.favoriteIds);

  const favoritePerfumes = useMemo(() => {
    return SAMPLE_PERFUMES.filter((perfume) => favoriteIds.has(perfume.id));
  }, [favoriteIds]);

  const renderPerfume = ({ item }: { item: Perfume }) => (
    <PerfumeCard perfume={item} />
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Favorites</Text>
      </View>

      {favoritePerfumes.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="heart" size={48} color={Colors.primary} />
          <Text style={styles.emptyStateText}>No favorites yet</Text>
          <Text style={styles.emptyStateSubtext}>
            Start adding perfumes to your favorites list
          </Text>
        </View>
      ) : (
        <FlatList
          data={favoritePerfumes}
          renderItem={renderPerfume}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContentContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    // Remove padding from container if list items have their own margins/padding
    // padding: 16,
  },
  header: {
    marginTop: 60,
    marginBottom: 16, // Adjust spacing if needed
    paddingHorizontal: 16, // Add horizontal padding back for header
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.text,
  },
  listContentContainer: {
    paddingHorizontal: 16, // Add horizontal padding for the list content
    paddingBottom: 16, // Add padding at the bottom
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16, // Ensure empty state is also padded
  },
  // ... existing empty state styles ...
  emptyStateText: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: Colors.text,
    opacity: 0.7,
    textAlign: "center",
  },
});
