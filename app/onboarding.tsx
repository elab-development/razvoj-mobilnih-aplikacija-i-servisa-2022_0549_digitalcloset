import { useOnboarding } from "@/contexts/OnboardingContext";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function OnboardingScreen() {
  const { completeOnboarding } = useOnboarding();

  const handleGetStarted = async () => {
    await completeOnboarding();
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.content}>
        <Image
          source={require("../assets/images/splash-icon.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.title}>Digitalni Orman</Text>
        <Text style={styles.subtitle}>
          Organizuj svoj orman, planiraj autfite i dobij predloge na osnovu
          vremenske prognoze.
        </Text>

        <Pressable style={styles.button} onPress={handleGetStarted}>
          <Text style={styles.buttonText}>Get Started</Text>
        </Pressable>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#3a2a25" },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  logo: {
    width: 220,
    height: 220,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    color: "#eee",
    textAlign: "center",
    marginTop: 12,
    lineHeight: 22,
  },
  button: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 48,
    marginTop: 40,
  },
  buttonText: { color: "#3a2a25", fontWeight: "700", fontSize: 16 },
});
