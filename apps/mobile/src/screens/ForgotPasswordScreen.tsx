import { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import { Screen } from "../components/Screen";
import { BrandHeader } from "../components/BrandHeader";
import { theme } from "../lib/theme";
import { supabase } from "../lib/supabase";
import * as Linking from "expo-linking";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "../navigation/types";

type Props = NativeStackScreenProps<AuthStackParamList, "ForgotPassword">;

export function ForgotPasswordScreen({ navigation }: Props) {
    const [email, setEmail] = useState("");
    const [msg, setMsg] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

  async function onSend() {
  if (loading) return;

  const cleanEmail = email.trim();
  if (!cleanEmail) {
    setMsg("⚠️ Escribe tu email.");
    return;
  }

  setLoading(true);
  setMsg(null);

  const redirectTo = Linking.createURL("reset-password");
  const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, { redirectTo });

  if (error) {
    setMsg(`❌ ${error.message}`);
    setLoading(false);
    return;
  }

  // ✅ Éxito: confirmación breve + volver a login
  setMsg("✅ Enlace enviado. Si ese email existe, te llegará en unos segundos.");
  setEmail("");

  setLoading(false);

  // Redirigir al login tras una pausa corta (UX tipo app grande)
  setTimeout(() => {
    navigation.replace("Login");
  }, 900);
}

    return (
        <Screen>
            <BrandHeader />

            <Text style={styles.title}>Recuperar contraseña</Text>
            <Text style={styles.subtitle}>Te enviaremos un enlace para restablecer tu contraseña.</Text>

            <View style={{ height: theme.spacing(2) }} />

            <TextInput
                placeholder="Email"
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                placeholderTextColor={theme.colors.muted}
            />

            {msg ? <Text style={styles.msg}>{msg}</Text> : null}

            <Pressable
                disabled={loading}
                style={({ pressed }) => [
                    styles.primaryBtn,
                    (pressed || loading) && { opacity: 0.9 },
                    loading && { opacity: 0.6 },
                ]}
                onPress={onSend}
            >
                <Text style={styles.primaryBtnText}>{loading ? "Enviando…" : "Enviar enlace"}</Text>
            </Pressable>

            <View style={styles.row}>
                <Text style={{ color: theme.colors.muted }}>¿Te has acordado?</Text>
                <Pressable
                    disabled={loading}
                    onPress={() => {
                        if (loading) return;
                        setMsg(null);
                        navigation.replace("Login");
                    }}
                >
                    <Text style={[styles.link, { marginLeft: 6, opacity: loading ? 0.6 : 1 }]}>
                        Volver a iniciar sesión
                    </Text>
                </Pressable>
            </View>

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
    link: {
        color: theme.colors.primary,
        fontWeight: "700",
    },
    row: {
        marginTop: 14,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
    },
});