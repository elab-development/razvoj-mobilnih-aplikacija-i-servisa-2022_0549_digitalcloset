import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useWeather } from "@/hooks/useWeather";
import { describeWeatherCode, getWeatherEmoji } from "@/services/weather";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getClothingItems } from "../../services/clothing";
import { getOutfits } from "../../services/outfits";
import { ClothingItem, Outfit } from "../../types/database";

export default function DashboardScreen() {
  const {
    weather,
    loading: weatherLoading,
    error: weatherError,
  } = useWeather();
  const [todaysOutfit, setTodaysOutfit] = useState<Outfit | null>(null);
  const [loadingOutfit, setLoadingOutfit] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [allItems, setAllItems] = useState<ClothingItem[]>([]);

  useFocusEffect(
    useCallback(() => {
      const todayStr = new Date().toISOString().split("T")[0];
      getOutfits()
        .then((outfits) => {
          const found = outfits.find((o) => o.datum === todayStr);
          setTodaysOutfit(found ?? null);
        })
        .catch(() => {})
        .finally(() => setLoadingOutfit(false));

      getClothingItems()
        .then(setAllItems)
        .catch(() => {});
    }, []),
  );

  const suggestions = searchQuery.trim()
    ? allItems.filter((item) =>
        item.naziv.toLowerCase().includes(searchQuery.trim().toLowerCase()),
      )
    : [];

  const handleSelectSuggestion = (item: ClothingItem) => {
    Keyboard.dismiss();
    setSearchQuery("");
    router.push(`/item-detail?id=${item.id}`);
  };

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <ThemedView style={styles.header}>
        <ThemedText style={styles.greeting}>Zdravo! 👋</ThemedText>
        <ThemedText style={styles.subGreeting}>
          Šta planiraš da obučeš danas?
        </ThemedText>
      </ThemedView>

      <View style={styles.searchWrapper}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Pretraži svoj orman..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
        </View>

        {searchQuery.trim().length > 0 && (
          <View style={styles.suggestionsBox}>
            {suggestions.length === 0 ? (
              <Text style={styles.noResultsText}>Nemate taj komad odeće.</Text>
            ) : (
              suggestions.slice(0, 5).map((item) => (
                <Pressable
                  key={item.id}
                  style={styles.suggestionRow}
                  onPress={() => handleSelectSuggestion(item)}
                >
                  <Text style={styles.suggestionName}>{item.naziv}</Text>
                  <Text style={styles.suggestionCategory}>
                    {item.kategorija}
                  </Text>
                </Pressable>
              ))
            )}
          </View>
        )}
      </View>

      <ThemedView style={styles.weatherCard}>
        {weatherLoading ? (
          <ActivityIndicator color="#fff" />
        ) : weatherError ? (
          <Text style={styles.errorText}>{weatherError}</Text>
        ) : weather ? (
          <>
            <Text style={styles.weatherEmoji}>
              {getWeatherEmoji(weather.weatherCode)}
            </Text>
            <Text style={styles.temperature}>{weather.temperature}°C</Text>
            <Text style={styles.weatherDesc}>
              {describeWeatherCode(weather.weatherCode)} · {weather.city}
            </Text>
          </>
        ) : null}
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Današnji autfit</ThemedText>

        {loadingOutfit ? (
          <ActivityIndicator />
        ) : todaysOutfit ? (
          <Pressable
            style={styles.outfitCard}
            onPress={() => router.push(`/outfit-detail?id=${todaysOutfit.id}`)}
          >
            <Text style={styles.outfitTitle}>
              {todaysOutfit.naziv ?? "Autfit za danas"}
            </Text>
            {todaysOutfit.napomena ? (
              <Text style={styles.outfitNote}>{todaysOutfit.napomena}</Text>
            ) : null}
          </Pressable>
        ) : (
          <Pressable
            style={styles.emptyOutfitCard}
            onPress={() => router.push("/create-outfit")}
          >
            <Text style={styles.emptyOutfitText}>
              Nemaš planiran autfit za danas.
            </Text>
            <Text style={styles.emptyOutfitLink}>+ Kreiraj autfit</Text>
          </Pressable>
        )}
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 10 },
  greeting: { fontSize: 28, fontWeight: "700" },
  subGreeting: { fontSize: 15, color: "#888", marginTop: 4 },
  searchWrapper: {
    marginHorizontal: 20,
    marginTop: 16,
    zIndex: 10,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#eee",
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 15, color: "#000" },
  suggestionsBox: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginTop: 6,
    borderWidth: 1,
    borderColor: "#eee",
    overflow: "hidden",
  },
  suggestionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  suggestionName: { fontSize: 14, color: "#222", fontWeight: "600" },
  suggestionCategory: { fontSize: 12, color: "#999" },
  noResultsText: {
    padding: 14,
    color: "#999",
    fontSize: 14,
    textAlign: "center",
  },
  weatherCard: {
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: "#3a2a25",
    borderRadius: 20,
    paddingVertical: 28,
    alignItems: "center",
  },
  weatherEmoji: { fontSize: 44 },
  temperature: { fontSize: 48, fontWeight: "700", color: "#fff", marginTop: 4 },
  weatherDesc: { fontSize: 15, color: "#eee", marginTop: 6 },
  errorText: { color: "#f5b7b1", textAlign: "center", paddingHorizontal: 16 },
  section: { paddingHorizontal: 20, marginTop: 28 },
  sectionTitle: { fontSize: 18, fontWeight: "700", marginBottom: 10 },
  outfitCard: {
    backgroundColor: "#f5f5f5",
    borderRadius: 14,
    padding: 18,
  },
  outfitTitle: { fontWeight: "700", color: "#222", fontSize: 16 },
  outfitNote: { color: "#666", fontSize: 13, marginTop: 4 },
  emptyOutfitCard: {
    backgroundColor: "#f5f5f5",
    borderRadius: 14,
    padding: 18,
    alignItems: "center",
  },
  emptyOutfitText: { color: "#666" },
  emptyOutfitLink: { color: "#3a2a25", fontWeight: "700", marginTop: 8 },
});
