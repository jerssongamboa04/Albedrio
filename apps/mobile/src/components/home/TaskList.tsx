import { View, Text, StyleSheet } from "react-native";
import type { Task } from "../../services/tasks.service";
import { TaskItem } from "./TaskItem";
import { HomeEmptyState } from "./HomeEmptyState";

type Props = {
  tasks: Task[];
  onToggleTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onAddFirstTask?: () => void;
};

export function TaskList({
  tasks,
  onToggleTask,
  onDeleteTask,
  onAddFirstTask,
}: Props) {
  if (tasks.length === 0) {
    return <HomeEmptyState onAddPress={onAddFirstTask} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Tus tareas de hoy</Text>

      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onToggle={() => onToggleTask(task)}
          onDelete={() => onDeleteTask(task.id)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1E2430",
    marginBottom: 12,
  },
});