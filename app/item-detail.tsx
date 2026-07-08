import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  deleteClothingItem,
  getClothingItemById,
  toggleLiked,
} from "../services/clothing";
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
      setError(null);
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

  const handleToggleLike = async () => {
    if (!item) return;
    try {
      const updated = await toggleLiked(item.id, item.omiljeno);
      setItem(updated);
    } catch (err: any) {
      Alert.alert("Greška", err.message ?? "Nešto nije uspelo.");
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#3a2a25" />
      </View>
    );
  }

  if (error || !item) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>
          {error ?? "Predmet nije pronađen."}
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>{"‹ Nazad"}</Text>
        </Pressable>
        <Pressable style={styles.likeButton} onPress={handleToggleLike}>
          <Text style={styles.likeIcon}>{item.omiljeno ? "❤️" : "🤍"}</Text>
        </Pressable>
      </View>

      <View style={styles.imageContainer}>
        {item.image_url ? (
          <Image
            source={{ uri: item.image_url }}
            style={styles.image}
            resizeMode="contain"
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.placeholderText}>Bez slike</Text>
          </View>
        )}
      </View>

      <View style={styles.detailsContainer}>
        <Text style={styles.title}>{item.naziv}</Text>

        <View style={styles.row}>
          <Text style={styles.label}>Kategorija:</Text>
          <Text style={styles.valueText}>{item.kategorija}</Text>
        </View>

        {item.sezona && (
          <View style={styles.row}>
            <Text style={styles.label}>Sezona:</Text>
            <Text style={styles.valueText}>{item.sezona}</Text>
          </View>
        )}

        {item.boja && (
          <View style={styles.row}>
            <Text style={styles.label}>Boja:</Text>
            <Text style={styles.valueText}>{item.boja}</Text>
          </View>
        )}

        <View style={styles.row}>
          <Text style={styles.label}>Broj nošenja:</Text>
          <Text style={styles.valueText}>{item.broj_nosenja ?? 0}</Text>
        </View>
      </View>

      <Pressable
        style={styles.editButton}
        onPress={() => router.push(`/add-item?id=${item.id}`)}
      >
        <Text style={styles.editButtonText}>Izmeni predmet</Text>
      </Pressable>

      <Pressable style={styles.deleteButton} onPress={handleDelete}>
        <Text style={styles.deleteButtonText}>Obriši predmet</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFDBDB",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFDBDB",
  },
  errorText: {
    color: "#8b251e",
    fontSize: 16,
    fontWeight: "600",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  backButton: {
    padding: 12,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#3a2a25",
  },
  likeButton: {
    padding: 12,
  },
  likeIcon: {
    fontSize: 24,
  },
  imageContainer: {
    width: "100%",
    height: 300,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    flex: 1,
    width: "100%",
    backgroundColor: "#FFC6C6",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    color: "#3a2a25",
    fontSize: 16,
    fontWeight: "600",
  },
  detailsContainer: {
    padding: 20,
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 10,
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#FFC6C6",
    shadowColor: "#3a2a25",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 16,
    color: "#3a2a25",
  },
  row: {
    flexDirection: "row",
    marginBottom: 12,
    gap: 8,
    alignItems: "center",
  },
  label: {
    fontWeight: "700",
    color: "#3a2a25",
    fontSize: 15,
  },
  valueText: {
    color: "#644A07",
    fontSize: 15,
    fontWeight: "600",
  },
  editButton: {
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: "#3a2a25",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  editButtonText: {
    color: "#FFDBDB",
    fontWeight: "700",
    fontSize: 16,
  },
  deleteButton: {
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: "#8b251e",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  deleteButtonText: {
    color: "#FFDBDB",
    fontWeight: "700",
    fontSize: 16,
  },
});
