import { View, Text, Pressable, StyleSheet } from "react-native";
import { theme } from "../../lib/theme";

type NextStepCardProps = {
  title?: string;
  suggestedTask?: string | null;
  onStart?: () => void;
  onSeeAnother?: () => void;
  isLoading?: boolean;
};

export function NextStepCard({
  title = "Tarea Recomendada",
  suggestedTask,
  onStart,
  onSeeAnother,
  isLoading = false,
}: NextStepCardProps) {
  const hasTask = !!suggestedTask && suggestedTask.trim().length > 0;

  const mainText = isLoading
    ? "Buscando tu siguiente paso..."
    : hasTask
      ? suggestedTask
      : "Hoy ya has despejado tus pasos.";

  const primaryButtonLabel = hasTask ? "Empezar" : "Añadir un paso";

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.icon}>✨</Text>
        <Text style={styles.title}>{title}</Text>
      </View>

      <View style={styles.contentBox}>
        <Text
          style={[
            styles.taskText,
            !hasTask && !isLoading ? styles.emptyTaskText : null,
          ]}
          numberOfLines={2}
        >
          {mainText}
        </Text>

        <Pressable
          style={({ pressed }) => [
            styles.primaryButton,
            pressed && styles.primaryButtonPressed,
          ]}
          onPress={onStart}
        >
          <Text style={styles.primaryButtonText}>{primaryButtonLabel}</Text>
        </Pressable>
      </View>

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
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.xl,
    padding: theme.spacing(2.5),
    borderWidth: 1,
    borderColor: theme.colors.stroke,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing(2),
    gap: theme.spacing(1),
  },

  icon: {
    fontSize: 18,
  },

  title: {
    fontSize: 20,
    fontWeight: "700",
    color: theme.colors.text,
  },

  contentBox: {
    backgroundColor: "#F8F4FF",
    borderRadius: theme.radius.lg,
    paddingVertical: theme.spacing(2),
    paddingHorizontal: theme.spacing(2),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing(1.5),
  },

  taskText: {
    flex: 1,
    fontSize: 17,
    lineHeight: 23,
    fontWeight: "600",
    color: theme.colors.text,
  },

  emptyTaskText: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "500",
    color: theme.colors.muted,
  },

  primaryButton: {
    minWidth: 118,
    paddingHorizontal: theme.spacing(2),
    paddingVertical: theme.spacing(1.6),
    borderRadius: 18,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  primaryButtonPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },

  primaryButtonText: {
    fontSize: theme.typography.button,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  secondaryButton: {
    alignSelf: "flex-end",
    marginTop: theme.spacing(1.5),
    minHeight: 40,
    paddingHorizontal: theme.spacing(1.75),
    paddingVertical: theme.spacing(1),
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.stroke,
    backgroundColor: "rgba(255,255,255,0.7)",
  },

  secondaryButtonPressed: {
    opacity: 0.9,
  },

  secondaryButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: theme.colors.primaryDark,
  },
});