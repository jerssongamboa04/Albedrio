import { StyleSheet, Text, View } from "react-native";
import type { Task } from "../../services/tasks.service";
import { TaskRowCard } from "./TaskRowCard";
import { TasksEmptyState } from "../tasks/TaskEmptyState";
import { theme } from "../../lib/theme";
import { Ionicons } from "@expo/vector-icons";

type TasksListPanelProps = {
  tasks: Task[];
  onToggleTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onPressTask?: (task: Task) => void;
};

export function TasksListPanel({
  tasks,
  onToggleTask,
  onDeleteTask,
  onPressTask,
}: TasksListPanelProps) {
  const pendingTasks = tasks.filter((task) => !task.is_done);
  const completedTasks = tasks.filter((task) => task.is_done);

  const hasNoTasks = tasks.length === 0;

  if (hasNoTasks) {
    return (
      <View style={styles.container}>
        <TasksEmptyState
          title="No hay tareas"
          description="Ahora mismo tienes este espacio despejado."
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Ionicons
          name="ellipse-outline"
          size={20}
          color={theme.colors.primary}
        />
        <Text style={styles.sectionTitle}>Pendientes</Text>
      </View>

      <View style={styles.groupCard}>
        {pendingTasks.length > 0 ? (
          pendingTasks.map((task) => (
            <TaskRowCard
              key={task.id}
              task={task}
              onToggle={onToggleTask}
              onDelete={onDeleteTask}
              onPress={onPressTask}
            />
          ))
        ) : (
          <TasksEmptyState
            title="Nada pendiente"
            description="Hoy no tienes tareas pendientes por resolver."
          />
        )}
      </View>

      <View style={[styles.sectionHeader, styles.completedHeader]}>
        <Ionicons name="checkmark-circle" size={20} color="#4D8A5B" />
        <Text style={styles.completedTitle}>Completadas</Text>
      </View>

      <View style={styles.groupCard}>
        {completedTasks.length > 0 ? (
          completedTasks.map((task) => (
            <TaskRowCard
              key={task.id}
              task={task}
              onToggle={onToggleTask}
              onDelete={onDeleteTask}
              onPress={onPressTask}
            />
          ))
        ) : (
          <TasksEmptyState
            title="Aún no hay completadas"
            description="Cuando cierres alguna tarea, aparecerá aquí."
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 18,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
    paddingHorizontal: 4,
  },

  completedHeader: {
    marginTop: 8,
  },

  sectionIcon: {
    fontSize: 24,
  },

  completedIcon: {
    fontSize: 22,
  },

  sectionTitle: {
    fontSize: 22,
    color: theme.colors.text,
    fontFamily: "Poppins-Bold",
  },

  completedTitle: {
    fontSize: 22,
    color: "#4D8A5B",
    fontFamily: "Poppins-Bold",
  },

  groupCard: {
    backgroundColor: "rgba(255,255,255,0.40)",
    borderRadius: 28,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(123,92,255,0.10)",
    marginBottom: 20,
  },
});