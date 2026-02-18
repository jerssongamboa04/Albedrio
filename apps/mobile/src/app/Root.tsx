import { useEffect } from "react";
import { View, Text, Button, TextInput } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../lib/supabase";
import { useAuthStore } from "../store/auth.store";
import { signIn, signUp, signOut } from "../services/auth.service";
import { useState } from "react";

export function Root() {
  const { session, user, initialized, setSession, setInitialized } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    // 1) cargar sesión actual
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session ?? null);
      setInitialized(true);
    });

    // 2) escuchar cambios (login/logout)
    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => {
      sub.subscription.unsubscribe();
    };
  }, [setInitialized, setSession]);

  if (!initialized) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text>Cargando sesión...</Text>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  // ✅ Pantalla HOME provisional cuando hay sesión
  if (session && user) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 24 }}>
          <Text style={{ fontSize: 22, fontWeight: "700" }}>Bienvenido a Albendrio</Text>
          <Text style={{ marginTop: 8, opacity: 0.7 }}>{user.email}</Text>
          <View style={{ marginTop: 16 }}>
            <Button
              title="Cerrar sesión"
              onPress={async () => {
                await signOut();
              }}
            />
          </View>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  // ✅ Login/Register provisional cuando NO hay sesión
  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, justifyContent: "center", padding: 24 }}>
        <Text style={{ fontSize: 26, fontWeight: "800", textAlign: "center" }}>Albendrio</Text>

        <View style={{ marginTop: 24, gap: 12 }}>
          <TextInput
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            style={{ borderWidth: 1, borderRadius: 10, padding: 12 }}
          />
          <TextInput
            placeholder="Contraseña"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={{ borderWidth: 1, borderRadius: 10, padding: 12 }}
          />

          {msg ? <Text style={{ textAlign: "center" }}>{msg}</Text> : null}

          <Button
            title="Iniciar sesión"
            onPress={async () => {
              setMsg(null);
              const { error } = await signIn(email.trim(), password);
              if (error) setMsg(`❌ ${error.message}`);
              else setMsg("✅ Login OK");
            }}
          />

          <Button
            title="Crear cuenta"
            onPress={async () => {
              setMsg(null);
              const { error } = await signUp(email.trim(), password);
              if (error) setMsg(`❌ ${error.message}`);
              else setMsg("✅ Cuenta creada. Revisa tu email si pide confirmación.");
            }}
          />
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
