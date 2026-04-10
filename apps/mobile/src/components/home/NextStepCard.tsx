import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../../lib/theme";

type NextStepCardProps = {
  title?: string;
  suggestedTask?: string | null;
  onStart?: () => void;
  onSeeAnother?: () => void;
  isLoading?: boolean;
};

export function NextStepCard({
  title = "Tu siguiente paso",
  suggestedTask,
  onStart,
  onSeeAnother,
  isLoading = false,
}: NextStepCardProps) {
  const hasTask = !!suggestedTask && suggestedTask.trim().length > 0;

  const mainText = isLoading
    ? "Buscando el mejor punto de partida para ti..."
    : hasTask
      ? suggestedTask
      : "Hoy ya has despejado todo lo importante.";

  const primaryButtonLabel = hasTask ? "Empezar ahora" : "Añadir una tarea";

  return (
    <View style={styles.card}>
      <View style={styles.topBadge}>
        <Ionicons name="sparkles-outline" size={14} color="#6E59C8" />
        <Text style={styles.topBadgeText}>Recomendación de Albe</Text>
      </View>

      <View style={styles.headerRow}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.iconWrap}>
          <Ionicons name="flash-outline" size={18} color="#1f8705" />
        </View>
      </View>

      <View style={styles.contentBox}>
        <Text
          style={[
            styles.taskText,
            !hasTask && !isLoading ? styles.emptyTaskText : null,
          ]}
          numberOfLines={3}
        >
          {mainText}
        </Text>
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.primaryButton,
          pressed && styles.primaryButtonPressed,
        ]}
        onPress={onStart}
      >
        <Text style={styles.primaryButtonText}>{primaryButtonLabel}</Text>
        <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
      </Pressable>

      {hasTask && !isLoading ? (
        <Pressable
          style={({ pressed }) => [
            styles.secondaryButton,
            pressed && styles.secondaryButtonPressed,
          ]}
          onPress={onSeeAnother}
        >
          <Text style={styles.secondaryButtonText}>Ver otra opción</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#F6F1FF",
    borderRadius: 28,
    padding: theme.spacing(2.5),
    borderWidth: 1,
    borderColor: "#E7DBFF",
    shadowColor: "#A48BE4",
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
    marginBottom: 16,
  },

  topBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F1E8FF",
    borderWidth: 1,
    borderColor: "#DDCFFF",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: theme.spacing(1.5),
  },

  topBadgeText: {
    fontSize: 12,
    color: "#6E59C8",
    fontFamily: "Poppins-SemiBold",
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: theme.spacing(1.75),
    gap: theme.spacing(1.5),
  },

  title: {
    flex: 1,
    fontSize: 24,
    color: theme.colors.text,
    fontFamily: "Poppins-Bold",
  },

  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#EEE4FF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#1f8705",
  },

  contentBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    paddingVertical: theme.spacing(2.1),
    paddingHorizontal: theme.spacing(2),
    borderWidth: 1,
    borderColor: "#E9E2F6",
    marginBottom: theme.spacing(1.75),
  },

  taskText: {
    fontSize: 18,
    lineHeight: 26,
    color: theme.colors.text,
    fontFamily: "Poppins-SemiBold",
  },

  emptyTaskText: {
    fontSize: 16,
    lineHeight: 24,
    color: theme.colors.muted,
    fontFamily: "Poppins-Medium",
  },

  primaryButton: {
    minHeight: 52,
    paddingHorizontal: theme.spacing(2.2),
    borderRadius: 18,
    backgroundColor: theme.colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  primaryButtonPressed: {
    opacity: 0.94,
    transform: [{ scale: 0.985 }],
  },

  primaryButtonText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontFamily: "Poppins-Bold",
  },

  secondaryButton: {
    alignSelf: "center",
    marginTop: theme.spacing(1.5),
    minHeight: 38,
    paddingHorizontal: theme.spacing(1.75),
    paddingVertical: theme.spacing(0.9),
    borderRadius: 16,
    backgroundColor: "transparent",
  },

  secondaryButtonPressed: {
    opacity: 0.88,
  },

  secondaryButtonText: {
    fontSize: 14,
    color: theme.colors.primaryDark,
    fontFamily: "Poppins-SemiBold",
  },
});