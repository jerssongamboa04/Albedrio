import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../../lib/theme";
import type { Task } from "../../services/tasks.service";

type TaskRowCardProps = {
  task: Task;
  onToggle: (task: Task) => void;
  onDelete: (taskId: string) => void;
};

export function TaskRowCard({
  task,
  onToggle,
  onDelete,
}: TaskRowCardProps) {
  const isDone = task.is_done;

  return (
    <View style={[styles.card, isDone && styles.cardDone]}>
      <Pressable
        style={({ pressed }) => [
          styles.checkButton,
          isDone && styles.checkButtonDone,
          pressed && styles.pressed,
        ]}
        onPress={() => onToggle(task)}
      >
        {isDone ? (
          <Ionicons name="checkmark" size={22} color="#FFFFFF" />
        ) : null}
      </Pressable>

      <View style={styles.content}>
        <Text
          style={[styles.title, isDone && styles.titleDone]}
          numberOfLines={2}
        >
          {task.title}
        </Text>

        <Text style={[styles.meta, isDone && styles.metaDone]}>
          {isDone ? "Completada" : "Pendiente"}
        </Text>
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.deleteButton,
          pressed && styles.pressed,
        ]}
        onPress={() => onDelete(task.id)}
      >
        <Text style={styles.deleteText}>Borrar</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 92,
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
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },

  cardDone: {
    backgroundColor: "#FFFDF8",
    borderColor: "rgba(118,196,126,0.16)",
  },

  checkButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#B8AEDF",
    backgroundColor: "#F7F2FF",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  checkButtonDone: {
    backgroundColor: "#76C47E",
    borderColor: "#76C47E",
  },

  content: {
    flex: 1,
    justifyContent: "center",
  },

  title: {
    fontSize: 17,
    lineHeight: 24,
    color: theme.colors.text,
    fontFamily: "Poppins-Bold",
    marginBottom: 4,
  },

  titleDone: {
    color: "#4F5B54",
  },

  meta: {
    fontSize: 14,
    color: "#80789A",
    fontFamily: "Poppins-Regular",
  },

  metaDone: {
    color: "#6B7C6E",
  },

  deleteButton: {
    minHeight: 40,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: "#F2E8F8",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  deleteText: {
    fontSize: 15,
    color: "#8A6AA8",
    fontFamily: "Poppins-SemiBold",
  },

  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.985 }],
  },
});