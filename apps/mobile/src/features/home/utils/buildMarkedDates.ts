import type {
  TrackingCalendarDayMap,
  TrackingCalendarStatus,
} from "../types/trackingCalendar.types";

type CalendarCustomStyle = {
  container: {
    backgroundColor: string;
    borderColor: string;
    borderWidth: number;
    borderRadius: number;
  };
  text: {
    color: string;
    fontFamily: string;
  };
};

export type TrackingMarkedDates = Record<
  string,
  {
    customStyles: CalendarCustomStyle;
  }
>;

function getStatusStyles(status: TrackingCalendarStatus) {
  switch (status) {
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

type BuildMarkedDatesParams = {
  days: TrackingCalendarDayMap;
  selectedDate?: string;
};

export function buildMarkedDates({
  days,
  selectedDate,
}: BuildMarkedDatesParams): TrackingMarkedDates {
  const markedDates: TrackingMarkedDates = {};

  Object.values(days).forEach((day) => {
    const styles = getStatusStyles(day.status);
    const isSelected = selectedDate === day.date;
    const isToday = !!day.isToday;

    markedDates[day.date] = {
      customStyles: {
        container: {
          backgroundColor: styles.backgroundColor,
          borderColor: isSelected
            ? "#4F3DB8"
            : isToday
              ? "#7B5CFF"
              : styles.borderColor,
          borderWidth: isSelected || isToday ? 2 : 1,
          borderRadius: 14,
        },
        text: {
          color: styles.textColor,
          fontFamily: isSelected ? "Poppins-Bold" : "Poppins-SemiBold",
        },
      },
    };
  });

  return markedDates;
}