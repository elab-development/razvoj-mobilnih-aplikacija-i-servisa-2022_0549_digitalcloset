import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  deleteOutfit,
  getOutfitById,
  getOutfitItems,
} from "../services/outfits";
import { ClothingItem, Outfit } from "../types/database";

export default function OutfitDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [outfit, setOutfit] = useState<Outfit | null>(null);
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (!id) return;
      setLoading(true);
      Promise.all([getOutfitById(id), getOutfitItems(id)])
        .then(([outfitData, itemsData]) => {
          setOutfit(outfitData);
          setItems(itemsData);
        })
        .catch((err) =>
          setError(err.message ?? "Greška pri učitavanju autfita"),
        )
        .finally(() => setLoading(false));
    }, [id]),
  );

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("sr-RS", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const handleDelete = () => {
    if (!outfit) return;

    Alert.alert(
      "Obriši autfit",
      "Da li si sigurna da želiš da obrišeš ovaj autfit?",
      [
        { text: "Otkaži", style: "cancel" },
        {
          text: "Obriši",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteOutfit(outfit.id);
              router.back();
            } catch (err: any) {
              Alert.alert("Greška", err.message ?? "Brisanje nije uspelo.");
            }
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  if (error || !outfit) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText style={styles.errorText}>
          {error ?? "Autfit nije pronađen."}
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <Pressable onPress={() => router.back()} style={styles.backButton}>
        <ThemedText style={styles.backButtonText}>{"< Nazad"}</ThemedText>
      </Pressable>

      <ThemedView style={styles.header}>
        <ThemedText style={styles.date}>{formatDate(outfit.datum)}</ThemedText>
        {outfit.naziv ? (
          <ThemedText style={styles.title}>{outfit.naziv}</ThemedText>
        ) : null}
        {outfit.napomena ? (
          <ThemedText style={styles.note}>{outfit.napomena}</ThemedText>
        ) : null}
      </ThemedView>

      <ThemedText style={styles.sectionTitle}>
        Komadi odeće ({items.length})
      </ThemedText>

      {items.length === 0 ? (
        <ThemedView style={styles.centered}>
          <ThemedText>Nema dodate odeće za ovaj autfit.</ThemedText>
        </ThemedView>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.grid}
          renderItem={({ item }) => (
            <ThemedView style={styles.itemCard}>
              {item.image_url ? (
                <Image
                  source={{ uri: item.image_url }}
                  style={styles.itemImage}
                />
              ) : (
                <ThemedView
                  style={[styles.itemImage, styles.itemImagePlaceholder]}
                >
                  <ThemedText style={{ fontSize: 10 }}>Bez slike</ThemedText>
                </ThemedView>
              )}
              <ThemedText numberOfLines={1} style={styles.itemName}>
                {item.naziv}
              </ThemedText>
            </ThemedView>
          )}
        />
      )}

      <Pressable style={styles.deleteButton} onPress={handleDelete}>
        <ThemedText style={styles.deleteButtonText}>Obriši autfit</ThemedText>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { color: "red" },
  backButton: { padding: 16 },
  backButtonText: { fontSize: 16, fontWeight: "600" },
  header: { paddingHorizontal: 20, marginBottom: 10 },
  date: { fontSize: 14, color: "#888", marginBottom: 4 },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 4 },
  note: { fontSize: 14, color: "#666" },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: 10,
    marginBottom: 4,
    paddingHorizontal: 20,
  },
  grid: { padding: 16 },
  itemCard: {
    flex: 1,
    margin: 6,
    padding: 8,
    borderRadius: 12,
    backgroundColor: "#f5f5f5",
    maxWidth: "47%",
  },
  itemImage: { width: "100%", height: 160, borderRadius: 10, marginBottom: 6 },
  itemImagePlaceholder: {
    backgroundColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
  },
  itemName: { fontSize: 11, color: "#333" },
  deleteButton: {
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 20,
    backgroundColor: "#c0392b",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  deleteButtonText: { color: "#fff", fontWeight: "700" },
});
