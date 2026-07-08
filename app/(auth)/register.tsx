import { Link, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { supabase } from "../../services/supabase";

export default function RegisterScreen() {
  const [ime, setIme] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async () => {
    if (!ime || !email || !password) {
      Alert.alert("Greška", "Popunite sva polja.");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Greška", "Lozinka mora imati bar 6 karaktera.");
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      setLoading(false);
      Alert.alert("Greška pri registraciji", error.message);
      return;
    }

    // Upisujemo ime u profil (profil je već kreiran automatski preko triggera)
    if (data.user) {
      await supabase.from("profiles").update({ ime }).eq("id", data.user.id);
    }

    setLoading(false);
    Alert.alert("Uspešno", "Nalog je kreiran! Sada se možete prijaviti.");
    router.replace("/(auth)/login");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registracija</Text>

      <TextInput
        style={styles.input}
        placeholder="Ime"
        placeholderTextColor="#3a2a2588"
        value={ime}
        onChangeText={setIme}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#3a2a2588"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Lozinka (min. 6 karaktera)"
        placeholderTextColor="#3a2a2588"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Pressable
        style={styles.button}
        onPress={handleRegister}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Registruj se</Text>
        )}
      </Pressable>

      <Link href="/(auth)/login" style={styles.link}>
        <Text style={{ color: "#3a2a25", fontWeight: "500" }}>
          Već imate nalog? Prijavite se
        </Text>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#FFDBDB",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 32,
    color: "#3a2a25",
  },
  input: {
    borderWidth: 1,
    borderColor: "#FFC6C6",
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: "#fff",
    color: "#3a2a25",
  },
  button: {
    backgroundColor: "#3a2a25",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: {
    color: "#FFDBDB",
    fontSize: 16,
    fontWeight: "600",
  },
  link: {
    marginTop: 20,
    alignSelf: "center",
  },
});
