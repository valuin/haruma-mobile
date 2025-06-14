import React from 'react';
import { Stack } from 'expo-router';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler'; // Import GestureHandlerRootView

export default function UntabLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <Stack>

          <Stack.Screen
            name="perfume-detail/[id]"
            options={{
              presentation: 'transparentModal',
              headerShown: false, // Hide the default header
              animation: 'fade', // Optional: control animation
            }}
          />
        </Stack>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}