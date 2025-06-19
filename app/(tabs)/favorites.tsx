import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import PerfumeCard from "@/components/PerfumeCard";
import { Colors } from "@/constants/Colors";
import { supabase } from "@/supabase/supabase";
import { Perfume } from "@/types/perfume";
import { useFavoriteStore } from "@/store/useFavoriteStore";
import { fetchPerfumesWithStats } from "@/utils/fetchPerfumesWithStats";

export default function FavoritesScreen() {
  const [favoritePerfumes, setFavoritePerfumes] = useState<Perfume[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Get favorite IDs from Zustand store
  const favoriteIds = useFavoriteStore((state) => state.favoriteIds);

  useEffect(() => {
    console.log("FavoritesScreen mounted, fetching favorite perfumes...");
    fetchFavoritePerfumes();

    return () => {
      console.log("FavoritesScreen unmounted.");
    };
  }, [favoriteIds]); // Re-fetch when favorites change

  const fetchFavoritePerfumes = async () => {
    try {
      setLoading(true);
      setError(null);
      const favoriteIdsArray = Array.from(favoriteIds);
      if (favoriteIdsArray.length === 0) {
        setFavoritePerfumes([]);
        setLoading(false);
        return;
      }
      const perfumesWithStats = await fetchPerfumesWithStats(favoriteIdsArray);
      setFavoritePerfumes(perfumesWithStats);
    } catch (error) {
      console.error("Error fetching favorite perfumes:", error);
      setError("Failed to load favorite perfumes. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary || "#007AFF"} />
          <Text style={styles.loadingText}>Loading your favorites...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centerContainer}>
          <Ionicons name="heart-dislike" size={64} color="#ef4444" />
          <Text style={styles.errorText}>Something went wrong</Text>
          <Text style={styles.errorSubtext}>Please try again later</Text>
        </View>
      );
    }

    if (favoriteIds.size === 0) {
      return (
        <View style={styles.centerContainer}>
          <Ionicons name="heart-outline" size={64} color="#9ca3af" />
          <Text style={styles.emptyText}>No favorites yet</Text>
          <Text style={styles.emptySubtext}>
            Start exploring and tap the heart icon to save your favorite
            fragrances
          </Text>
        </View>
      );
    }

    if (favoritePerfumes.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary || "#007AFF"} />
          <Text style={styles.loadingText}>Loading favorites...</Text>
        </View>
      );
    }

    return (
      <FlatList
        data={favoritePerfumes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <PerfumeCard perfume={item} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
        refreshing={loading}
        onRefresh={fetchFavoritePerfumes}
      />
    );
  };

  return (
    <BottomSheetModalProvider>
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Ionicons
                name="heart"
                size={32}
                color={Colors.primary || "#ef4444"}
              />
              <Text style={styles.title}>My Favorites</Text>
            </View>
            <Text style={styles.subtitle}>
              {favoriteIds.size > 0
                ? `${favoriteIds.size} favorite${
                    favoriteIds.size === 1 ? "" : "s"
                  }`
                : "Your loved fragrances will appear here"}
            </Text>
          </View>

          {/* Content */}
          {renderContent()}
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
    padding: 20,
    paddingTop: 40,
    flex: 1,
  },
  header: {
    paddingBottom: 20,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#1f2937",
    marginLeft: 12,
  },
  subtitle: {
    fontSize: 18,
    color: "#6b7280",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
  },
  errorText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ef4444",
    textAlign: "center",
    marginBottom: 8,
    marginTop: 16,
  },
  errorSubtext: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
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
    lineHeight: 20,
  },
});
