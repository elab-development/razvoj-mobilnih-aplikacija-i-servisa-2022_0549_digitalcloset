import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    Pressable,
    StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getLikedItems } from "../services/clothing";
import { ClothingItem } from "../types/database";

export default function LikedItemsScreen() {
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      getLikedItems()
        .then(setItems)
        .catch(() => {})
        .finally(() => setLoading(false));
    }, []),
  );

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <ThemedView style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <ThemedText style={styles.backText}>{"< Nazad"}</ThemedText>
        </Pressable>
        <ThemedText style={styles.title}>Omiljeni predmeti</ThemedText>
      </ThemedView>

      {loading ? (
        <ThemedView style={styles.centered}>
          <ActivityIndicator size="large" />
        </ThemedView>
      ) : items.length === 0 ? (
        <ThemedView style={styles.centered}>
          <ThemedText style={styles.emptyText}>
            Nemaš još omiljenih predmeta.
          </ThemedText>
          <ThemedText style={styles.emptySubtext}>
            Dodaj ❤️ predmete iz "Moj orman".
          </ThemedText>
        </ThemedView>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Pressable
              style={styles.card}
              onPress={() => router.push(`/item-detail?id=${item.id}`)}
            >
              {item.image_url ? (
                <Image source={{ uri: item.image_url }} style={styles.image} />
              ) : (
                <ThemedView style={[styles.image, styles.imagePlaceholder]}>
                  <ThemedText>Bez slike</ThemedText>
                </ThemedView>
              )}
              <ThemedText style={styles.itemName}>{item.naziv}</ThemedText>
              <ThemedText style={styles.itemCategory}>
                {item.kategorija}
              </ThemedText>
            </Pressable>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 10 },
  backText: { fontSize: 16, fontWeight: "600", marginBottom: 10 },
  title: { fontSize: 22, fontWeight: "700" },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: { fontSize: 16, fontWeight: "600" },
  emptySubtext: { marginTop: 4 },
  list: { padding: 10 },
  card: {
    flex: 1,
    margin: 6,
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 8,
    maxWidth: "47%",
  },
  image: { width: "100%", height: 140, borderRadius: 8, marginBottom: 6 },
  imagePlaceholder: {
    backgroundColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
  },
  itemName: { fontWeight: "600", color: "#222" },
  itemCategory: { color: "#666", fontSize: 12 },
});
