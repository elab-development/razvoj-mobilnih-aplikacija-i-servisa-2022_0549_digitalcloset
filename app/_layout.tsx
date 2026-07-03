import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import "react-native-reanimated";

import {
  OnboardingProvider,
  useOnboarding,
} from "@/contexts/OnboardingContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useAuth } from "@/hooks/useAuth";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  return (
    <OnboardingProvider>
      <RootLayoutNav />
    </OnboardingProvider>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { loading: authLoading, isLoggedIn } = useAuth();
  const { hasSeenOnboarding } = useOnboarding();

  if (authLoading || hasSeenOnboarding === null) {
    return (
      <View style={styles.splash}>
        <Text style={styles.splashEmoji}>👗</Text>
        <Text style={styles.splashTitle}>Digitalni Orman</Text>
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Protected guard={!hasSeenOnboarding}>
          <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        </Stack.Protected>

        <Stack.Protected guard={hasSeenOnboarding && isLoggedIn}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="modal"
            options={{ presentation: "modal", title: "Modal" }}
          />
        </Stack.Protected>

        <Stack.Protected guard={hasSeenOnboarding && !isLoggedIn}>
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        </Stack.Protected>
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#3a2a25",
  },
  splashEmoji: { fontSize: 64, marginBottom: 12 },
  splashTitle: { fontSize: 22, fontWeight: "700", color: "#fff" },
});
