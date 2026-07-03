import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { getLikedItems } from "@/services/clothing";
import {
  cancelAllReminders,
  requestNotificationPermission,
  scheduleDailyOutfitReminder,
} from "@/services/notifications";
import { getMyProfile, getMyStats, updateMyProfile } from "@/services/profile";
import { supabase } from "@/services/supabase";
import { Profile } from "@/types/database";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Switch,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfileScreen() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState({
    clothingCount: 0,
    outfitsCount: 0,
    likedCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [ime, setIme] = useState("");
  const [lokacija, setLokacija] = useState("");
  const [saving, setSaving] = useState(false);
  const [remindersOn, setRemindersOn] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      Promise.all([getMyProfile(), getMyStats(), getLikedItems()])
        .then(([profileData, statsData, likedItems]) => {
          setProfile(profileData);
          setIme(profileData.ime ?? "");
          setLokacija(profileData.lokacija ?? "");
          setStats({ ...statsData, likedCount: likedItems.length });
        })
        .catch((err) =>
          Alert.alert("Greška", err.message ?? "Greška pri učitavanju profila"),
        )
        .finally(() => setLoading(false));
    }, []),
  );

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const updated = await updateMyProfile({
        ime: ime.trim() || null,
        lokacija: lokacija.trim() || null,
      });
      setProfile(updated);
      setEditing(false);
    } catch (err: any) {
      Alert.alert("Greška", err.message ?? "Čuvanje nije uspelo.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleReminders = async (value: boolean) => {
    if (value) {
      const granted = await requestNotificationPermission();
      if (!granted) {
        Alert.alert(
          "Dozvola potrebna",
          "Uključi notifikacije u podešavanjima telefona da bi primala podsetnike.",
        );
        return;
      }
      await scheduleDailyOutfitReminder(20, 0);
      Alert.alert(
        "Podsetnici uključeni",
        "Svako veče u 20h dobićeš podsetnik.",
      );
    } else {
      await cancelAllReminders();
    }
    setRemindersOn(value);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <ThemedView style={styles.header}>
        <ThemedView style={styles.avatar}>
          <ThemedText style={styles.avatarText}>
            {(profile?.ime?.[0] ?? profile?.email?.[0] ?? "?").toUpperCase()}
          </ThemedText>
        </ThemedView>

        {editing ? (
          <>
            <TextInput
              style={styles.editInput}
              placeholder="Ime i prezime"
              placeholderTextColor="#888"
              value={ime}
              onChangeText={setIme}
            />
            <TextInput
              style={styles.editInput}
              placeholder="Lokacija (grad)"
              placeholderTextColor="#888"
              value={lokacija}
              onChangeText={setLokacija}
            />
            <Pressable
              style={styles.saveButton}
              onPress={handleSaveProfile}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <ThemedText style={styles.saveButtonText}>Sačuvaj</ThemedText>
              )}
            </Pressable>
          </>
        ) : (
          <>
            <ThemedText style={styles.name}>
              {profile?.ime || "Bez imena"}
            </ThemedText>
            <ThemedText style={styles.email}>{profile?.email}</ThemedText>
            {profile?.lokacija ? (
              <ThemedText style={styles.location}>
                📍 {profile.lokacija}
              </ThemedText>
            ) : null}
            <Pressable style={styles.editLink} onPress={() => setEditing(true)}>
              <ThemedText style={styles.editLinkText}>Izmeni profil</ThemedText>
            </Pressable>
          </>
        )}
      </ThemedView>
      <ThemedView style={styles.statsRow}>
        <ThemedView style={styles.statCard}>
          <ThemedText style={styles.statNumber}>
            {stats.clothingCount}
          </ThemedText>
          <ThemedText style={styles.statLabel}>Odevni predmeti</ThemedText>
        </ThemedView>
        <ThemedView style={styles.statCard}>
          <ThemedText style={styles.statNumber}>
            {stats.outfitsCount}
          </ThemedText>
          <ThemedText style={styles.statLabel}>Autfiti</ThemedText>
        </ThemedView>
        <Pressable
          style={styles.statCard}
          onPress={() => router.push("/liked-items")}
        >
          <ThemedText style={styles.statNumber}>
            ❤️ {stats.likedCount}
          </ThemedText>
          <ThemedText style={styles.statLabel}>Omiljeno</ThemedText>
        </Pressable>
      </ThemedView>
      <ThemedView style={styles.row}>
        <ThemedText style={styles.rowLabel}>Dnevni podsetnik (20h)</ThemedText>
        <Switch value={remindersOn} onValueChange={handleToggleReminders} />
      </ThemedView>
      <Pressable style={styles.logoutButton} onPress={handleLogout}>
        <ThemedText style={styles.logoutButtonText}>Odjavi se</ThemedText>
      </Pressable>

      <Pressable onPress={() => AsyncStorage.removeItem("hasSeenOnboarding")}>
        <ThemedText>[DEV] Resetuj onboarding</ThemedText>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { alignItems: "center", paddingTop: 20, paddingHorizontal: 20 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#3a2a25",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  avatarText: { color: "#fff", fontSize: 32, fontWeight: "700" },
  name: { fontSize: 22, fontWeight: "700" },
  email: { fontSize: 13, color: "#888", marginTop: 2 },
  location: { fontSize: 14, marginTop: 6 },
  editLink: { marginTop: 10 },
  editLinkText: { color: "#3a2a25", fontWeight: "600" },
  editInput: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    marginTop: 8,
    backgroundColor: "#fff",
    color: "#000",
  },
  saveButton: {
    marginTop: 12,
    backgroundColor: "#3a2a25",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  saveButtonText: { color: "#fff", fontWeight: "700" },
  statsRow: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginTop: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  statNumber: { fontSize: 24, fontWeight: "700", color: "#3a2a25" },
  statLabel: { fontSize: 12, color: "#666", marginTop: 4 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 20,
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
  },
  rowLabel: { fontSize: 15, fontWeight: "600", color: "#222" },
  logoutButton: {
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: "#c0392b",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  logoutButtonText: { color: "#fff", fontWeight: "700" },
});
