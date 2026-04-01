import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../../lib/theme";
import type { Task } from "../../services/tasks.service";

type TaskRowCardProps = {
  task: Task;
  onToggle: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onPress?: (task: Task) => void;
};

function getPriorityLabel(priority: Task["priority"]) {
  switch (priority) {
    case "low":
      return "Baja";
    case "medium":
      return "Media";
    case "high":
      return "Alta";
    default:
      return "Media";
  }
}

function getPriorityStyles(priority: Task["priority"]) {
  switch (priority) {
    case "low":
      return {
        chipBg: "#EEF8F1",
        chipBorder: "#D6EEDF",
        iconColor: "#76B78B",
        textColor: "#567563",
      };
    case "medium":
      return {
        chipBg: "#FFF3EA",
        chipBorder: "#F6DDC9",
        iconColor: "#E09A5A",
        textColor: "#8A6542",
      };
    case "high":
      return {
        chipBg: "#FCECF3",
        chipBorder: "#F3D7E4",
        iconColor: "#D978A4",
        textColor: "#8A5771",
      };
    default:
      return {
        chipBg: "#F7F4FF",
        chipBorder: "#E7E0FF",
        iconColor: "#7B5CFF",
        textColor: "#5F5878",
      };
  }
}

function formatDueDate(value: string | null) {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "short",
  }).format(date);
}

function formatEstimatedMinutes(value: number | null) {
  if (!value) return null;
  if (value >= 60) return "1 h o +";
  return `${value} min`;
}

export function TaskRowCard({
  task,
  onToggle,
  onDelete,
  onPress,
}: TaskRowCardProps) {
  const isDone = task.is_done;
  const priorityLabel = getPriorityLabel(task.priority);
  const priorityStyles = getPriorityStyles(task.priority);
  const estimatedLabel = formatEstimatedMinutes(task.estimated_minutes);
  const dueDateLabel =
    task.task_type === "one_time" ? formatDueDate(task.due_date) : null;

  return (
    <Pressable
      onPress={() => onPress?.(task)}
      style={({ pressed }) => [
        styles.card,
        isDone && styles.cardDone,
        pressed && onPress ? styles.cardPressed : null,
      ]}
    >
      <Pressable
        style={({ pressed }) => [
          styles.checkButton,
          isDone && styles.checkButtonDone,
          pressed && styles.pressed,
        ]}
        onPress={() => onToggle(task)}
      >
        {isDone ? (
          <Ionicons name="checkmark" size={18} color="#FFFFFF" />
        ) : (
          <View style={styles.emptyCheckCircle} />
        )}
      </Pressable>

      <View style={styles.content}>
        <Text
          style={[styles.title, isDone && styles.titleDone]}
          numberOfLines={2}
        >
          {task.title}
        </Text>

        <View style={styles.metaRow}>
          <View
            style={[
              styles.metaChip,
              {
                backgroundColor: priorityStyles.chipBg,
                borderColor: priorityStyles.chipBorder,
              },
            ]}
          >
            <Ionicons name="flame-outline" size={14} color={priorityStyles.iconColor} />
            <Text
              style={[
                styles.metaText,
                { color: priorityStyles.textColor, fontFamily: "Poppins-SemiBold" },
              ]}
            >
              {priorityLabel}
            </Text>
          </View>

          {estimatedLabel ? (
            <View style={[styles.metaChip, styles.timeChip]}>
              <Ionicons name="time-outline" size={14} color="#7B5CFF" />
              <Text style={styles.metaText}>{estimatedLabel}</Text>
            </View>
          ) : null}

          {dueDateLabel ? (
            <View style={[styles.metaChip, styles.dateChip]}>
              <Ionicons name="calendar-outline" size={14} color="#7B5CFF" />
              <Text style={styles.metaText}>{dueDateLabel}</Text>
            </View>
          ) : null}
        </View>
      </View>

      <View style={styles.actions}>
        {onPress ? (
          <View style={styles.chevronWrap}>
            <Ionicons
              name="chevron-forward-outline"
              size={18}
              color="#9A92B3"
            />
          </View>
        ) : null}

        <Pressable
          style={({ pressed }) => [
            styles.deleteButton,
            pressed && styles.pressed,
          ]}
          onPress={() => onDelete(task.id)}
        >
          <Ionicons name="trash-outline" size={16} color="#8A6AA8" />
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 96,
    backgroundColor: "rgba(255,255,255,0.96)",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(123,92,255,0.10)",
    shadowColor: "#A48BE4",
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },

  cardDone: {
    backgroundColor: "#FFFDF8",
    borderColor: "rgba(118,196,126,0.16)",
  },

  cardPressed: {
    opacity: 0.96,
    transform: [{ scale: 0.995 }],
  },

  checkButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#DDD3F8",
    backgroundColor: "#FBF9FF",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  checkButtonDone: {
    backgroundColor: "#7B5CFF",
    borderColor: "#7B5CFF",
  },

  emptyCheckCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.8,
    borderColor: "#BCAEE9",
    backgroundColor: "transparent",
  },

  content: {
    flex: 1,
    justifyContent: "center",
  },

  title: {
    fontSize: 16,
    lineHeight: 23,
    color: theme.colors.text,
    fontFamily: "Poppins-SemiBold",
    marginBottom: 10,
  },

  titleDone: {
    color: "#8F87A8",
    textDecorationLine: "line-through",
  },

  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  metaChip: {
    minHeight: 31,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  timeChip: {
    backgroundColor: "#F3EEFF",
    borderColor: "#E4DBFF",
  },

  dateChip: {
    backgroundColor: "#F7F1FF",
    borderColor: "#E9E0F7",
  },

  metaText: {
    fontSize: 12,
    color: "#5F5878",
    fontFamily: "Poppins-Medium",
  },

  actions: {
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginLeft: 4,
  },

  chevronWrap: {
    width: 28,
    alignItems: "center",
    justifyContent: "center",
  },

  deleteButton: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: "#F2E8F8",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.985 }],
  },
});