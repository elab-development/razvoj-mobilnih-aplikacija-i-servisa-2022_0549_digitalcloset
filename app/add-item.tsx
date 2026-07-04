import { ThemedText } from "@/components/themed-text";
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
  TextInput,
  View
} from "react-native";
import {
  addClothingItem,
  getClothingItemById,
  updateClothingItem,
} from "../services/clothing";
import { sendInstantNotification } from "../services/notifications";
import { uploadClothingImage } from "../services/storage";

const KATEGORIJE = ["Tops", "Bottoms", "Shoes", "Dresses", "Accessories"];
const SEZONE = [
  { value: "Zima", label: "Zima" },
  { value: "Prolece/Jesen", label: "Proleće/Jesen" },
  { value: "Leto", label: "Leto" },
  { value: "Sve sezone", label: "Sve sezone" },
];

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

  const pickFromGallery = async () => {
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

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Potrebna dozvola", "Dozvoli pristup kameri da bi slikala.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.7,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const pickImage = () => {
    Alert.alert("Dodaj sliku", "Izaberi opciju", [
      { text: "Slikaj", onPress: takePhoto },
      { text: "Izaberi iz galerije", onPress: pickFromGallery },
      { text: "Otkaži", style: "cancel" },
    ]);
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
        await sendInstantNotification(
          "Izmenjeno! ✅",
          `"${naziv.trim()}" je uspešno ažuriran.`,
        );
      } else {
        await addClothingItem({
          naziv: naziv.trim(),
          kategorija: kategorija.trim(),
          sezona: sezona.trim() || undefined,
          image_url,
        });
        await sendInstantNotification(
          "Dodato! ✅",
          `"${naziv.trim()}" je dodat u tvoj orman.`,
        );
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
      <ThemedText style={styles.title}>
        {isEditMode ? "Izmeni predmet" : "New piece"}
      </ThemedText>

      <Pressable style={styles.photoButton} onPress={pickImage}>
        {displayImage ? (
          <Image source={{ uri: displayImage }} style={styles.preview} />
        ) : (
          <ThemedText style={styles.photoButtonText}>Add photo</ThemedText>
        )}
      </Pressable>

      <ThemedText style={styles.label}>Item name</ThemedText>
      <TextInput
        style={styles.input}
        placeholder="Item name"
        placeholderTextColor="#888"
        value={naziv}
        onChangeText={setNaziv}
      />

      <ThemedText style={styles.label}>Category</ThemedText>
      <View style={styles.chipRow}>
        {KATEGORIJE.map((kat) => (
          <Pressable
            key={kat}
            style={[styles.chip, kategorija === kat && styles.chipActive]}
            onPress={() => setKategorija(kat)}
          >
            <ThemedText
              style={
                kategorija === kat ? styles.chipTextActive : styles.chipText
              }
            >
              {kat}
            </ThemedText>
          </Pressable>
        ))}
      </View>

      <ThemedText style={styles.label}>Sezona (opciono)</ThemedText>
      <View style={styles.chipRow}>
        {SEZONE.map((s) => (
          <Pressable
            key={s.value}
            style={[styles.chip, sezona === s.value && styles.chipActive]}
            onPress={() => setSezona(sezona === s.value ? "" : s.value)}
          >
            <ThemedText
              style={
                sezona === s.value ? styles.chipTextActive : styles.chipText
              }
            >
              {s.label}
            </ThemedText>
          </Pressable>
        ))}
      </View>

      <Pressable
        style={styles.saveButton}
        onPress={handleSave}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <ThemedText style={styles.saveButtonText}>
            {isEditMode ? "Sačuvaj izmene" : "Save item"}
          </ThemedText>
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
