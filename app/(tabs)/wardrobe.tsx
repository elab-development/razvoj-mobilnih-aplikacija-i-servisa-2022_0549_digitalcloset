import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  getClothingItems,
  groupByCategory,
  toggleLiked,
} from "../../services/clothing";
import { ClothingItem } from "../../types/database";

export default function WardrobeScreen() {
  const { search } = useLocalSearchParams<{ search?: string }>();
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadItems = async () => {
    try {
      setError(null);
      const data = await getClothingItems();
      setItems(data);
    } catch (err: any) {
      setError(err.message ?? "Greška pri učitavanju odeće");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadItems();
    }, []),
  );

  const handleToggleLike = async (item: ClothingItem) => {
    try {
      const updated = await toggleLiked(item.id, item.omiljeno);
      setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
    } catch (err: any) {
      console.log("Greška pri lajkovanju:", err.message);
    }
  };

  const filteredItems = search
    ? items.filter(
        (item) =>
          item.naziv.toLowerCase().includes(search.toLowerCase()) ||
          item.kategorija.toLowerCase().includes(search.toLowerCase()),
      )
    : items;

  const grouped = groupByCategory(filteredItems);
  const categories = Object.keys(grouped);

  const renderContent = () => {
    if (loading) {
      return (
        <ThemedView style={styles.centered}>
          <ActivityIndicator size="large" />
          <ThemedText style={styles.loadingText}>
            Učitavanje ormana...
          </ThemedText>
        </ThemedView>
      );
    }

    if (error) {
      return (
        <ThemedView style={styles.centered}>
          <ThemedText style={styles.errorText}>{error}</ThemedText>
        </ThemedView>
      );
    }

    if (filteredItems.length === 0) {
      return (
        <ThemedView style={styles.centered}>
          <ThemedText style={styles.emptyText}>
            {search ? `Nema rezultata za "${search}"` : "Tvoj orman je prazan."}
          </ThemedText>
          {!search && (
            <ThemedText style={styles.emptySubtext}>
              Dodaj prvi odevni predmet.
            </ThemedText>
          )}
        </ThemedView>
      );
    }

    return (
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {categories.map((category) => (
          <View key={category} style={styles.categorySection}>
            <ThemedText style={styles.categoryTitle}>{category}</ThemedText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {grouped[category].map((item) => (
                <Pressable
                  key={item.id}
                  style={styles.card}
                  onPress={() => router.push(`/item-detail?id=${item.id}`)}
                >
                  <View style={styles.imageWrapper}>
                    {item.image_url ? (
                      <Image
                        source={{ uri: item.image_url }}
                        style={styles.image}
                      />
                    ) : (
                      <View style={[styles.image, styles.imagePlaceholder]}>
                        <ThemedText style={{ fontSize: 10 }}>
                          Bez slike
                        </ThemedText>
                      </View>
                    )}
                    <Pressable
                      style={styles.heartButton}
                      onPress={() => handleToggleLike(item)}
                      hitSlop={8}
                    >
                      <ThemedText style={styles.heartIcon}>
                        {item.omiljeno ? "❤️" : "🤍"}
                      </ThemedText>
                    </Pressable>
                  </View>
                  <ThemedText style={styles.itemName} numberOfLines={1}>
                    {item.naziv}
                  </ThemedText>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        ))}
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      {renderContent()}

      <Pressable style={styles.fab} onPress={() => router.push("/add-item")}>
        <ThemedText style={styles.fabText}>+</ThemedText>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: { marginTop: 10 },
  errorText: { color: "red", textAlign: "center" },
  emptyText: { fontSize: 16, fontWeight: "600" },
  emptySubtext: { marginTop: 4 },
  scrollContent: { paddingVertical: 12, paddingBottom: 100 },
  categorySection: { marginBottom: 20 },
  categoryTitle: {
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 10,
    paddingHorizontal: 16,
  },
  card: {
    width: 110,
    marginLeft: 12,
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 8,
  },
  imageWrapper: { position: "relative" },
  image: { width: "100%", height: 110, borderRadius: 8, marginBottom: 6 },
  imagePlaceholder: {
    backgroundColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
  },
  heartButton: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "rgba(0,0,0,0.35)",
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  heartIcon: { fontSize: 12 },
  itemName: { fontWeight: "600", color: "#222", fontSize: 12 },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#3a2a25",
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  fabText: { color: "#fff", fontSize: 28, lineHeight: 30, fontWeight: "600" },
});
