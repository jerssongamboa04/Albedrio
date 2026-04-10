import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../lib/theme";
import { supabase } from "../lib/supabase";

export function ProfileScreen() {
  const [email, setEmail] = useState<string | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadUser() {
      try {
        const { data, error } = await supabase.auth.getUser();

        if (error) {
          throw error;
        }

        if (!isMounted) {
          return;
        }

        setEmail(data.user?.email ?? null);
      } catch (error) {
        console.error("Error al cargar el usuario en perfil:", error);
      } finally {
        if (isMounted) {
          setIsLoadingUser(false);
        }
      }
    }

    loadUser();

    return () => {
      isMounted = false;
    };
  }, []);

  const displayName = useMemo(() => {
    if (!email) {
      return "Tu espacio Albendrio";
    }

    const localPart = email.split("@")[0]?.trim();

    if (!localPart) {
      return "Tu espacio Albendrio";
    }

    const normalized = localPart.replace(/[._-]+/g, " ").trim();

    return normalized.charAt(0).toUpperCase() + normalized.slice(1);
  }, [email]);

  const userInitial = useMemo(() => {
    if (!displayName || displayName === "Tu espacio Albendrio") {
      return "A";
    }

    return displayName.charAt(0).toUpperCase();
  }, [displayName]);

  const emailText = isLoadingUser ? "Cargando cuenta..." : email ?? "No disponible";

  function confirmSignOut() {
    Alert.alert(
      "Cerrar sesión",
      "¿Quieres salir de tu cuenta ahora?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Cerrar sesión",
          style: "destructive",
          onPress: handleSignOut,
        },
      ],
      { cancelable: true }
    );
  }

  async function handleSignOut() {
    try {
      setIsSigningOut(true);

      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      Alert.alert(
        "No se pudo cerrar la sesión",
        "Ha ocurrido un problema al intentar salir. Inténtalo de nuevo."
      );
    } finally {
      setIsSigningOut(false);
    }
  }

  return (
    <View style={styles.root}>
      <View style={styles.bubbleOne} />
      <View style={styles.bubbleTwo} />
      <View style={styles.bubbleThree} />
      <View style={styles.bubbleFour} />

      <SafeAreaView style={styles.screen} edges={["top"]}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.heroCard}>
            <View style={styles.heroGlow} />

            <View style={styles.heroTopRow}>
              <View style={styles.avatarWrap}>
                <View style={styles.avatarOuter}>
                  <View style={styles.avatarInner}>
                    <Text style={styles.avatarLetter}>{userInitial}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.heroTextBlock}>
                <Text style={styles.overline}>Perfil</Text>
                <Text style={styles.heroTitle}>{displayName}</Text>
                <Text style={styles.heroSubtitle}>
                  Tu espacio personal dentro de Albendrio. Aquí vive tu cuenta.
                </Text>
              </View>
            </View>

            <View style={styles.emailCard}>
              <View style={styles.emailIconWrap}>
                <Ionicons
                  name="mail-outline"
                  size={18}
                  color={theme.colors.primaryDark}
                />
              </View>

              <View style={styles.emailTextBlock}>
                <Text style={styles.emailLabel}>Correo de acceso</Text>
                <Text style={styles.emailValue}>{emailText}</Text>
              </View>
            </View>

            <View style={styles.chipsRow}>
              <View style={[styles.chip, styles.chipPrimarySoft]}>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={14}
                  color={theme.colors.primaryDark}
                />
                <Text style={[styles.chipText, styles.chipTextPrimary]}>
                  Cuenta activa
                </Text>
              </View>

              <View style={styles.chip}>
                <Ionicons
                  name="sparkles-outline"
                  size={14}
                  color={theme.colors.primary}
                />
                <Text style={styles.chipText}>Espacio personal</Text>
              </View>

              <View style={styles.chip}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={14}
                  color={theme.colors.primary}
                />
                <Text style={styles.chipText}>Sesión segura</Text>
              </View>
            </View>
          </View>

          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconBox}>
                <Ionicons
                  name="heart-outline"
                  size={20}
                  color={theme.colors.primaryDark}
                />
              </View>

              <View style={styles.sectionHeaderText}>
                <Text style={styles.sectionTitle}>Tu espacio en Albendrio</Text>
                <Text style={styles.sectionSubtitle}>
                  Un lugar breve, claro y con intención
                </Text>
              </View>
            </View>

            <View style={styles.messageBox}>
              <Text style={styles.messageText}>
                Albendrio no busca que lo hagas todo de golpe. Busca ayudarte a
                empezar mejor, bajar la fricción y darte una sensación más real de
                claridad y avance.
              </Text>
            </View>

            <View style={styles.tagsWrap}>
              <View style={styles.softTag}>
                <Text style={styles.softTagText}>Claridad</Text>
              </View>

              <View style={styles.softTag}>
                <Text style={styles.softTagText}>Constancia</Text>
              </View>

              <View style={styles.softTag}>
                <Text style={styles.softTagText}>Pequeños pasos</Text>
              </View>
            </View>
          </View>

          <View style={styles.logoutCard}>
            <View style={styles.logoutHeader}>
              <View style={styles.logoutIconBox}>
                <Ionicons
                  name="log-out-outline"
                  size={20}
                  color="#B5475C"
                />
              </View>

              <View style={styles.sectionHeaderText}>
                <Text style={styles.logoutTitle}>Cerrar sesión</Text>
                <Text style={styles.logoutSubtitle}>
                  Sal de tu cuenta de forma segura cuando lo necesites
                </Text>
              </View>
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.logoutButton,
                pressed && styles.logoutButtonPressed,
                isSigningOut && styles.logoutButtonDisabled,
              ]}
              onPress={confirmSignOut}
              disabled={isSigningOut}
            >
              <Ionicons
                name="log-out-outline"
                size={18}
                color="#FFFFFF"
                style={styles.logoutButtonIcon}
              />
              <Text style={styles.logoutButtonText}>
                {isSigningOut ? "Cerrando sesión..." : "Salir de Albendrio"}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.colors.bgBottom,
  },
  screen: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 28,
    gap: 16,
  },

  bubbleOne: {
    position: "absolute",
    top: 70,
    right: -22,
    width: 118,
    height: 118,
    borderRadius: 59,
    backgroundColor: "rgba(123,92,255,0.10)",
  },
  bubbleTwo: {
    position: "absolute",
    top: 220,
    left: -28,
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "rgba(123,92,255,0.07)",
  },
  bubbleThree: {
    position: "absolute",
    bottom: 180,
    right: 26,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(123,92,255,0.08)",
  },
  bubbleFour: {
    position: "absolute",
    bottom: 60,
    left: 18,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(123,92,255,0.10)",
  },

  heroCard: {
    overflow: "hidden",
    backgroundColor: theme.colors.card,
    borderRadius: 28,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(123,92,255,0.14)",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
    gap: 18,
  },
  heroGlow: {
    position: "absolute",
    top: -18,
    right: -12,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(123,92,255,0.08)",
  },
  heroTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 16,
  },
  avatarWrap: {
    justifyContent: "center",
    alignItems: "center",
  },
  avatarOuter: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: "rgba(123,92,255,0.12)",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarLetter: {
    fontSize: 24,
    fontFamily: "Poppins-Bold",
    color: "#FFFFFF",
  },
  heroTextBlock: {
    flex: 1,
  },
  overline: {
    fontSize: 12,
    fontFamily: "Poppins-SemiBold",
    color: theme.colors.primaryDark,
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  heroTitle: {
    fontSize: 24,
    lineHeight: 30,
    fontFamily: "Poppins-Bold",
    color: theme.colors.text,
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: 14,
    lineHeight: 21,
    fontFamily: "Poppins-Regular",
    color: theme.colors.muted,
  },

  emailCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.colors.stroke,
  },
  emailIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: "rgba(123,92,255,0.10)",
    justifyContent: "center",
    alignItems: "center",
  },
  emailTextBlock: {
    flex: 1,
  },
  emailLabel: {
    fontSize: 12,
    fontFamily: "Poppins-SemiBold",
    color: theme.colors.muted,
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  emailValue: {
    fontSize: 14,
    lineHeight: 21,
    fontFamily: "Poppins-SemiBold",
    color: theme.colors.text,
  },

  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: theme.colors.stroke,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  chipPrimarySoft: {
    backgroundColor: "rgba(123,92,255,0.10)",
    borderColor: "rgba(123,92,255,0.16)",
  },
  chipText: {
    fontSize: 12,
    fontFamily: "Poppins-SemiBold",
    color: theme.colors.text,
  },
  chipTextPrimary: {
    color: theme.colors.primaryDark,
  },

  sectionCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: theme.colors.stroke,
    gap: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  sectionIconBox: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "rgba(123,92,255,0.10)",
    justifyContent: "center",
    alignItems: "center",
  },
  sectionHeaderText: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 17,
    fontFamily: "Poppins-Bold",
    color: theme.colors.text,
    marginBottom: 2,
  },
  sectionSubtitle: {
    fontSize: 13,
    fontFamily: "Poppins-Regular",
    color: theme.colors.muted,
  },
  messageBox: {
    backgroundColor: "rgba(123,92,255,0.08)",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(123,92,255,0.10)",
  },
  messageText: {
    fontSize: 14,
    lineHeight: 22,
    fontFamily: "Poppins-Regular",
    color: theme.colors.text,
  },
  tagsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  softTag: {
    backgroundColor: "#FFFFFF",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: theme.colors.stroke,
  },
  softTagText: {
    fontSize: 12,
    fontFamily: "Poppins-SemiBold",
    color: theme.colors.primaryDark,
  },

  logoutCard: {
    backgroundColor: "#FFF7F8",
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(181,71,92,0.14)",
    gap: 16,
  },
  logoutHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  logoutIconBox: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "rgba(181,71,92,0.10)",
    justifyContent: "center",
    alignItems: "center",
  },
  logoutTitle: {
    fontSize: 17,
    fontFamily: "Poppins-Bold",
    color: theme.colors.text,
    marginBottom: 2,
  },
  logoutSubtitle: {
    fontSize: 13,
    fontFamily: "Poppins-Regular",
    color: theme.colors.muted,
  },
  logoutButton: {
    minHeight: 54,
    borderRadius: 18,
    backgroundColor: "#C65469",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 18,
  },
  logoutButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.995 }],
  },
  logoutButtonDisabled: {
    opacity: 0.7,
  },
  logoutButtonIcon: {
    marginRight: 8,
  },
  logoutButtonText: {
    fontSize: 15,
    fontFamily: "Poppins-Bold",
    color: "#FFFFFF",
  },
});