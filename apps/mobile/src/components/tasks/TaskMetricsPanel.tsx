import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../../lib/theme";
import type {
  TrackingSummary,
  TrackingDayStatus,
} from "../../services/progress.service";

type TasksMetricsPanelProps = {
  summary: TrackingSummary | null;
  loading?: boolean;
};

const WEEKDAY_LABELS = ["L", "M", "X", "J", "V", "S", "D"];

function getDayBubbleStyle(status: TrackingDayStatus) {
  switch (status) {
    case "progress":
      return {
        backgroundColor: "#EEE7FF",
        borderColor: "#DDD0FF",
        textColor: "#6B56C9",
      };
    case "goal":
      return {
        backgroundColor: "#CDB8FF",
        borderColor: "#B79AF7",
        textColor: "#FFFFFF",
      };
    case "ninja":
      return {
        backgroundColor: "#7B5CFF",
        borderColor: "#7B5CFF",
        textColor: "#FFFFFF",
      };
    case "none":
    default:
      return {
        backgroundColor: "#FBF8FF",
        borderColor: "#EEE7FA",
        textColor: "#9A90B3",
      };
  }
}

export function TasksMetricsPanel({
  summary,
  loading = false,
}: TasksMetricsPanelProps) {
  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.heroCard}>
          <Text style={styles.heroTitle}>Seguimiento</Text>
          <Text style={styles.heroSubtitle}>
            Cargando tu constancia de este mes...
          </Text>
        </View>
      </View>
    );
  }

  if (!summary) {
    return (
      <View style={styles.container}>
        <View style={styles.heroCard}>
          <Text style={styles.heroTitle}>Seguimiento</Text>
          <Text style={styles.heroSubtitle}>
            Todavía no hemos podido leer tus métricas.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.heroCard}>
        <View style={styles.heroTextBlock}>
          <Text style={styles.heroTitle}>Seguimiento</Text>
          <Text style={styles.heroSubtitle}>
            Mira tu constancia con más perspectiva. Aquí verás qué días has
            cumplido y cómo va tu ritmo este mes.
          </Text>
        </View>

        <View style={styles.heroBadge}>
          <Ionicons name="flame-outline" size={16} color="#7B5CFF" />
          <Text style={styles.heroBadgeText}>
            {summary.currentStreak} día{summary.currentStreak === 1 ? "" : "s"}
          </Text>
        </View>
      </View>

      <View style={styles.calendarCard}>
        <View style={styles.calendarHeader}>
          <Text style={styles.calendarTitle}>{summary.monthLabel}</Text>
        </View>

        <View style={styles.weekdaysRow}>
          {WEEKDAY_LABELS.map((label) => (
            <Text key={label} style={styles.weekdayLabel}>
              {label}
            </Text>
          ))}
        </View>

        <View style={styles.calendarGrid}>
          {summary.calendarDays.map((day) => {
            const bubble = getDayBubbleStyle(day.status);

            return (
              <View key={day.date} style={styles.dayCell}>
                <View
                  style={[
                    styles.dayBubble,
                    {
                      backgroundColor: bubble.backgroundColor,
                      borderColor: bubble.borderColor,
                    },
                    day.isToday && styles.todayBubble,
                  ]}
                >
                  <Text
                    style={[
                      styles.dayNumber,
                      { color: bubble.textColor },
                      day.isToday && styles.todayNumber,
                    ]}
                  >
                    {day.dayNumber}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        <View style={styles.legendWrap}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: "#FBF8FF", borderColor: "#EEE7FA" }]} />
            <Text style={styles.legendText}>Sin avance</Text>
          </View>

          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: "#EEE7FF", borderColor: "#DDD0FF" }]} />
            <Text style={styles.legendText}>Con avance</Text>
          </View>

          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: "#CDB8FF", borderColor: "#B79AF7" }]} />
            <Text style={styles.legendText}>Objetivo</Text>
          </View>

          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: "#7B5CFF", borderColor: "#7B5CFF" }]} />
            <Text style={styles.legendText}>Modo ninja</Text>
          </View>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Resumen de compromiso</Text>

      <View style={styles.grid}>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>{summary.currentStreak}</Text>
          <Text style={styles.metricLabel}>Racha actual</Text>
        </View>

        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>{summary.bestStreak}</Text>
          <Text style={styles.metricLabel}>Mejor racha</Text>
        </View>

        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>{summary.activeDaysThisMonth}</Text>
          <Text style={styles.metricLabel}>Días activos</Text>
        </View>

        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>{summary.completionRate}%</Text>
          <Text style={styles.metricLabel}>Cumplimiento</Text>
        </View>
      </View>

      <View style={styles.footerNote}>
        <Ionicons name="sparkles-outline" size={16} color="#8D76E8" />
        <Text style={styles.footerNoteText}>
          Este mes llevas {summary.completedThisMonth} completado
          {summary.completedThisMonth === 1 ? "" : "s"} registrado
          {summary.completedThisMonth === 1 ? "" : "s"}.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 18,
  },

  heroCard: {
    backgroundColor: "rgba(255,255,255,0.72)",
    borderRadius: 28,
    paddingHorizontal: 18,
    paddingVertical: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(123,92,255,0.10)",
  },

  heroTextBlock: {
    marginBottom: 14,
  },

  heroTitle: {
    fontSize: 26,
    color: theme.colors.text,
    fontFamily: "Poppins-Bold",
    marginBottom: 6,
  },

  heroSubtitle: {
    fontSize: 15,
    lineHeight: 24,
    color: "#625C7A",
    fontFamily: "Poppins-Regular",
  },

  heroBadge: {
    alignSelf: "flex-start",
    minHeight: 40,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: "#F4EEFF",
    borderWidth: 1,
    borderColor: "#E5DBFF",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  heroBadgeText: {
    fontSize: 14,
    color: "#6D58C3",
    fontFamily: "Poppins-SemiBold",
  },

  calendarCard: {
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 28,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(123,92,255,0.10)",
    marginBottom: 18,
  },

  calendarHeader: {
    marginBottom: 14,
  },

  calendarTitle: {
    fontSize: 20,
    color: theme.colors.text,
    fontFamily: "Poppins-Bold",
  },

  weekdaysRow: {
    flexDirection: "row",
    marginBottom: 12,
  },

  weekdayLabel: {
    width: "14.285%",
    textAlign: "center",
    fontSize: 12,
    color: "#8B83A5",
    fontFamily: "Poppins-SemiBold",
  },

  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 14,
  },

  dayCell: {
    width: "14.285%",
    alignItems: "center",
    marginBottom: 10,
  },

  dayBubble: {
    width: 38,
    height: 38,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  todayBubble: {
    shadowColor: "#A48BE4",
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },

  dayNumber: {
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
  },

  todayNumber: {
    fontFamily: "Poppins-Bold",
  },

  legendWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1,
  },

  legendText: {
    fontSize: 12,
    color: "#6B6482",
    fontFamily: "Poppins-Medium",
  },

  sectionTitle: {
    fontSize: 20,
    color: theme.colors.text,
    fontFamily: "Poppins-Bold",
    marginBottom: 12,
    paddingHorizontal: 2,
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
    textAlign: "center",
  },

  footerNote: {
    marginTop: 16,
    minHeight: 46,
    borderRadius: 18,
    backgroundColor: "#F6F1FF",
    borderWidth: 1,
    borderColor: "#E9DEFF",
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  footerNoteText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
    color: "#6A6282",
    fontFamily: "Poppins-Medium",
  },
});