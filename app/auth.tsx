import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { supabase } from "@/supabase/supabase";
import { router } from "expo-router";

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleAuth = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (!isLogin && !username.trim()) {
      Alert.alert("Error", "Please enter a username");
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        router.replace("/(tabs)");
      } else {
        // Sign up user
        const { data: authData, error: authError } = await supabase.auth.signUp(
          {
            email: email.trim(),
            password,
          }
        );

        if (authError) throw authError;

        // If user is created, insert into users table
        if (authData.user) {
          const { error: userError } = await supabase.from("users").insert({
            id: authData.user.id,
            username: username.trim(),
            bio: `Hi I'm ${username.trim()}!`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

          if (userError) {
            console.error("Error creating user profile:", userError);
            // Don't throw here as the auth user was created successfully
          }
        }

        Alert.alert(
          "Success",
          "Account created! Please check your email to verify your account."
        );
      }
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setEmail("");
    setPassword("");
    setUsername("");
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardContainer}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Image
              source={require("@/assets/images/haruma-logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.title}>Haruma</Text>
            <Text style={styles.subtitle}>
              Your fragrance journey starts here
            </Text>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>
              {isLogin ? "Welcome Back" : "Create Account"}
            </Text>

            {!isLogin && (
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={20} color={Colors.text} />
                <TextInput
                  style={styles.input}
                  placeholder="Username"
                  placeholderTextColor="#9ca3af"
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            )}

            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color={Colors.text} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#9ca3af"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={Colors.text}
              />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#9ca3af"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color={Colors.text}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.authButton, loading && styles.disabledButton]}
              onPress={handleAuth}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.authButtonText}>
                  {isLogin ? "Sign In" : "Sign Up"}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={toggleAuthMode}
              style={styles.toggleButton}
            >
              <Text style={styles.toggleText}>
                {isLogin
                  ? "Don't have an account? Sign Up"
                  : "Already have an account? Sign In"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardContainer: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 50,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 8,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.text,
    opacity: 0.7,
    textAlign: "center",
  },
  formContainer: {
    width: "100%",
  },
  formTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: Colors.text,
    textAlign: "center",
    marginBottom: 30,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    backgroundColor: Colors.white,
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: Colors.text,
  },
  eyeIcon: {
    padding: 4,
  },
  authButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 16,
  },
  disabledButton: {
    opacity: 0.6,
  },
  authButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  toggleButton: {
    alignItems: "center",
    paddingVertical: 12,
  },
  toggleText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: "500",
  },
});
