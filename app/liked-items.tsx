import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
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
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>{"‹ Nazad"}</Text>
        </Pressable>
        <Text style={styles.title}>Omiljeni predmeti</Text>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#3a2a25" />
        </View>
      ) : items.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>Nemaš još omiljenih predmeta.</Text>
          <Text style={styles.emptySubtext}>
            Dodaj ❤️ predmete iz "Moj orman".
          </Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <Pressable
              style={styles.card}
              onPress={() => router.push(`/item-detail?id=${item.id}`)}
            >
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
              <Text numberOfLines={1} style={styles.itemName}>
                {item.naziv}
              </Text>
              <Text style={styles.itemCategory}>{item.kategorija}</Text>
            </Pressable>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFDBDB",
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 16,
  },
  backButton: {
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  backText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#3a2a25",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#3a2a25",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#FFDBDB",
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#3a2a25",
  },
  emptySubtext: {
    marginTop: 6,
    fontSize: 14,
    color: "#644A07",
  },
  list: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  card: {
    flex: 1,
    margin: 6,
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 10,
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
    height: 130,
    backgroundColor: "#fff",
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 8,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    flex: 1,
    backgroundColor: "#FFC6C6",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    fontSize: 12,
    color: "#3a2a25",
    fontWeight: "600",
  },
  itemName: {
    fontWeight: "700",
    color: "#3a2a25",
    fontSize: 14,
    marginBottom: 2,
  },
  itemCategory: {
    color: "#644A07",
    fontSize: 12,
    fontWeight: "500",
  },
});
