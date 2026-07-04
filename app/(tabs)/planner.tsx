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
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getOutfitsWithItems } from "../../services/outfits";
import { Outfit } from "../../types/database";

type OutfitWithImages = Outfit & { itemImages: string[] };

export default function PlannerScreen() {
  const [outfits, setOutfits] = useState<OutfitWithImages[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOutfits = async () => {
    try {
      setError(null);
      const data = await getOutfitsWithItems();
      setOutfits(data);
    } catch (err: any) {
      setError(err.message ?? "Greška pri učitavanju autfita");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadOutfits();
    }, []),
  );

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("sr-RS", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  };

  const renderContent = () => {
    if (loading) {
      return (
        <ThemedView style={styles.centered}>
          <ActivityIndicator size="large" />
          <ThemedText style={styles.loadingText}>
            Učitavanje autfita...
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

    if (outfits.length === 0) {
      return (
        <ThemedView style={styles.centered}>
          <ThemedText style={styles.emptyText}>
            Nemaš još planiranih autfita.
          </ThemedText>
          <ThemedText style={styles.emptySubtext}>
            Kreiraj prvi autfit za neki dan.
          </ThemedText>
        </ThemedView>
      );
    }

    return (
      <FlatList
        data={outfits}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() => router.push(`/outfit-detail?id=${item.id}`)}
          >
            <View style={styles.imagesGrid}>
              {item.itemImages.slice(0, 4).map((uri, idx) => (
                <Image key={idx} source={{ uri }} style={styles.itemThumb} />
              ))}
              {item.itemImages.length === 0 && (
                <View style={[styles.itemThumb, styles.itemThumbPlaceholder]}>
                  <ThemedText style={{ fontSize: 10 }}>Bez slika</ThemedText>
                </View>
              )}
            </View>

            <ThemedText style={styles.cardDate}>
              {formatDate(item.datum)}
            </ThemedText>
            {item.naziv ? (
              <ThemedText style={styles.cardTitle} numberOfLines={1}>
                {item.naziv}
              </ThemedText>
            ) : null}
          </Pressable>
        )}
      />
    );
  };

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <View style={styles.header}>
        <ThemedText style={styles.headerTitle}>Planer autfita</ThemedText>
      </View>

      {renderContent()}

      <Pressable
        style={styles.fab}
        onPress={() => router.push("/create-outfit")}
      >
        <ThemedText style={styles.fabText}>+</ThemedText>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 4 },
  headerTitle: { fontSize: 22, fontWeight: "700" },
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
  list: { padding: 16 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#eee",
  },
  imagesGrid: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
  },
  itemThumb: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  itemThumbPlaceholder: {
    backgroundColor: "#eee",
    justifyContent: "center",
    alignItems: "center",
  },
  cardDate: { fontWeight: "700", fontSize: 13, color: "#3a2a25" },
  cardTitle: { fontWeight: "600", color: "#222", fontSize: 14, marginTop: 2 },
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
