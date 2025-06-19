import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import React, { useRef, useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { useFavoriteStore } from "@/store/useFavoriteStore";
import {
  BottomSheetModal,
  BottomSheetModalProvider,
} from "@gorhom/bottom-sheet";
import MyReviewsSheet from "@/components/MyReviewsSheet";
import { supabase } from "@/supabase/supabase";

const REVIEWS_STORAGE_KEY_PREFIX = "@reviews_";

interface UserProfile {
  username: string;
  bio: string;
  avatar_url?: string;
}

const fetchReviewCount = async (): Promise<number> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const currentUserId = user?.id || "currentUser";

    const keys = await AsyncStorage.getAllKeys();
    const reviewKeys = keys.filter((key) =>
      key.startsWith(REVIEWS_STORAGE_KEY_PREFIX)
    );
    if (reviewKeys.length === 0) return 0;

    const reviewPairs = await AsyncStorage.multiGet(reviewKeys);
    const allReviews = reviewPairs.flatMap(([, value]) =>
      value ? JSON.parse(value) : []
    );

    return allReviews.filter((review) => review.user_id === currentUserId)
      .length;
  } catch (e) {
    console.error("Failed to fetch review count", e);
    return 0;
  }
};

export default function ProfileScreen() {
  // Get the favoriteIds Set from the store
  const favoriteIds = useFavoriteStore((state) => state.favoriteIds);
  const [reviewCount, setReviewCount] = useState(0);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const uuidRegex =
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
  const validFavoritesCount = Array.from(favoriteIds).filter((id) =>
    uuidRegex.test(id)
  ).length;

  const fetchUserProfile = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("users")
        .select("username, bio, avatar_url")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error fetching user profile:", error);
        return;
      }

      setUserProfile(data);
    } catch (error) {
      console.error("Error in fetchUserProfile:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchReviewCount().then(setReviewCount);
      fetchUserProfile();
    }, [])
  );

  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  const handlePresentModalPress = useCallback(() => {
    console.log("My Reviews button pressed - attempting to open sheet");
    console.log("bottomSheetModalRef current:", bottomSheetModalRef.current);

    if (bottomSheetModalRef.current) {
      bottomSheetModalRef.current.present();
      console.log("Present() called successfully");
    } else {
      console.log("bottomSheetModalRef is null");
    }
  }, []);

  const handleSignOut = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error: any) {
      console.error("Error signing out:", error.message);
    }
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profileHeader}>
          <Ionicons name="person-circle-outline" size={80} color={Colors.text} />
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>
              {userProfile?.username || "Loading..."}
            </Text>
            <Text style={styles.profileBio}>
              {userProfile?.bio || "Fragrance Enthusiast"}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={handleSignOut}
          >
            <Ionicons name="log-out-outline" size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{reviewCount}</Text>
          <Text style={styles.statLabel}>Reviews</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          {/* Display the actual count from the store */}
          <Text style={styles.statNumber}>{validFavoritesCount}</Text>
          <Text style={styles.statLabel}>Favorites</Text>
        </View>
      </View>

      <View style={styles.menuSection}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={handlePresentModalPress}
          activeOpacity={0.7}
        >
          <Ionicons name="book-outline" size={24} color={Colors.text} />
          <Text style={styles.menuText}>My Reviews</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="star-outline" size={24} color={Colors.text} />
          <Text style={styles.menuText}>Wishlist</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={24} color="#ef4444" />
          <Text style={[styles.menuText, { color: "#ef4444" }]}>
            Sign Out
          </Text>
        </TouchableOpacity>
      </View>

      <MyReviewsSheet ref={bottomSheetModalRef} />
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.white,
    padding: 16,
    paddingTop: 60,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  profileName: {
    fontSize: 24,
    fontWeight: "600",
    color: Colors.text,
  },
  profileBio: {
    fontSize: 14,
    color: Colors.text,
    opacity: 0.7,
  },
  settingsButton: {
    padding: 8,
  },
  stats: {
    flexDirection: "row",
    backgroundColor: Colors.white,
    padding: 16,
    marginTop: 1,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "600",
    color: Colors.text,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.text,
    opacity: 0.7,
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.border,
    marginHorizontal: 16,
  },
  menuSection: {
    backgroundColor: Colors.white,
    marginTop: 16,
    padding: 16,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  menuText: {
    fontSize: 16,
    color: Colors.text,
    marginLeft: 12,
  },
});
