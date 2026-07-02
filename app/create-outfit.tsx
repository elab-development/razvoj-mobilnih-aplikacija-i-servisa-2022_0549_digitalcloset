import { ThemedText } from "@/components/themed-text";
import DateTimePicker from "@react-native-community/datetimepicker";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { getClothingItems } from "../services/clothing";
import { addItemToOutfit, createOutfit } from "../services/outfits";
import { ClothingItem } from "../types/database";

// Pomocna funkcija - danasnji datum u formatu YYYY-MM-DD
function todayString() {
  const d = new Date();
  return d.toISOString().split("T")[0];
}

export default function CreateOutfitScreen() {
  const [datum, setDatum] = useState(todayString());
  const [naziv, setNaziv] = useState("");
  const [napomena, setNapomena] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [clothingItems, setClothingItems] = useState<ClothingItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    getClothingItems()
      .then(setClothingItems)
      .catch((err) =>
        Alert.alert("Greška", err.message ?? "Greška pri učitavanju odeće"),
      )
      .finally(() => setLoadingItems(false));
  }, []);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleSave = async () => {
    if (!datum.trim()) {
      Alert.alert("Greška", "Datum je obavezan.");
      return;
    }
    if (selectedIds.length === 0) {
      Alert.alert("Greška", "Izaberi bar jedan komad odeće za autfit.");
      return;
    }

    setSaving(true);
    try {
      const outfit = await createOutfit({
        datum: datum.trim(),
        naziv: naziv.trim() || undefined,
        napomena: napomena.trim() || undefined,
      });

      // Dodaj sve izabrane komade odece u autfit
      await Promise.all(
        selectedIds.map((clothingId) => addItemToOutfit(outfit.id, clothingId)),
      );

      router.back();
    } catch (err: any) {
      Alert.alert("Greška", err.message ?? "Nešto nije uspelo pri čuvanju.");
    } finally {
      setSaving(false);
    }
  };

  if (loadingItems) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ThemedText style={styles.title}>Kreiraj autfit</ThemedText>

      <ThemedText style={styles.label}>Datum</ThemedText>
      <Pressable
        style={styles.dateButton}
        onPress={() => setShowDatePicker(true)}
      >
        <ThemedText style={styles.dateButtonText}>{datum}</ThemedText>
      </Pressable>

      {showDatePicker && (
        <DateTimePicker
          value={new Date(datum)}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) {
              setDatum(selectedDate.toISOString().split("T")[0]);
            }
          }}
        />
      )}

      <ThemedText style={styles.label}>Naziv (opciono)</ThemedText>
      <TextInput
        style={styles.input}
        placeholder="npr. Casual petak"
        placeholderTextColor="#888"
        value={naziv}
        onChangeText={setNaziv}
      />

      <ThemedText style={styles.label}>Napomena (opciono)</ThemedText>
      <TextInput
        style={styles.input}
        placeholder="npr. Za sastanak posle podne"
        placeholderTextColor="#888"
        value={napomena}
        onChangeText={setNapomena}
      />

      <ThemedText style={styles.label}>
        Izaberi odeću ({selectedIds.length} izabrano)
      </ThemedText>

      {clothingItems.length === 0 ? (
        <Text style={styles.emptyText}>
          Orman je prazan — dodaj prvo neku odeću u "Moj orman".
        </Text>
      ) : (
        <FlatList
          data={clothingItems}
          keyExtractor={(item) => item.id}
          numColumns={3}
          scrollEnabled={false}
          contentContainerStyle={styles.grid}
          renderItem={({ item }) => {
            const isSelected = selectedIds.includes(item.id);
            return (
              <Pressable
                style={[styles.itemCard, isSelected && styles.itemCardSelected]}
                onPress={() => toggleSelect(item.id)}
              >
                {item.image_url ? (
                  <Image
                    source={{ uri: item.image_url }}
                    style={styles.itemImage}
                  />
                ) : (
                  <View style={[styles.itemImage, styles.itemImagePlaceholder]}>
                    <Text style={{ fontSize: 10 }}>Bez slike</Text>
                  </View>
                )}
                <Text numberOfLines={1} style={styles.itemName}>
                  {item.naziv}
                </Text>
                {isSelected && <View style={styles.checkmark} />}
              </Pressable>
            );
          }}
        />
      )}

      <Pressable
        style={styles.saveButton}
        onPress={handleSave}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveButtonText}>Sačuvaj autfit</Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  container: { padding: 20, paddingBottom: 40 },
  title: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 20,
  },
  label: { fontWeight: "600", marginBottom: 6, marginTop: 10 },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    marginBottom: 4,
    backgroundColor: "#fff",
    color: "#000",
  },
  dateButton: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 4,
    backgroundColor: "#fff",
  },
  dateButtonText: {
    color: "#000",
    fontSize: 16,
  },
  emptyText: { color: "#888", marginTop: 8 },
  grid: { marginTop: 8 },
  itemCard: {
    flex: 1,
    margin: 4,
    padding: 6,
    borderRadius: 10,
    backgroundColor: "#f5f5f5",
    maxWidth: "31%",
    borderWidth: 2,
    borderColor: "transparent",
    position: "relative",
  },
  itemCardSelected: {
    borderColor: "#3a2a25",
  },
  itemImage: { width: "100%", height: 70, borderRadius: 6, marginBottom: 4 },
  itemImagePlaceholder: {
    backgroundColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
  },
  itemName: { fontSize: 11, color: "#333" },
  checkmark: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#3a2a25",
  },
  saveButton: {
    marginTop: 24,
    backgroundColor: "#3a2a25",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  saveButtonText: { color: "#fff", fontWeight: "700" },
});
