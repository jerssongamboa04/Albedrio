import { View, Text, Pressable, StyleSheet } from "react-native";
import type { Task } from "../../services/tasks.service";

type Props = {
  task: Task;
  onToggle: () => void;
  onDelete: () => void;
};

export function TaskItem({ task, onToggle, onDelete }: Props) {
  return (
    <View style={styles.card}>
      <Pressable onPress={onToggle} style={styles.main}>
        <View style={[styles.checkbox, task.is_done && styles.checkboxDone]}>
          {task.is_done ? <Text style={styles.checkboxTick}>✓</Text> : null}
        </View>

        <View style={styles.textBlock}>
          <Text style={[styles.title, task.is_done && styles.titleDone]}>
            {task.title}
          </Text>

          <Text style={styles.status}>
            {task.is_done ? "Completada" : "Pendiente"}
          </Text>
        </View>
      </Pressable>

      <Pressable
        onPress={onDelete}
        style={({ pressed }) => [
          styles.deleteButton,
          pressed && styles.pressed,
        ]}
      >
        <Text style={styles.deleteButtonText}>Borrar</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ECEFF5",
    padding: 14,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  main: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: "#C8D0E0",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  checkboxDone: {
    backgroundColor: "#A8B8FF",
    borderColor: "#A8B8FF",
  },
  checkboxTick: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
  textBlock: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E2430",
  },
  titleDone: {
    textDecorationLine: "line-through",
    color: "#8991A1",
  },
  status: {
    marginTop: 4,
    fontSize: 13,
    color: "#6E7687",
  },
  deleteButton: {
    minHeight: 40,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: "#FFF1F1",
    alignItems: "center",
    justifyContent: "center",
  },
  deleteButtonText: {
    color: "#B44C4C",
    fontSize: 13,
    fontWeight: "700",
  },
  pressed: {
    opacity: 0.85,
  },
});