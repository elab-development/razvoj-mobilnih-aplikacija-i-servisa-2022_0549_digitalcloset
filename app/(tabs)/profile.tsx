import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import {
  cancelAllReminders,
  requestNotificationPermission,
  scheduleDailyOutfitReminder,
} from "@/services/notifications";
import { supabase } from "@/services/supabase";
import { useState } from "react";
import { Alert, Pressable, StyleSheet, Switch } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfileScreen() {
  const [remindersOn, setRemindersOn] = useState(false);

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
        "Svako veče u 20h dobićeš podsetnik da isplaniraš sutrašnji autfit.",
      );
    } else {
      await cancelAllReminders();
    }
    setRemindersOn(value);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <ThemedView style={styles.header}>
        <ThemedText style={styles.title}>Profil</ThemedText>
      </ThemedView>

      <ThemedView style={styles.row}>
        <ThemedText style={styles.rowLabel}>Dnevni podsetnik (20h)</ThemedText>
        <Switch value={remindersOn} onValueChange={handleToggleReminders} />
      </ThemedView>

      <Pressable style={styles.logoutButton} onPress={handleLogout}>
        <ThemedText style={styles.logoutButtonText}>Odjavi se</ThemedText>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 10, marginBottom: 20 },
  title: { fontSize: 26, fontWeight: "700" },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 20,
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  rowLabel: { fontSize: 15, fontWeight: "600", color: "#222" },
  logoutButton: {
    marginHorizontal: 20,
    backgroundColor: "#c0392b",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  logoutButtonText: { color: "#fff", fontWeight: "700" },
});
