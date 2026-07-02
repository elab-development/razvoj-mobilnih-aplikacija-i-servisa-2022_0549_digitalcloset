import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    Pressable,
    StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { deleteClothingItem, getClothingItemById } from "../services/clothing";
import { ClothingItem } from "../types/database";

export default function ItemDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [item, setItem] = useState<ClothingItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (!id) return;
      setLoading(true);
      getClothingItemById(id)
        .then(setItem)
        .catch((err) => setError(err.message ?? "Greška pri učitavanju"))
        .finally(() => setLoading(false));
    }, [id]),
  );
  const handleDelete = () => {
    if (!item) return;

    Alert.alert(
      "Obriši predmet",
      `Da li si sigurna da želiš da obrišeš "${item.naziv}"?`,
      [
        { text: "Otkaži", style: "cancel" },
        {
          text: "Obriši",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteClothingItem(item.id);
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

  if (error || !item) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText style={styles.errorText}>
          {error ?? "Predmet nije pronađen."}
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <Pressable onPress={() => router.back()} style={styles.backButton}>
        <ThemedText style={styles.backButtonText}>{"< Nazad"}</ThemedText>
      </Pressable>

      {item.image_url ? (
        <Image source={{ uri: item.image_url }} style={styles.image} />
      ) : (
        <ThemedView style={[styles.image, styles.imagePlaceholder]}>
          <ThemedText>Bez slike</ThemedText>
        </ThemedView>
      )}

      <ThemedView style={styles.details}>
        <ThemedText style={styles.title}>{item.naziv}</ThemedText>

        <ThemedView style={styles.row}>
          <ThemedText style={styles.label}>Kategorija:</ThemedText>
          <ThemedText>{item.kategorija}</ThemedText>
        </ThemedView>

        {item.sezona && (
          <ThemedView style={styles.row}>
            <ThemedText style={styles.label}>Sezona:</ThemedText>
            <ThemedText>{item.sezona}</ThemedText>
          </ThemedView>
        )}

        {item.boja && (
          <ThemedView style={styles.row}>
            <ThemedText style={styles.label}>Boja:</ThemedText>
            <ThemedText>{item.boja}</ThemedText>
          </ThemedView>
        )}

        <ThemedView style={styles.row}>
          <ThemedText style={styles.label}>Broj nošenja:</ThemedText>
          <ThemedText>{item.broj_nosenja ?? 0}</ThemedText>
        </ThemedView>
      </ThemedView>
      <Pressable
        style={styles.editButton}
        onPress={() => router.push(`/add-item?id=${item.id}`)}
      >
        <ThemedText style={styles.editButtonText}>Izmeni predmet</ThemedText>
      </Pressable>
      <Pressable style={styles.deleteButton} onPress={handleDelete}>
        <ThemedText style={styles.deleteButtonText}>Obriši predmet</ThemedText>
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
  image: { width: "100%", height: 320 },
  imagePlaceholder: { justifyContent: "center", alignItems: "center" },
  details: { padding: 20 },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 16 },
  row: { flexDirection: "row", marginBottom: 10, gap: 6 },
  label: { fontWeight: "600" },
  deleteButton: {
    marginHorizontal: 20,
    marginTop: 10,
    backgroundColor: "#c0392b",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  deleteButtonText: {
    color: "#fff",
    fontWeight: "700",
  },
  editButton: {
    marginHorizontal: 20,
    marginTop: 10,
    backgroundColor: "#3a2a25",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  editButtonText: {
    color: "#fff",
    fontWeight: "700",
  },
});
