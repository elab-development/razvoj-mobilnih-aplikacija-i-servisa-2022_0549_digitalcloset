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

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Greška", "Unesite email i lozinku.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);

    if (error) {
      Alert.alert("Greška pri prijavi", error.message);
      return;
    }

    router.replace("/(tabs)");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Digitalni Orman</Text>
      <Text style={styles.subtitle}>Prijavite se</Text>

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
        placeholder="Lozinka"
        placeholderTextColor="#3a2a2588"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Pressable style={styles.button} onPress={handleLogin} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Prijavi se</Text>
        )}
      </Pressable>

      <Link href="/(auth)/register" style={styles.link}>
        <Text style={{ color: "#3a2a25", fontWeight: "500" }}>
          Nemate nalog? Registrujte se
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
    marginBottom: 8,
    color: "#594100cd",
  },
  subtitle: {
    fontSize: 16,
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
