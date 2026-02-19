import { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import { Screen } from "../components/Screen";
import { BrandHeader } from "../components/BrandHeader";
import { theme } from "../lib/theme";
import { signIn, signUp } from "../services/auth.service";
import { copy } from "../lib/copy";


export function AuthScreen() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [msg, setMsg] = useState<string | null>(null);

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
                placeholder="Contraseña"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                style={styles.input}
                placeholderTextColor={theme.colors.muted}
            />

            <View style={{ alignItems: "flex-end", marginTop: 6 }}>
                <Text style={styles.link}>¿Olvidaste tu contraseña?</Text>
            </View>

            {msg ? <Text style={styles.msg}>{msg}</Text> : null}

            <Pressable
                style={({ pressed }) => [styles.primaryBtn, pressed && { opacity: 0.9 }]}
                onPress={async () => {
                    setMsg(null);
                    const { error } = await signIn(email.trim(), password);
                    if (error) setMsg(`❌ ${error.message}`);
                }}
            >
                <Text style={styles.primaryBtnText}>Iniciar sesión</Text>
            </Pressable>

            <View style={styles.row}>
                <Text style={{ color: theme.colors.muted }}>¿No tienes cuenta?</Text>
                <Pressable
                    onPress={async () => {
                        setMsg(null);
                        const { error } = await signUp(email.trim(), password);
                        if (error) setMsg(`❌ ${error.message}`);
                        else setMsg("✅ Cuenta creada. Si te pide confirmación, revisa tu email.");
                    }}
                >
                    <Text style={[styles.link, { marginLeft: 6 }]}>Regístrate</Text>
                </Pressable>
            </View>

            {/* Más adelante: botones Google/Apple con su diseño */}
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
});
