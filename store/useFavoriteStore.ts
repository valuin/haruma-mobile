import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface FavoriteState {
  favoriteIds: Set<string>;
  toggleFavorite: (id: string) => void;
}

export const useFavoriteStore = create<FavoriteState>()(
  persist(
    (set, get) => ({
      favoriteIds: new Set<string>(), // Initialize with an empty Set

      toggleFavorite: (id: string) => {
        const currentFavorites = new Set(get().favoriteIds); // Create a new Set from the current state
        if (currentFavorites.has(id)) {
          currentFavorites.delete(id);
        } else {
          currentFavorites.add(id);
        }
        set({ favoriteIds: currentFavorites }); // Update the state with the new Set
      },
    }),
    {
      name: "favorite-perfumes-storage", // Unique name for the storage item
      storage: createJSONStorage(() => AsyncStorage, {
        // Custom replacer/reviver to handle Set serialization
        replacer: (key, value) => {
          if (value instanceof Set) {
            return { __type: "Set", values: Array.from(value) };
          }
          return value;
        },
        reviver: (key, value) => {
          if (
            typeof value === "object" &&
            value !== null &&
            "__type" in value &&
            (value as { __type: string }).__type === "Set"
          ) {
            return new Set(((value as unknown) as { values: string[] }).values);
          }
          return value;
        },
      }),
      partialize: (state) => ({ favoriteIds: state.favoriteIds }), // Only persist favoriteIds
    }
  )
);

// Optional: Log initial state after hydration
useFavoriteStore.persist.onFinishHydration((state) => {
  console.log("Favorite store hydrated:", state?.favoriteIds);
});
