import React from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { SafeAreaView } from "react-native-safe-area-context";
import PerfumeCard from "@/components/PerfumeCard";
import SAMPLE_PERFUMES from "@/constants/PerfumeData";
import { Colors } from "@/constants/Colors";

export default function HomeScreen() {
  return (
    <BottomSheetModalProvider>
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Discover Fragrances</Text>
            <Text style={styles.subtitle}>Find your signature scent</Text>
          </View>

          {/* Perfume List */}
          <FlatList
            data={SAMPLE_PERFUMES}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <PerfumeCard perfume={item} />}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
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
});
