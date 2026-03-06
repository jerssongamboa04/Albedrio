import { useState, useEffect } from "react";
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import { Screen } from "../components/Screen";
import { BrandHeader } from "../components/BrandHeader";
import { theme } from "../lib/theme";
import { supabase } from "../lib/supabase";
import { useAuthStore } from "../store/auth.store";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "../navigation/types";

type Props = NativeStackScreenProps<AuthStackParamList, "ResetPassword">;

export function ResetPasswordScreen({ navigation }: Props) {
  const setRecovery = useAuthStore((s) => s.setRecovery);

  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [hasSession, setHasSession] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setHasSession(!!data.session);
      if (!data.session) {
        setMsg("⚠️ Este enlace ya no es válido (o ha caducado). Pide uno nuevo y lo hacemos bien, en modo ninja 🥷");
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  function goRequestNewLink() {
    setRecovery(false);
    setPassword("");
    setPassword2("");
    setMsg(null);
    navigation.replace("ForgotPassword");
  }

  async function onReset() {
    if (loading) return;

    // Si no hay sesión de recovery, no tiene sentido intentar updateUser
    if (hasSession === false) {
      goRequestNewLink();
      return;
    }

    if (!password || !password2) {
      setMsg("⚠️ Completa ambos campos.");
      return;
    }
    if (password.length < 6) {
      setMsg("⚠️ La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (password !== password2) {
      setMsg("⚠️ Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    setMsg(null);

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      const m = (error.message ?? "").toLowerCase();

      if (m.includes("auth session missing")) {
        setMsg("⚠️ El enlace ya se usó o ha caducado. Pide uno nuevo y lo rematamos 🥷");
        setLoading(false);

        // Salimos del modo recovery y volvemos al flujo correcto
        setRecovery(false);
        setTimeout(() => navigation.replace("ForgotPassword"), 900);
        return;
      }

      setMsg(`❌ ${error.message}`);
      setLoading(false);
      return;
    }

    // Seguridad/UX pro: salimos de recovery y forzamos login con la nueva contraseña
    setMsg("✅ Contraseña actualizada. Ahora inicia sesión con la nueva contraseña.");
    setRecovery(false);
    await supabase.auth.signOut();

    setLoading(false);
    navigation.replace("Login");
  }

  const disabled = loading || hasSession === false;

  return (
    <Screen>
      <BrandHeader />

      <Text style={styles.title}>Nueva contraseña</Text>
      <Text style={styles.subtitle}>
        Elige una contraseña nueva y segura. Si el enlace caducó, te preparo uno nuevo al instante.
      </Text>

      <View style={{ height: theme.spacing(2) }} />

      <TextInput
        placeholder="Nueva contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        editable={!disabled}
        style={[styles.input, disabled && { opacity: 0.6 }]}
        placeholderTextColor={theme.colors.muted}
      />
      <TextInput
        placeholder="Repite la nueva contraseña"
        value={password2}
        onChangeText={setPassword2}
        secureTextEntry
        editable={!disabled}
        style={[styles.input, disabled && { opacity: 0.6 }]}
        placeholderTextColor={theme.colors.muted}
      />

      {msg ? <Text style={styles.msg}>{msg}</Text> : null}

      {hasSession === false ? (
        <Pressable
          style={({ pressed }) => [styles.primaryBtn, pressed && { opacity: 0.9 }]}
          onPress={goRequestNewLink}
        >
          <Text style={styles.primaryBtnText}>Pedir un nuevo enlace</Text>
        </Pressable>
      ) : (
        <Pressable
          disabled={loading}
          style={({ pressed }) => [
            styles.primaryBtn,
            (pressed || loading) && { opacity: 0.9 },
            loading && { opacity: 0.6 },
          ]}
          onPress={onReset}
        >
          <Text style={styles.primaryBtnText}>
            {loading ? "Guardando…" : "Guardar contraseña"}
          </Text>
        </Pressable>
      )}

      <View style={{ height: 12 }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    marginTop: 10,
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center",
    color: theme.colors.text,
  },
  subtitle: {
    marginTop: 6,
    fontSize: theme.typography.subtitle,
    textAlign: "center",
    color: theme.colors.muted,
  },
  input: {
    marginTop: 12,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.stroke,
    borderRadius: theme.radius.xl,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: theme.colors.text,
  },
  msg: {
    marginTop: 10,
    textAlign: "center",
    color: theme.colors.text,
  },
  primaryBtn: {
    marginTop: 18,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.xl,
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryBtnText: {
    color: "white",
    fontSize: theme.typography.button,
    fontWeight: "800",
  },
});