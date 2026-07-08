import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
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
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#3a2a25" />
      </View>
    );
  }

  if (error || !outfit) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error ?? "Autfit nije pronađen."}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <Pressable onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backButtonText}>{"‹ Nazad"}</Text>
      </Pressable>

      <View style={styles.mainInfoCard}>
        <Text style={styles.date}>{formatDate(outfit.datum)}</Text>
        {outfit.naziv ? <Text style={styles.title}>{outfit.naziv}</Text> : null}
        {outfit.napomena ? (
          <Text style={styles.note}>{outfit.napomena}</Text>
        ) : null}
      </View>

      <Text style={styles.sectionTitle}>Komadi odeće ({items.length})</Text>

      {items.length === 0 ? (
        <View style={styles.emptyCentered}>
          <Text style={styles.emptyText}>
            Nema dodate odeće za ovaj autfit.
          </Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.grid}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.itemCard}>
              <View style={styles.imageContainer}>
                {item.image_url ? (
                  <Image
                    source={{ uri: item.image_url }}
                    style={styles.itemImage}
                    resizeMode="contain"
                  />
                ) : (
                  <View style={styles.itemImagePlaceholder}>
                    <Text
                      style={{
                        fontSize: 12,
                        color: "#3a2a25",
                        fontWeight: "600",
                      }}
                    >
                      Bez slike
                    </Text>
                  </View>
                )}
              </View>
              <Text numberOfLines={1} style={styles.itemName}>
                {item.naziv}
              </Text>
            </View>
          )}
        />
      )}

      <Pressable style={styles.deleteButton} onPress={handleDelete}>
        <Text style={styles.deleteButtonText}>Obriši autfit</Text>
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
  emptyCentered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    color: "#644A07",
    fontSize: 15,
    fontWeight: "500",
  },
  errorText: {
    color: "#8b251e",
    fontSize: 16,
    fontWeight: "600",
  },
  backButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignSelf: "flex-start",
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#3a2a25",
  },
  mainInfoCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
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
  date: {
    fontSize: 13,
    color: "#644A07",
    fontWeight: "600",
    textTransform: "uppercase",
    marginBottom: 6,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#3a2a25",
    marginBottom: 4,
  },
  note: {
    fontSize: 14,
    color: "#594100",
    fontWeight: "400",
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: 8,
    marginBottom: 2,
    paddingHorizontal: 16,
    color: "#3a2a25",
  },
  grid: {
    paddingHorizontal: 10,
    paddingBottom: 16,
  },
  itemCard: {
    flex: 1,
    margin: 6,
    padding: 10,
    borderRadius: 14,
    backgroundColor: "#fff",
    maxWidth: "47%",
    borderWidth: 1,
    borderColor: "#FFC6C6",
    shadowColor: "#3a2a25",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  imageContainer: {
    width: "100%",
    height: 140,
    backgroundColor: "#fff",
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 6,
  },
  itemImage: {
    width: "100%",
    height: "100%",
  },
  itemImagePlaceholder: {
    flex: 1,
    backgroundColor: "#FFC6C6",
    justifyContent: "center",
    alignItems: "center",
  },
  itemName: {
    fontSize: 13,
    color: "#3a2a25",
    fontWeight: "700",
    textAlign: "center",
    marginTop: 2,
  },
  deleteButton: {
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 20,
    backgroundColor: "#8b251e",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    elevation: 3,
    shadowColor: "#3a2a25",
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  deleteButtonText: {
    color: "#FFDBDB",
    fontWeight: "700",
    fontSize: 16,
  },
});
