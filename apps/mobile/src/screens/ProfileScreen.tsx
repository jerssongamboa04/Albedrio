import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

import { theme } from "../lib/theme";
import { supabase } from "../lib/supabase";
import { signOutGoogleNative } from "../services/googleAuth.service";
type ProfileRecord = {
  id: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

export function ProfileScreen() {
  const [email, setEmail] = useState<string | null>(null);
  const [profile, setProfile] = useState<ProfileRecord | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [localAvatarUri, setLocalAvatarUri] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const [draftDisplayName, setDraftDisplayName] = useState("");
  const [draftBio, setDraftBio] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadUserAndProfile() {
      try {
        const { data, error } = await supabase.auth.getUser();

        if (error) {
          throw error;
        }

        if (!isMounted) {
          return;
        }

        const authUser = data.user;

        setEmail(authUser?.email ?? null);

        if (!authUser) {
          setProfile(null);
          return;
        }

        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("id, display_name, bio, avatar_url, created_at, updated_at")
          .eq("id", authUser.id)
          .maybeSingle();

        if (profileError) {
          throw profileError;
        }

        if (!isMounted) {
          return;
        }

        setProfile((profileData as ProfileRecord | null) ?? null);
      } catch (error) {
        console.error("Error al cargar el perfil:", error);
      } finally {
        if (isMounted) {
          setIsLoadingUser(false);
        }
      }
    }

    loadUserAndProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  const fallbackName = useMemo(() => {
    if (!email) {
      return "Tu espacio Albedrio";
    }

    const localPart = email.split("@")[0]?.trim();

    if (!localPart) {
      return "Tu espacio Albedrio";
    }

    const normalized = localPart.replace(/[._-]+/g, " ").trim();

    return normalized.charAt(0).toUpperCase() + normalized.slice(1);
  }, [email]);

  const displayName = useMemo(() => {
    const profileName = profile?.display_name?.trim();

    if (profileName) {
      return profileName;
    }

    return fallbackName;
  }, [profile, fallbackName]);

  const profileBio = useMemo(() => {
    const bio = profile?.bio?.trim();

    if (bio) {
      return bio;
    }

    return "Tu espacio personal dentro de Albedrio. Aquí vive tu cuenta.";
  }, [profile]);

  const userInitial = useMemo(() => {
    if (!displayName || displayName === "Tu espacio Albedrio") {
      return "A";
    }

    return displayName.charAt(0).toUpperCase();
  }, [displayName]);

  const emailText = isLoadingUser ? "Cargando cuenta..." : email ?? "No disponible";
  const avatarUri = localAvatarUri ?? profile?.avatar_url ?? null;
  const bioCharactersLeft = 160 - draftBio.length;

  function openEditModal() {
    setDraftDisplayName(profile?.display_name?.trim() || fallbackName);
    setDraftBio(profile?.bio ?? "");
    setIsEditModalVisible(true);
  }

  function closeEditModal() {
    if (isSavingProfile) return;
    setIsEditModalVisible(false);
  }

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

      await signOutGoogleNative();

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

  function getFileExtension(
    image: ImagePicker.ImagePickerAsset
  ): "jpg" | "jpeg" | "png" | "webp" {
    const uriExtension = image.uri.split(".").pop()?.toLowerCase();

    if (
      uriExtension === "jpg" ||
      uriExtension === "jpeg" ||
      uriExtension === "png" ||
      uriExtension === "webp"
    ) {
      return uriExtension;
    }

    const mimeType = image.mimeType?.toLowerCase();

    if (mimeType?.includes("png")) {
      return "png";
    }

    if (mimeType?.includes("webp")) {
      return "webp";
    }

    if (mimeType?.includes("jpeg") || mimeType?.includes("jpg")) {
      return "jpg";
    }

    return "jpg";
  }

  function getContentType(
    extension: "jpg" | "jpeg" | "png" | "webp"
  ): string {
    if (extension === "png") {
      return "image/png";
    }

    if (extension === "webp") {
      return "image/webp";
    }

    return "image/jpeg";
  }

  async function uploadAvatar(image: ImagePicker.ImagePickerAsset) {
    const previousAvatarUri = localAvatarUri ?? profile?.avatar_url ?? null;

    try {
      setIsUploadingAvatar(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!user) {
        throw new Error("No hay usuario autenticado");
      }

      const arrayBuffer = await fetch(image.uri).then((res) => res.arrayBuffer());

      const fileExtension = getFileExtension(image);
      const contentType = image.mimeType ?? getContentType(fileExtension);
      const filePath = `${user.id}/avatar`;

      const { error: updateFileError } = await supabase.storage
        .from("avatars")
        .update(filePath, arrayBuffer, {
          contentType,
          cacheControl: "60",
          upsert: true,
        });

      if (updateFileError) {
        const { error: uploadFileError } = await supabase.storage
          .from("avatars")
          .upload(filePath, arrayBuffer, {
            contentType,
            cacheControl: "60",
            upsert: true,
          });

        if (uploadFileError) {
          throw uploadFileError;
        }
      }

      const { data: publicUrlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      const publicUrlWithVersion = `${publicUrlData.publicUrl}?v=${Date.now()}`;

      const { data: updatedProfile, error: updateProfileError } = await supabase
        .from("profiles")
        .upsert(
          {
            id: user.id,
            avatar_url: publicUrlWithVersion,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id" }
        )
        .select("id, display_name, bio, avatar_url, created_at, updated_at")
        .single();

      if (updateProfileError) {
        throw updateProfileError;
      }

      setProfile(updatedProfile as ProfileRecord);
      setLocalAvatarUri(publicUrlWithVersion);

      Alert.alert("Foto actualizada", "Tu imagen de perfil ya se ha actualizado.");
    } catch (error) {
      console.error("Error al subir el avatar:", error);
      setLocalAvatarUri(previousAvatarUri);

      Alert.alert(
        "No se pudo actualizar la foto",
        "Ha ocurrido un problema al intentar actualizar la imagen."
      );
    } finally {
      setIsUploadingAvatar(false);
    }
  }

  async function handlePickAvatar() {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          "Permiso necesario",
          "Albedrio necesita acceso a tus fotos para que puedas elegir una imagen de perfil."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled) {
        return;
      }

      const selectedAsset = result.assets?.[0];

      if (!selectedAsset?.uri) {
        return;
      }

      setLocalAvatarUri(selectedAsset.uri);
      await uploadAvatar(selectedAsset);
    } catch (error) {
      console.error("Error al seleccionar imagen:", error);
      Alert.alert(
        "No se pudo abrir la galería",
        "Ha ocurrido un problema al intentar seleccionar la imagen."
      );
    }
  }

  async function handleSaveProfile() {
    const cleanedDisplayName = draftDisplayName.trim();
    const cleanedBio = draftBio.trim();

    if (!cleanedDisplayName) {
      Alert.alert(
        "Nombre necesario",
        "Añade un nombre visible para guardar tu perfil."
      );
      return;
    }

    if (cleanedBio.length > 160) {
      Alert.alert(
        "Bio demasiado larga",
        "La biografía debe tener como máximo 160 caracteres."
      );
      return;
    }

    try {
      setIsSavingProfile(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!user) {
        throw new Error("No hay usuario autenticado");
      }

      const { data: updatedProfile, error: updateProfileError } = await supabase
        .from("profiles")
        .upsert(
          {
            id: user.id,
            display_name: cleanedDisplayName,
            bio: cleanedBio.length > 0 ? cleanedBio : null,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id" }
        )
        .select("id, display_name, bio, avatar_url, created_at, updated_at")
        .single();

      if (updateProfileError) {
        throw updateProfileError;
      }

      setProfile(updatedProfile as ProfileRecord);
      setIsEditModalVisible(false);

      Alert.alert("Perfil actualizado", "Tus cambios ya se han guardado.");
    } catch (error) {
      console.error("Error al guardar el perfil:", error);
      Alert.alert(
        "No se pudo guardar",
        "Ha ocurrido un problema al intentar actualizar tu perfil."
      );
    } finally {
      setIsSavingProfile(false);
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
              <Pressable
                style={styles.avatarWrap}
                onPress={handlePickAvatar}
                accessibilityRole="button"
                accessibilityLabel="Cambiar imagen de perfil"
                disabled={isUploadingAvatar}
              >
                <View style={styles.avatarOuter}>
                  <View style={styles.avatarInner}>
                    {avatarUri ? (
                      <Image
                        source={{ uri: avatarUri }}
                        style={styles.avatarImage}
                      />
                    ) : (
                      <Text style={styles.avatarLetter}>{userInitial}</Text>
                    )}
                  </View>

                  <View style={styles.avatarBadge}>
                    <Ionicons
                      name={
                        isUploadingAvatar
                          ? "cloud-upload-outline"
                          : "camera-outline"
                      }
                      size={16}
                      color="#FFFFFF"
                    />
                  </View>
                </View>

                <Text style={styles.avatarHint}>
                  {isUploadingAvatar
                    ? "Subiendo imagen..."
                    : "Toca la imagen para cambiar tu foto"}
                </Text>
              </Pressable>

              <View style={styles.heroTextBlock}>
                <Text style={styles.overline}>Perfil</Text>
                <Text style={styles.heroTitle}>{displayName}</Text>
                <Text style={styles.heroSubtitle}>{profileBio}</Text>
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

            </View>

            <Pressable
              style={({ pressed }) => [
                styles.editProfileButton,
                pressed && styles.editProfileButtonPressed,
              ]}
              onPress={openEditModal}
            >
              <Ionicons
                name="create-outline"
                size={18}
                color={theme.colors.primaryDark}
                style={styles.editProfileButtonIcon}
              />
              <Text style={styles.editProfileButtonText}>Editar perfil</Text>
            </Pressable>
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
                <Text style={styles.sectionTitle}>Tu espacio en Albedrio</Text>
              </View>
            </View>

            <View style={styles.messageBox}>
              <Text style={styles.messageText}>
                Albedrio no busca que lo hagas todo de golpe. Busca ayudarte a
                empezar mejor, bajar la fricción y darte una sensación más real
                de claridad y avance.
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
                {isSigningOut ? "Cerrando sesión..." : "Salir de Albedrio"}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>

      <Modal
        visible={isEditModalVisible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={closeEditModal}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={closeEditModal} />

          <View style={styles.modalCard}>
            <View style={styles.modalHandle} />

            <View style={styles.modalHeader}>
              <View style={styles.modalIconWrap}>
                <Ionicons
                  name="create-outline"
                  size={20}
                  color={theme.colors.primaryDark}
                />
              </View>

              <View style={styles.modalHeaderText}>
                <Text style={styles.modalTitle}>Editar perfil</Text>
                <Text style={styles.modalSubtitle}>
                  Ajusta tu nombre visible y tu bio sin salir de tu espacio
                </Text>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>Nombre visible</Text>
              <TextInput
                value={draftDisplayName}
                onChangeText={setDraftDisplayName}
                placeholder="Escribe tu nombre visible"
                placeholderTextColor="#A29CB7"
                style={styles.input}
                maxLength={40}
              />
            </View>

            <View style={styles.formGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.inputLabel}>Bio breve</Text>
                <Text style={styles.counterText}>{bioCharactersLeft}</Text>
              </View>

              <TextInput
                value={draftBio}
                onChangeText={setDraftBio}
                placeholder="Cuéntale algo breve a Albedrio sobre ti"
                placeholderTextColor="#A29CB7"
                style={[styles.input, styles.textArea]}
                multiline
                maxLength={160}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.modalActions}>
              <Pressable
                style={({ pressed }) => [
                  styles.secondaryButton,
                  pressed && styles.secondaryButtonPressed,
                  isSavingProfile && styles.secondaryButtonDisabled,
                ]}
                onPress={closeEditModal}
                disabled={isSavingProfile}
              >
                <Text style={styles.secondaryButtonText}>Cancelar</Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.saveButton,
                  pressed && styles.saveButtonPressed,
                  isSavingProfile && styles.saveButtonDisabled,
                ]}
                onPress={handleSaveProfile}
                disabled={isSavingProfile}
              >
                <Ionicons
                  name="save-outline"
                  size={18}
                  color="#FFFFFF"
                  style={styles.saveButtonIcon}
                />
                <Text style={styles.saveButtonText}>
                  {isSavingProfile ? "Guardando..." : "Guardar"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
    width: 105,
    height: 105,
    borderRadius: 52,
    backgroundColor: "rgba(123,92,255,0.12)",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInner: {
    width: 88,
    height: 88,
    borderRadius: 42,
    backgroundColor: theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  avatarLetter: {
    fontSize: 24,
    fontFamily: "Poppins-Bold",
    color: "#FFFFFF",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 42,
  },
  avatarBadge: {
    position: "absolute",
    right: 4,
    bottom: 4,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: theme.colors.primaryDark,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: theme.colors.card,
  },
  avatarHint: {
    marginTop: 8,
    width: 110,
    textAlign: "center",
    fontSize: 12,
    lineHeight: 16,
    fontFamily: "Poppins-Medium",
    color: theme.colors.muted,
  },
  heroTextBlock: {
    flex: 1,
  },
  overline: {
    fontSize: 24,
    fontFamily: "Poppins-SemiBold",
    color: theme.colors.primaryDark,
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  heroTitle: {
    fontSize: 18,
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

  editProfileButton: {
    minHeight: 48,
    borderRadius: 18,
    backgroundColor: "rgba(123,92,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(123,92,255,0.14)",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  editProfileButtonPressed: {
    opacity: 0.92,
  },
  editProfileButtonIcon: {
    marginRight: 8,
  },
  editProfileButtonText: {
    fontSize: 14,
    fontFamily: "Poppins-Bold",
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

  formGroup: {
    gap: 8,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  inputLabel: {
    fontSize: 13,
    fontFamily: "Poppins-SemiBold",
    color: theme.colors.text,
  },
  counterText: {
    fontSize: 12,
    fontFamily: "Poppins-Medium",
    color: theme.colors.muted,
  },
  input: {
    minHeight: 54,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: theme.colors.stroke,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: theme.colors.text,
  },
  textArea: {
    minHeight: 110,
  },

  saveButton: {
    minHeight: 52,
    borderRadius: 18,
    backgroundColor: theme.colors.primary,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 18,
  },
  saveButtonPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.995 }],
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonIcon: {
    marginRight: 8,
  },
  saveButtonText: {
    fontSize: 15,
    fontFamily: "Poppins-Bold",
    color: "#FFFFFF",
  },

  secondaryButton: {
    minHeight: 52,
    flex: 1,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: theme.colors.stroke,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 18,
  },
  secondaryButtonPressed: {
    opacity: 0.9,
  },
  secondaryButtonDisabled: {
    opacity: 0.7,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontFamily: "Poppins-Bold",
    color: theme.colors.text,
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

  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    backgroundColor: "rgba(27, 18, 52, 0.28)",
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 28,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(123,92,255,0.14)",
    gap: 18,
  },
  modalHandle: {
    alignSelf: "center",
    width: 48,
    height: 5,
    borderRadius: 999,
    backgroundColor: "rgba(123,92,255,0.18)",
    marginBottom: 2,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  modalIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "rgba(123,92,255,0.10)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalHeaderText: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: "Poppins-Bold",
    color: theme.colors.text,
    marginBottom: 2,
  },
  modalSubtitle: {
    fontSize: 13,
    lineHeight: 20,
    fontFamily: "Poppins-Regular",
    color: theme.colors.muted,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
  },
});