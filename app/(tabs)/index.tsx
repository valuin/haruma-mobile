import React, { useState, useEffect } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { SafeAreaView } from "react-native-safe-area-context";
import PerfumeCard from "@/components/PerfumeCard";
import { Colors } from "@/constants/Colors";
import { supabase } from "@/supabase/supabase";
import { Perfume } from "@/types/perfume";

export default function HomeScreen() {
  const [perfumes, setPerfumes] = useState<Perfume[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("HomeScreen mounted, fetching perfumes...");
    fetchPerfumes();

    return () => {
      console.log("HomeScreen unmounted."); // <-- Add a cleanup function to check
    };
  }, []);

  

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
          <Text style={styles.loadingText}>Loading perfumes...</Text>
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

    if (perfumes.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>No perfumes found</Text>
          <Text style={styles.emptySubtext}>Check back later for new fragrances</Text>
        </View>
      );
    }

    return (
      <FlatList
        data={perfumes}
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