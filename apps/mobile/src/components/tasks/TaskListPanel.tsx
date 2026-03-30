import { View, Text, StyleSheet } from "react-native";
import type { Task } from "../../services/tasks.service";
import { TaskList } from "../home/TaskList";
import { theme } from "../../lib/theme";

type TasksListPanelProps = {
  tasks: Task[];
  onToggleTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
};

export function TasksListPanel({
  tasks,
  onToggleTask,
  onDeleteTask,
}: TasksListPanelProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tus tareas</Text>
      <Text style={styles.subtitle}>
        Aquí puedes consultar y gestionar tus tareas actuales.
      </Text>

      <TaskList
        tasks={tasks}
        onToggleTask={onToggleTask}
        onDeleteTask={onDeleteTask}
      />
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
});