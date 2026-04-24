import { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, Image } from "react-native";
import { Screen } from "../components/Screen";
import { BrandHeader } from "../components/BrandHeader";
import { theme } from "../lib/theme";
import { signIn } from "../services/auth.service";
import { copy } from "../lib/copy";
import { signInWithGoogleNative } from "../services/googleAuth.service";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "../navigation/types";

type Props = NativeStackScreenProps<AuthStackParamList, "Login">;

export function AuthScreen({ navigation }: Props) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [msg, setMsg] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    return (
        <Screen>
            <BrandHeader />

            <Text style={styles.title}>{copy.auth.title}</Text>
            <Text style={styles.subtitle}>{copy.auth.subtitle}</Text>

            <View style={{ height: theme.spacing(2) }} />

            <TextInput
                placeholder={copy.auth.emailPlaceholder}
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                placeholderTextColor={theme.colors.muted}
            />
            <TextInput
                placeholder={copy.auth.passwordPlaceholder}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                style={styles.input}
                placeholderTextColor={theme.colors.muted}
            />

            <View style={{ alignItems: "flex-end", marginTop: 6 }}>
                <Pressable onPress={() => navigation.navigate("ForgotPassword")} disabled={loading}>
                    <Text style={[styles.link, { opacity: loading ? 0.6 : 1 }]}>¿Olvidaste tu contraseña?</Text>
                </Pressable>
            </View>

            {msg ? <Text style={styles.msg}>{msg}</Text> : null}

            <Pressable
                disabled={loading}
                style={({ pressed }) => [
                    styles.primaryBtn,
                    (pressed || loading) && { opacity: 0.9 },
                    loading && { opacity: 0.6 },
                ]}
                onPress={async () => {
                    if (loading) return;
                    setLoading(true);
                    setMsg(null);

                    const { error } = await signIn(email.trim(), password);

                    if (error) setMsg(`❌ ${error.message}`);
                    setLoading(false);
                }}
            >
                <Text style={styles.primaryBtnText}>
                    {loading ? "Entrando…" : copy.auth.signIn}
                </Text>
            </Pressable>

            <Pressable
                disabled={loading}
                onPress={async () => {
                    if (loading) return;
                    setLoading(true);
                    setMsg(null);

                    try {
                        await signInWithGoogleNative();
                    } catch (e: any) {
                        setMsg(`❌ ${e?.message ?? "No se pudo iniciar con Google"}`);
                    }

                    setLoading(false);
                }}
                style={({ pressed }) => [
                    styles.googleBtn,
                    (pressed || loading) && { opacity: 0.9 },
                    loading && { opacity: 0.6 },
                ]}
            >
                <View style={styles.googleBtnContent}>
                    <Image source={require("../../assets/brand/google.png")} style={styles.googleIcon} />
                    <Text style={styles.googleBtnText}>
                        {loading ? "Conectando…" : "Continuar con Google"}
                    </Text>
                </View>
            </Pressable>

            <View style={styles.row}>
                <Text style={{ color: theme.colors.muted }}>¿No tienes cuenta?</Text>
                <Pressable
                    disabled={loading}
                    onPress={() => {
                        if (loading) return;
                        setMsg(null);
                        navigation.navigate("Register");
                    }}
                >
                    <Text style={[styles.link, { marginLeft: 6, opacity: loading ? 0.6 : 1 }]}>
                        {copy.auth.signUp}
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
    link: {
        color: theme.colors.primary,
        fontWeight: "700",
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
    row: {
        marginTop: 14,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
    },
    googleBtn: {
        marginTop: 12,
        borderWidth: 1,
        borderColor: "rgba(0,0,0,0.10)",
        borderRadius: theme.radius.xl,
        paddingVertical: 12,
        backgroundColor: "white",
    },
    googleBtnContent: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
    },
    googleIcon: {
        width: 18,
        height: 18,
    },
    googleBtnText: {
        fontWeight: "800",
        color: theme.colors.text,
    },
});