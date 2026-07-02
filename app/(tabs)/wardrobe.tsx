import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getClothingItems } from "../../services/clothing";
import { ClothingItem } from "../../types/database";

export default function WardrobeScreen() {
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
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
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadItems();
    }, []),
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadItems();
  }, []);

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

    if (items.length === 0) {
      return (
        <ThemedView style={styles.centered}>
          <ThemedText style={styles.emptyText}>
            Tvoj orman je prazan.
          </ThemedText>
          <ThemedText style={styles.emptySubtext}>
            Dodaj prvi odevni predmet.
          </ThemedText>
        </ThemedView>
      );
    }

    return (
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() => router.push(`/item-detail?id=${item.id}`)}
          >
            {item.image_url ? (
              <Image source={{ uri: item.image_url }} style={styles.image} />
            ) : (
              <View style={[styles.image, styles.imagePlaceholder]}>
                <ThemedText>Bez slike</ThemedText>
              </View>
            )}
            <ThemedText style={styles.itemName}>{item.naziv}</ThemedText>
            <ThemedText style={styles.itemCategory}>
              {item.kategorija}
            </ThemedText>
          </Pressable>
        )}
      />
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
  list: { padding: 10 },
  card: {
    flex: 1,
    margin: 6,
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 8,
    maxWidth: "47%",
  },
  image: {
    width: "100%",
    height: 140,
    borderRadius: 8,
    marginBottom: 6,
  },
  imagePlaceholder: {
    backgroundColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
  },
  itemName: { fontWeight: "600", color: "#222" },
  itemCategory: { color: "#666", fontSize: 12 },
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
  fabText: {
    color: "#fff",
    fontSize: 28,
    lineHeight: 30,
    fontWeight: "600",
  },
});
