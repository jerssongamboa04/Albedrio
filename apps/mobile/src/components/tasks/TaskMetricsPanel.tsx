import { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  type ImageSourcePropType,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { theme } from "../../lib/theme";
import type { TrackingSummary } from "../../services/progress.service";
import { TrackingCalendarCard } from "../features/TrackingCalendarCard";
import { mapSummaryCalendarDaysToTrackingCalendarDayMap } from "../../features/home/utils/mapSummaryCalenderDays";

type TasksMetricsPanelProps = {
  summary: TrackingSummary | null;
  loading?: boolean;
  albeImageSource?: ImageSourcePropType;
};

function getMonthAnchorDateFromSummary(summary: TrackingSummary | null) {
  const todayDate = summary?.calendarDays.find((day) => day.isToday)?.date;

  if (todayDate) {
    const [year, month] = todayDate.split("-").map(Number);

    if (!Number.isNaN(year) && !Number.isNaN(month)) {
      return new Date(year, month - 1, 1, 12, 0, 0, 0);
    }
  }

  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1, 12, 0, 0, 0);
}

function getHeroMessage(summary: TrackingSummary) {
  if (summary.completionRate >= 80) {
    return "Muy buena constancia. Este mes estás cerrando lo que te propones.";
  }

  if (summary.completionRate >= 60) {
    return "Vas construyendo un ritmo sólido. Lo importante es que no se corte.";
  }

  if (summary.completedThisMonth > 0) {
    return "Ya hay movimiento este mes. Seguimos sumando paso a paso.";
  }

  return "Todavía estamos arrancando, pero una sola tarea ya cambia el día.";
}

function getFooterMessage(summary: TrackingSummary) {
  if (summary.completedThisMonth === 0) {
    return "Aún no has cerrado tareas este mes, pero todo empieza con la primera.";
  }

  if (summary.completedThisMonth === 1) {
    return "Ya has cerrado 1 tarea este mes. Buen comienzo.";
  }

  return `Ya has cerrado ${summary.completedThisMonth} tareas este mes. Se está notando el avance.`;
}

export function TasksMetricsPanel({
  summary,
  loading = false,
  albeImageSource,
}: TasksMetricsPanelProps) {
  const trackingCalendarDays = useMemo(() => {
    if (!summary) {
      return {};
    }

    return mapSummaryCalendarDaysToTrackingCalendarDayMap(summary.calendarDays);
  }, [summary]);

  const initialMonthAnchorDate = useMemo(() => {
    return getMonthAnchorDateFromSummary(summary);
  }, [summary]);

  const [monthAnchorDate, setMonthAnchorDate] = useState<Date>(
    initialMonthAnchorDate
  );

  useEffect(() => {
    setMonthAnchorDate(initialMonthAnchorDate);
  }, [initialMonthAnchorDate]);

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

  const hasStreak = summary.currentStreak > 0;

  return (
    <View style={styles.container}>
      <View style={styles.heroCard}>
        <View style={styles.heroRow}>
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>Seguimiento</Text>
            <Text style={styles.heroSubtitle}>
              Mira tu constancia con más perspectiva y comprueba cómo va tu mes.
            </Text>

            <Text style={styles.heroMessage}>{getHeroMessage(summary)}</Text>

            <View style={styles.heroBadgesRow}>
              <View style={styles.heroBadge}>
                <Ionicons
                  name={hasStreak ? "flame" : "flame-outline"}
                  size={22}
                  color={hasStreak ? "#FF5A4F" : "#9F95BB"}
                />
                <Text
                  style={[
                    styles.heroBadgeText,
                    hasStreak && styles.heroBadgeTextActive,
                  ]}
                >
                  {summary.currentStreak} día
                  {summary.currentStreak === 1 ? "" : "s"} de racha
                </Text>
              </View>

              <View style={styles.heroSuccessBadge}>
                <Ionicons
                  name="checkmark-circle"
                  size={18}
                  color="#5F8B1C"
                />
                <Text style={styles.heroSuccessBadgeText}>
                  {summary.completionRate}% cumplido
                </Text>
              </View>
            </View>
          </View>

          {albeImageSource ? (
            <Image
              source={albeImageSource}
              resizeMode="contain"
              style={styles.heroImage}
            />
          ) : null}
        </View>
      </View>

      <TrackingCalendarCard
        monthAnchorDate={monthAnchorDate}
        onChangeMonth={setMonthAnchorDate}
        dayStatusByDate={trackingCalendarDays}
      />

      <Text style={styles.sectionTitle}>Resumen de constancia</Text>

      <View style={styles.grid}>
        <View style={[styles.metricCard, styles.metricCardHighlight]}>
          <View style={styles.metricIconWrapHighlight}>
            <Ionicons
              name="checkmark-done-outline"
              size={18}
              color="#5F8B1C"
            />
          </View>
          <Text style={[styles.metricValue, styles.metricValueHighlight]}>
            {summary.completionRate}%
          </Text>
          <Text style={styles.metricLabel}>Cumplimiento</Text>
        </View>

        <View style={styles.metricCard}>
          <View style={styles.metricIconWrap}>
            <Ionicons name="flame-outline" size={18} color="#7B5CFF" />
          </View>
          <Text style={styles.metricValue}>{summary.currentStreak}</Text>
          <Text style={styles.metricLabel}>Racha actual</Text>
        </View>

        <View style={styles.metricCard}>
          <View style={styles.metricIconWrap}>
            <Ionicons name="trophy-outline" size={18} color="#7B5CFF" />
          </View>
          <Text style={styles.metricValue}>{summary.bestStreak}</Text>
          <Text style={styles.metricLabel}>Mejor racha</Text>
        </View>

        <View style={styles.metricCard}>
          <View style={styles.metricIconWrap}>
            <Ionicons
              name="calendar-clear-outline"
              size={18}
              color="#7B5CFF"
            />
          </View>
          <Text style={styles.metricValue}>{summary.activeDaysThisMonth}</Text>
          <Text style={styles.metricLabel}>Días activos</Text>
        </View>
      </View>

      <View style={styles.footerNote}>
        <Ionicons name="sparkles" size={18} color="#8D76E8" />
        <Text style={styles.footerNoteText}>{getFooterMessage(summary)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 18,
  },

  heroCard: {
    backgroundColor: "rgba(255,255,255,0.84)",
    borderRadius: 28,
    paddingHorizontal: 18,
    paddingVertical: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(123,92,255,0.10)",
  },

  heroRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },

  heroContent: {
    flex: 1,
  },

  heroImage: {
    width: 110,
    height: 110,
  },

  heroTitle: {
    fontSize: 26,
    color: theme.colors.text,
    fontFamily: "Poppins-Bold",
    marginBottom: 6,
  },

  heroSubtitle: {
    fontSize: 15,
    lineHeight: 23,
    color: "#625C7A",
    fontFamily: "Poppins-Regular",
    marginBottom: 10,
  },

  heroMessage: {
    fontSize: 14,
    lineHeight: 21,
    color: "#4F4870",
    fontFamily: "Poppins-SemiBold",
    marginBottom: 14,
  },

  heroBadgesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  heroBadge: {
    minHeight: 42,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: "#F6F1FF",
    borderWidth: 1,
    borderColor: "#E5DBFF",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  heroBadgeText: {
    fontSize: 14,
    color: "#756C91",
    fontFamily: "Poppins-SemiBold",
  },

  heroBadgeTextActive: {
    color: "#5B496E",
  },

  heroSuccessBadge: {
    minHeight: 42,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: "#F2F8E6",
    borderWidth: 1,
    borderColor: "#DCECB6",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  heroSuccessBadgeText: {
    fontSize: 14,
    color: "#567C1B",
    fontFamily: "Poppins-SemiBold",
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
    justifyContent: "space-between",
    rowGap: 12,
  },

  metricCard: {
    width: "48%",
    backgroundColor: "rgba(255,255,255,0.88)",
    borderRadius: 22,
    paddingVertical: 18,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: theme.colors.stroke,
    alignItems: "center",
  },

  metricCardHighlight: {
    backgroundColor: "#FBFDF4",
    borderColor: "#DCECB6",
  },

  metricIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#F3EEFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },

  metricIconWrapHighlight: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#EEF7DD",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },

  metricValue: {
    fontSize: 28,
    color: theme.colors.primary,
    fontFamily: "Poppins-Bold",
    marginBottom: 4,
  },

  metricValueHighlight: {
    color: "#567C1B",
  },

  metricLabel: {
    fontSize: 14,
    color: theme.colors.text,
    fontFamily: "Poppins-SemiBold",
    textAlign: "center",
  },

  footerNote: {
    marginTop: 16,
    minHeight: 50,
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