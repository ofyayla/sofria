import { Figtree_400Regular, Figtree_500Medium, Figtree_600SemiBold, Figtree_700Bold, useFonts } from "@expo-google-fonts/figtree";
import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { initialWindowMetrics, SafeAreaProvider } from "react-native-safe-area-context";
import { useHydrateStores } from "../lib/hydrateStores";
import { queryClient } from "../lib/queryClient";
import { colors } from "../theme";

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useHydrateStores();

  // Sistem fontuna asla düşülmez — fontlar yüklenene kadar splash tutulur.
  const [fontsLoaded] = useFonts({
    Figtree_400Regular,
    Figtree_500Medium,
    Figtree_600SemiBold,
    Figtree_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) void SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.night }}>
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
        <QueryClientProvider client={queryClient}>
          <StatusBar style="light" />
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.night } }}>
            <Stack.Screen name="(tabs)" />
            {/* Sihirbaz: sekmelerin üstünde tam ekran modal — kapatınca kaldığın yere dönersin. */}
            <Stack.Screen name="plan" options={{ presentation: "fullScreenModal", animation: "slide_from_bottom" }} />
            <Stack.Screen name="kurallarim" options={{ contentStyle: { backgroundColor: colors.canvas } }} />
            <Stack.Screen name="tariflerim" options={{ contentStyle: { backgroundColor: colors.canvas } }} />
          </Stack>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
