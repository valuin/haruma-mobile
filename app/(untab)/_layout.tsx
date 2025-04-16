import React from 'react';
import { Stack } from 'expo-router';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler'; // Import GestureHandlerRootView

export default function UntabLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* Wrap with BottomSheetModalProvider */}
      <BottomSheetModalProvider>
        <Stack>
          {/* Define the screen for the bottom sheet */}
          {/* 'presentation: 'transparentModal'' makes the background transparent */}
          {/* 'animation: 'fade'' is a common choice for modal popups */}
          <Stack.Screen
            name="perfume-detail/[id]"
            options={{
              presentation: 'transparentModal', // Makes screen background transparent
              headerShown: false, // Hide the default header
              animation: 'fade', // Optional: control animation
            }}
          />
          {/* Add other screens in (untab) group if needed */}
        </Stack>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}