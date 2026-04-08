import { memo, useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  addMonthsToAnchor,
  buildMonthCalendarCells,
  formatMonthLabel,
  getCurrentMonthAnchorDate,
  WEEKDAY_LABELS,
} from "../../lib/trackingCalendar.config";
import type { TrackingCalendarDayMap } from "../../features/home/types/trackingCalendar.types";

type TrackingCalendarCardProps = {
  monthAnchorDate: Date;
  onChangeMonth: (nextMonth: Date) => void;
  dayStatusByDate: TrackingCalendarDayMap;
};

function normalizeStatus(
  rawDay: TrackingCalendarDayMap[string] | undefined
) {
  const status = rawDay?.status;

  if (status === "goal" || status === "ninja") {
    return "completed";
  }

  return "empty";
}

function isSameMonth(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth()
  );
}

export const TrackingCalendarCard = memo(function TrackingCalendarCard({
  monthAnchorDate,
  onChangeMonth,
  dayStatusByDate,
}: TrackingCalendarCardProps) {
  const cells = useMemo(
    () => buildMonthCalendarCells(monthAnchorDate),
    [monthAnchorDate]
  );

  const currentMonthAnchor = useMemo(() => getCurrentMonthAnchorDate(), []);
  const isViewingCurrentMonth = isSameMonth(
    monthAnchorDate,
    currentMonthAnchor
  );

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Pressable
          onPress={() => onChangeMonth(addMonthsToAnchor(monthAnchorDate, -1))}
          style={styles.monthNavButton}
          hitSlop={10}
        >
          <Text style={styles.monthNavButtonText}>‹</Text>
        </Pressable>

        <Text style={styles.monthLabel}>{formatMonthLabel(monthAnchorDate)}</Text>

        <Pressable
          onPress={() => onChangeMonth(addMonthsToAnchor(monthAnchorDate, 1))}
          style={styles.monthNavButton}
          hitSlop={10}
        >
          <Text style={styles.monthNavButtonText}>›</Text>
        </Pressable>
      </View>

      {!isViewingCurrentMonth ? (
        <Pressable
          onPress={() => onChangeMonth(currentMonthAnchor)}
          style={styles.goTodayButton}
        >
          <Text style={styles.goTodayText}>Volver a este mes</Text>
        </Pressable>
      ) : (
        <View style={styles.goTodaySpacer} />
      )}

      <View style={styles.weekdaysRow}>
        {WEEKDAY_LABELS.map((label) => (
          <View key={label} style={styles.weekdayCell}>
            <Text style={styles.weekdayText}>{label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.grid}>
        {cells.map((cell) => {
          const normalizedStatus = normalizeStatus(dayStatusByDate[cell.isoDate]);
          const isCompleted = normalizedStatus === "completed";

          return (
            <View key={cell.isoDate} style={styles.gridCellWrapper}>
              <View
                style={[
                  styles.dayCell,
                  !cell.isCurrentMonth && styles.dayCellOutsideMonth,
                  cell.isToday && styles.dayCellToday,
                  isCompleted && styles.dayCellCompleted,
                ]}
              >
                <Text
                  style={[
                    styles.dayCellText,
                    !cell.isCurrentMonth && styles.dayCellTextOutsideMonth,
                    cell.isToday && styles.dayCellTextToday,
                    isCompleted && styles.dayCellTextCompleted,
                  ]}
                >
                  {cell.dayNumber}
                </Text>
              </View>
            </View>
          );
        })}
      </View>

      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, styles.legendDotCompleted]} />
          <Text style={styles.legendText}>Completado</Text>
        </View>

        <View style={styles.legendItem}>
          <View style={[styles.legendDot, styles.legendDotToday]} />
          <Text style={styles.legendText}>Hoy</Text>
        </View>

        <View style={styles.legendItem}>
          <View style={[styles.legendDot, styles.legendDotEmpty]} />
          <Text style={styles.legendText}>Sin registro</Text>
        </View>
      </View>
    </View>
  );
});

const COLORS = {
  card: "#FFFFFF",
  border: "#E9E2F9",
  textPrimary: "#2E2341",
  textSecondary: "#857A99",
  accent: "#7C5CFA",
  accentSoft: "#EEE8FF",
  muted: "#F5F2FA",
  mutedBorder: "#ECE7F4",
  mutedText: "#B7AFC7",
  white: "#FFFFFF",
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 24,
    padding: 16,
    marginBottom: 18,
  },

  headerRow: {
    minHeight: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },

  monthLabel: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    color: COLORS.textPrimary,
    fontFamily: "Poppins-Bold",
  },

  monthNavButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.white,
  },

  monthNavButtonText: {
    fontSize: 22,
    lineHeight: 24,
    color: COLORS.textPrimary,
    fontFamily: "Poppins-SemiBold",
  },

  goTodayButton: {
    alignSelf: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: COLORS.accentSoft,
    marginBottom: 14,
  },

  goTodayText: {
    color: COLORS.accent,
    fontSize: 12,
    fontFamily: "Poppins-Bold",
  },

  goTodaySpacer: {
    height: 34,
    marginBottom: 14,
  },

  weekdaysRow: {
    flexDirection: "row",
    marginBottom: 8,
  },

  weekdayCell: {
    width: "14.2857%",
    alignItems: "center",
  },

  weekdayText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontFamily: "Poppins-Bold",
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  gridCellWrapper: {
    width: "14.2857%",
    paddingVertical: 6,
    alignItems: "center",
  },

  dayCell: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "transparent",
  },

  dayCellOutsideMonth: {
    backgroundColor: COLORS.muted,
  },

  dayCellToday: {
    borderColor: COLORS.accent,
    backgroundColor: COLORS.white,
  },

  dayCellCompleted: {
    backgroundColor: COLORS.accentSoft,
    borderColor: COLORS.accentSoft,
  },

  dayCellText: {
    fontSize: 14,
    color: COLORS.textPrimary,
    fontFamily: "Poppins-SemiBold",
  },

  dayCellTextOutsideMonth: {
    color: COLORS.mutedText,
  },

  dayCellTextToday: {
    color: COLORS.accent,
  },

  dayCellTextCompleted: {
    color: COLORS.accent,
  },

  legendRow: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 14,
  },

  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1,
  },

  legendDotCompleted: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },

  legendDotToday: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.accent,
  },

  legendDotEmpty: {
    backgroundColor: COLORS.muted,
    borderColor: COLORS.mutedBorder,
  },

  legendText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontFamily: "Poppins-Medium",
  },
});