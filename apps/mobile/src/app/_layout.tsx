import { Figtree_700Bold, Figtree_800ExtraBold } from "@expo-google-fonts/figtree";
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, useFonts } from "@expo-google-fonts/inter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useHydrateStores } from "../lib/hydrateStores";
import { queryClient } from "../lib/queryClient";

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useHydrateStores();

  // design-system.md §2: sistem fontuna asla düşülmez — useFonts
  // yüklenene kadar splash ekranı tutulur.
  const [fontsLoaded] = useFonts({
    Figtree_700Bold,
    Figtree_800ExtraBold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  useEffect(() => {
    if (fontsLoaded) void SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <StatusBar style="dark" />
          <Stack screenOptions={{ headerShown: false }} />
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
