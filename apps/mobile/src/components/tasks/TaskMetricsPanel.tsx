import { View, Text, StyleSheet } from "react-native";
import { theme } from "../../lib/theme";

type TasksMetricsPanelProps = {
  totalTasks: number;
  doneTasks: number;
  pendingTasks: number;
  streakDays: number;
};

export function TasksMetricsPanel({
  totalTasks,
  doneTasks,
  pendingTasks,
  streakDays,
}: TasksMetricsPanelProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tu seguimiento</Text>
      <Text style={styles.subtitle}>
        Una lectura rápida de cómo va tu trabajo de hoy.
      </Text>

      <View style={styles.grid}>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>{totalTasks}</Text>
          <Text style={styles.metricLabel}>Totales</Text>
        </View>

        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>{doneTasks}</Text>
          <Text style={styles.metricLabel}>Completadas</Text>
        </View>

        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>{pendingTasks}</Text>
          <Text style={styles.metricLabel}>Pendientes</Text>
        </View>

        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>{streakDays}</Text>
          <Text style={styles.metricLabel}>Racha</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 18,
  },

  title: {
    fontSize: 22,
    color: theme.colors.text,
    fontFamily: "Poppins-Bold",
    marginBottom: 6,
  },

  subtitle: {
    fontSize: 14,
    lineHeight: 22,
    color: theme.colors.muted,
    fontFamily: "Poppins-Regular",
    marginBottom: 14,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },

  metricCard: {
    width: "47%",
    backgroundColor: "rgba(255,255,255,0.88)",
    borderRadius: 22,
    paddingVertical: 18,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: theme.colors.stroke,
    alignItems: "center",
  },

  metricValue: {
    fontSize: 28,
    color: theme.colors.primary,
    fontFamily: "Poppins-Bold",
    marginBottom: 4,
  },

  metricLabel: {
    fontSize: 14,
    color: theme.colors.text,
    fontFamily: "Poppins-SemiBold",
  },
});