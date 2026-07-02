import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  addClothingItem,
  getClothingItemById,
  updateClothingItem,
} from "../services/clothing";
import { uploadClothingImage } from "../services/storage";

const KATEGORIJE = ["Tops", "Bottoms", "Shoes", "Dresses"];

export default function AddItemScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEditMode = !!id;

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const [naziv, setNaziv] = useState("");
  const [kategorija, setKategorija] = useState("");
  const [sezona, setSezona] = useState("");
  const [saving, setSaving] = useState(false);
  const [loadingItem, setLoadingItem] = useState(isEditMode);

  // Ako smo u edit rezimu, ucitaj postojece podatke predmeta
  useEffect(() => {
    if (!id) return;
    getClothingItemById(id)
      .then((item) => {
        setNaziv(item.naziv);
        setKategorija(item.kategorija);
        setSezona(item.sezona ?? "");
        setExistingImageUrl(item.image_url ?? null);
      })
      .catch((err) => {
        Alert.alert("Greška", err.message ?? "Predmet nije pronađen.");
        router.back();
      })
      .finally(() => setLoadingItem(false));
  }, [id]);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Potrebna dozvola",
        "Dozvoli pristup galeriji da bi dodala sliku.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!naziv.trim() || !kategorija.trim()) {
      Alert.alert("Greška", "Naziv i kategorija su obavezni.");
      return;
    }

    setSaving(true);
    try {
      let image_url = existingImageUrl ?? undefined;
      if (imageUri) {
        image_url = await uploadClothingImage(imageUri);
      }

      if (isEditMode && id) {
        await updateClothingItem(id, {
          naziv: naziv.trim(),
          kategorija: kategorija.trim(),
          sezona: sezona.trim() || undefined,
          image_url,
        });
      } else {
        await addClothingItem({
          naziv: naziv.trim(),
          kategorija: kategorija.trim(),
          sezona: sezona.trim() || undefined,
          image_url,
        });
      }

      router.back();
    } catch (err: any) {
      Alert.alert("Greška", err.message ?? "Nešto nije uspelo pri čuvanju.");
    } finally {
      setSaving(false);
    }
  };

  if (loadingItem) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const displayImage = imageUri ?? existingImageUrl;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>
        {isEditMode ? "Izmeni predmet" : "New piece"}
      </Text>

      <Pressable style={styles.photoButton} onPress={pickImage}>
        {displayImage ? (
          <Image source={{ uri: displayImage }} style={styles.preview} />
        ) : (
          <Text style={styles.photoButtonText}>Add photo</Text>
        )}
      </Pressable>

      <Text style={styles.label}>Item name</Text>
      <TextInput
        style={styles.input}
        placeholder="Item name"
        placeholderTextColor="#888"
        value={naziv}
        onChangeText={setNaziv}
      />

      <Text style={styles.label}>Category</Text>
      <View style={styles.chipRow}>
        {KATEGORIJE.map((kat) => (
          <Pressable
            key={kat}
            style={[styles.chip, kategorija === kat && styles.chipActive]}
            onPress={() => setKategorija(kat)}
          >
            <Text
              style={
                kategorija === kat ? styles.chipTextActive : styles.chipText
              }
            >
              {kat}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>Season (opciono)</Text>
      <TextInput
        style={styles.input}
        placeholder="npr. Leto, Zima, Sve sezone"
        placeholderTextColor="#888"
        value={sezona}
        onChangeText={setSezona}
      />

      <Pressable
        style={styles.saveButton}
        onPress={handleSave}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveButtonText}>
            {isEditMode ? "Sačuvaj izmene" : "Save item"}
          </Text>
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
  photoButton: {
    height: 160,
    borderRadius: 12,
    backgroundColor: "#eee",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    overflow: "hidden",
  },
  photoButtonText: { color: "#555", fontWeight: "600" },
  preview: { width: "100%", height: "100%" },
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
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: "#eee",
  },
  chipActive: { backgroundColor: "#3a2a25" },
  chipText: { color: "#333" },
  chipTextActive: { color: "#fff", fontWeight: "600" },
  saveButton: {
    marginTop: 24,
    backgroundColor: "#3a2a25",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  saveButtonText: { color: "#fff", fontWeight: "700" },
});
