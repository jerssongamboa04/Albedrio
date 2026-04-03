import { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { theme } from "../lib/theme";
import { useTasksStore } from "../store/tasks.store";
import type { AppStackParamList } from "../navigation/types";
import { buildAntiBlockSuggestion } from "../services/antiBlock.service";

type Props = NativeStackScreenProps<AppStackParamList, "AntiBlockScreen">;

export function AntiBlockScreen({ route, navigation }: Props) {
  const { taskId } = route.params;
  const tasks = useTasksStore((s) => s.tasks);

  const task = useMemo(
    () => tasks.find((item) => item.id === taskId) ?? null,
    [tasks, taskId]
  );

  const suggestion = useMemo(() => {
    if (!task) return null;
    return buildAntiBlockSuggestion(task);
  }, [task]);

  function handleStartWithThis() {
    if (!task) return;

    navigation.navigate("TaskStartScreen", {
      taskId: task.id,
      taskTitle: task.title,
    });
  }

  if (!task || !suggestion) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.notFoundWrap}>
          <Ionicons name="alert-circle-outline" size={34} color="#9C8FD9" />
          <Text style={styles.notFoundTitle}>No hemos podido preparar esta ayuda</Text>
          <Text style={styles.notFoundText}>
            Puede que la tarea ya no exista o que aún no esté disponible.
          </Text>

          <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Volver</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Pressable style={styles.topBackButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={18} color="#6E61A8" />
          <Text style={styles.topBackButtonText}>Volver</Text>
        </Pressable>

        <View style={styles.heroCard}>
          <View style={styles.heroGlow} />
          <View style={styles.heroBubble} />

          <Text style={styles.eyebrow}>Modo anti-bloqueo</Text>
          <Text style={styles.heroTitle}>{suggestion.headline}</Text>
          <Text style={styles.heroSubtitle}>{suggestion.message}</Text>
        </View>

        <View style={styles.taskContextCard}>
          <View style={styles.taskContextHeader}>
            <View style={styles.taskIconWrap}>
              <Ionicons name="document-text-outline" size={18} color="#7B5CFF" />
            </View>

            <View style={styles.taskContextTextWrap}>
              <Text style={styles.taskContextLabel}>Tarea actual</Text>
              <Text style={styles.taskContextTitle}>{task.title}</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconWrap}>
              <Ionicons name="sparkles-outline" size={18} color="#7B5CFF" />
            </View>
            <Text style={styles.sectionTitle}>Tu primer paso</Text>
          </View>

          <View style={styles.primaryStepCard}>
            <Text style={styles.primaryStepText}>{suggestion.micro_step}</Text>
          </View>
        </View>

        {suggestion.optional_step ? (
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconWrap}>
                <Ionicons name="arrow-forward-outline" size={18} color="#7B5CFF" />
              </View>
              <Text style={styles.sectionTitle}>Si te ves con ánimo</Text>
            </View>

            <View style={styles.secondaryStepCard}>
              <Text style={styles.secondaryStepText}>{suggestion.optional_step}</Text>
            </View>
          </View>
        ) : null}

        <View style={styles.footerActions}>
          <Pressable style={styles.secondaryButton} onPress={() => navigation.goBack()}>
            <Text style={styles.secondaryButtonText}>Volver al detalle</Text>
          </Pressable>

          <Pressable style={styles.primaryButton} onPress={handleStartWithThis}>
            <Ionicons name="play-outline" size={18} color="#FFFFFF" />
            <Text style={styles.primaryButtonText}>{suggestion.cta_label}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F7F5FC",
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 36,
    gap: 14,
  },

  topBackButton: {
    alignSelf: "flex-start",
    minHeight: 40,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.86)",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  topBackButtonText: {
    fontSize: 14,
    color: "#6E61A8",
    fontFamily: "Poppins-SemiBold",
  },

  heroCard: {
    position: "relative",
    backgroundColor: "#EFE9FF",
    borderRadius: 28,
    paddingHorizontal: 18,
    paddingVertical: 20,
    overflow: "hidden",
    shadowColor: "#A48BE4",
    shadowOpacity: 0.14,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },

  heroGlow: {
    position: "absolute",
    top: -14,
    right: -8,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(123,92,255,0.10)",
  },

  heroBubble: {
    position: "absolute",
    top: 18,
    right: 18,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "rgba(123,92,255,0.16)",
  },

  eyebrow: {
    fontSize: 13,
    color: "#7B5CFF",
    fontFamily: "Poppins-SemiBold",
    marginBottom: 8,
  },

  heroTitle: {
    fontSize: 28,
    lineHeight: 36,
    color: theme.colors.text,
    fontFamily: "Poppins-Bold",
    marginBottom: 10,
  },

  heroSubtitle: {
    fontSize: 14,
    lineHeight: 24,
    color: "#625C7A",
    fontFamily: "Poppins-Regular",
  },

  taskContextCard: {
    backgroundColor: "rgba(255,255,255,0.94)",
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(123,92,255,0.08)",
  },

  taskContextHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  taskIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: "#F4EEFF",
    alignItems: "center",
    justifyContent: "center",
  },

  taskContextTextWrap: {
    flex: 1,
  },

  taskContextLabel: {
    fontSize: 13,
    color: "#7B5CFF",
    fontFamily: "Poppins-SemiBold",
    marginBottom: 2,
  },

  taskContextTitle: {
    fontSize: 16,
    lineHeight: 23,
    color: theme.colors.text,
    fontFamily: "Poppins-SemiBold",
  },

  card: {
    backgroundColor: "rgba(255,255,255,0.94)",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: "rgba(123,92,255,0.08)",
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
  },

  sectionIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "#F4EEFF",
    alignItems: "center",
    justifyContent: "center",
  },

  sectionTitle: {
    fontSize: 17,
    color: theme.colors.text,
    fontFamily: "Poppins-SemiBold",
  },

  primaryStepCard: {
    borderRadius: 20,
    backgroundColor: "#FAF8FF",
    borderWidth: 1,
    borderColor: "#E7E0FF",
    padding: 16,
  },

  primaryStepText: {
    fontSize: 16,
    lineHeight: 26,
    color: theme.colors.text,
    fontFamily: "Poppins-Medium",
  },

  secondaryStepCard: {
    borderRadius: 20,
    backgroundColor: "#FFF8F3",
    borderWidth: 1,
    borderColor: "#F3E2D1",
    padding: 16,
  },

  secondaryStepText: {
    fontSize: 15,
    lineHeight: 24,
    color: "#725D4B",
    fontFamily: "Poppins-Regular",
  },

  footerActions: {
    gap: 12,
    marginTop: 4,
  },

  secondaryButton: {
    minHeight: 52,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E4DCF8",
    alignItems: "center",
    justifyContent: "center",
  },

  secondaryButtonText: {
    color: "#6E61A8",
    fontSize: 15,
    fontFamily: "Poppins-SemiBold",
  },

  primaryButton: {
    minHeight: 56,
    borderRadius: 20,
    backgroundColor: "#7B5CFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    shadowColor: "#7B5CFF",
    shadowOpacity: 0.22,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Poppins-Bold",
  },

  notFoundWrap: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
  },

  notFoundTitle: {
    fontSize: 22,
    color: theme.colors.text,
    fontFamily: "Poppins-Bold",
    marginTop: 14,
    marginBottom: 8,
    textAlign: "center",
  },

  notFoundText: {
    fontSize: 14,
    lineHeight: 22,
    color: "#6F6886",
    fontFamily: "Poppins-Regular",
    textAlign: "center",
    marginBottom: 20,
  },

  backButton: {
    minHeight: 46,
    paddingHorizontal: 18,
    borderRadius: 16,
    backgroundColor: "#7B5CFF",
    alignItems: "center",
    justifyContent: "center",
  },

  backButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: "Poppins-Bold",
  },
});