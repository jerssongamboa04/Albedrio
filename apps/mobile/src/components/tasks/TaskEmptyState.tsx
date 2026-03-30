import { StyleSheet, Text, View } from "react-native";
import { theme } from "../../lib/theme";

type TasksEmptyStateProps = {
  title?: string;
  description?: string;
};

export function TasksEmptyState({
  title = "No hay tareas",
  description = "Ahora mismo tienes este espacio despejado.",
}: TasksEmptyStateProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.icon}>🗒️</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "rgba(255,255,255,0.72)",
    borderRadius: 28,
    borderWidth: 1,
    borderColor: theme.colors.stroke,
    paddingVertical: 26,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
  },

  icon: {
    fontSize: 38,
    marginBottom: 12,
  },

  title: {
    fontSize: 24,
    color: theme.colors.text,
    fontFamily: "Poppins-Bold",
    textAlign: "center",
    marginBottom: 8,
  },

  description: {
    fontSize: 15,
    lineHeight: 24,
    color: theme.colors.muted,
    fontFamily: "Poppins-Regular",
    textAlign: "center",
    maxWidth: 260,
  },
});