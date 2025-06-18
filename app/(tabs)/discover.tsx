import React, { useState, useEffect } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Alert, TextInput } from "react-native";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import PerfumeCard from "@/components/PerfumeCard";
import { Colors } from "@/constants/Colors";
import { supabase } from "@/supabase/supabase";
import { Perfume } from "@/types/perfume";

export default function DiscoverScreen() {
  const [perfumes, setPerfumes] = useState<Perfume[]>([]);
  const [filteredPerfumes, setFilteredPerfumes] = useState<Perfume[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    console.log("DiscoverScreen mounted, fetching perfumes...");
    fetchPerfumes();

    return () => {
      console.log("DiscoverScreen unmounted.");
    };
  }, []);

  // Filter perfumes based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredPerfumes(perfumes);
    } else {
      const filtered = perfumes.filter((perfume) => {
        const query = searchQuery.toLowerCase();
        
        // Safely check each property with null/undefined checks
        const name = perfume.name?.toLowerCase() || "";
        const brand = perfume.brand?.toLowerCase() || "";
        const description = perfume.description?.toLowerCase() || "";
        
        // Handle notes array safely
        const notesString = Array.isArray(perfume.notes) 
          ? perfume.notes.join(" ").toLowerCase() 
          : "";

        return (
          name.includes(query) ||
          brand.includes(query) ||
          description.includes(query) ||
          notesString.includes(query)
        );
      });
      setFilteredPerfumes(filtered);
    }
  }, [searchQuery, perfumes]);

  const fetchPerfumes = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('perfumes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      console.log('Raw data from Supabase:', JSON.stringify(data, null, 2));
      setPerfumes(data || []);
    } catch (error) {
      console.error('Error fetching perfumes:', error);
      setError('Failed to load perfumes. Please try again.');
      Alert.alert(
        'Error',
        'Failed to load perfumes. Please check your internet connection and try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary || "#007AFF"} />
          <Text style={styles.loadingText}>Discovering fragrances...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Something went wrong</Text>
          <Text style={styles.errorSubtext}>Please try again later</Text>
        </View>
      );
    }

    if (filteredPerfumes.length === 0 && searchQuery.trim() !== "") {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>No matches found</Text>
          <Text style={styles.emptySubtext}>Try searching with different keywords</Text>
        </View>
      );
    }

    if (perfumes.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>No fragrances found</Text>
          <Text style={styles.emptySubtext}>Check back later for new discoveries</Text>
        </View>
      );
    }

    return (
      <FlatList
        data={filteredPerfumes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <PerfumeCard perfume={item} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
        refreshing={loading}
        onRefresh={fetchPerfumes}
      />
    );
  };

  return (
    <BottomSheetModalProvider>
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Discover Fragrances</Text>
            <Text style={styles.subtitle}>Find your signature scent</Text>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#6b7280" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search fragrances, brands, or notes..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#9ca3af"
            />
            {searchQuery.length > 0 && (
              <Ionicons
                name="close-circle"
                size={20}
                color="#6b7280"
                style={styles.clearIcon}
                onPress={() => setSearchQuery("")}
              />
            )}
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
  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 18,
    color: "#6b7280",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#1f2937",
  },
  clearIcon: {
    marginLeft: 12,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6b7280",
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: "#ef4444",
    textAlign: 'center',
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: "#1f2937",
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: 'center',
  },
});