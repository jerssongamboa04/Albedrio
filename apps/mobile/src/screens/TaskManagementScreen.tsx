import { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "../lib/theme";
import { TaskTabs, type TaskTabKey } from "../components/tasks/TaskTabs";
import { TasksListPanel } from "../components/tasks/TaskListPanel";
import { CreateTaskPanel } from "../components/tasks/CreateTaskPanel";
import { TasksMetricsPanel } from "../components/tasks/TaskMetricsPanel";
import {
  createTask,
  deleteTask,
  fetchTasks,
  toggleTaskDone,
  type Task,
} from "../services/tasks.service";
import { useAuthStore } from "../store/auth.store";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type { AppTabsParamList } from "../navigation/types";

type Props = BottomTabScreenProps<AppTabsParamList, "TaskManagementScreen">;

export function TaskManagementScreen({ navigation }: Props) {
  const user = useAuthStore((s) => s.user);

  const [activeTab, setActiveTab] = useState<TaskTabKey>("tasks");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function loadTasks() {
    setMsg(null);

    const { data, error } = await fetchTasks();

    if (error) {
      setMsg(`❌ ${error.message}`);
      return;
    }

    setTasks((data ?? []) as Task[]);
  }

  useEffect(() => {
    loadTasks();
  }, []);

  const doneTasks = useMemo(
    () => tasks.filter((task) => task.is_done).length,
    [tasks]
  );

  const pendingTasks = useMemo(
    () => tasks.filter((task) => !task.is_done).length,
    [tasks]
  );

  async function handleCreateTask() {
    if (!user) return;

    const trimmed = title.trim();
    if (!trimmed) return;

    setSubmitting(true);
    setMsg(null);

    const { error } = await createTask(user.id, trimmed);

    if (error) {
      setMsg(`❌ ${error.message}`);
      setSubmitting(false);
      return;
    }

    setTitle("");
    await loadTasks();
    setSubmitting(false);
    setActiveTab("tasks");
  }

  async function handleToggleTask(task: Task) {
    setMsg(null);

    const next = !task.is_done;
    const { error } = await toggleTaskDone(task.id, next);

    if (error) {
      setMsg(`❌ ${error.message}`);
      return;
    }

    await loadTasks();
  }

  async function handleDeleteTask(taskId: string) {
    setMsg(null);

    const { error } = await deleteTask(taskId);

    if (error) {
      setMsg(`❌ ${error.message}`);
      return;
    }

    await loadTasks();
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.root}>
        <View style={styles.bgBubbleOne} />
        <View style={styles.bgBubbleTwo} />
        <View style={styles.bgBubbleThree} />

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.heroCard}>
            <Text style={styles.screenTitle}>Tus tareas</Text>
            <Text style={styles.screenSubtitle}>
              Aquí puedes revisar tus tareas y consultar cómo va tu avance.
            </Text>

            <View style={styles.summaryPill}>
              <Text style={styles.summarySparkle}>✨</Text>
              <Text style={styles.summaryStrong}>{pendingTasks} pendientes</Text>
              <Text style={styles.summaryDot}> · </Text>
              <Text style={styles.summaryText}>{doneTasks} completadas</Text>
            </View>
          </View>

          <View style={styles.tabsCard}>
            <TaskTabs activeTab={activeTab} onChangeTab={setActiveTab} />
          </View>

          {msg ? <Text style={styles.message}>{msg}</Text> : null}

          <View style={styles.panelWrap}>
            {activeTab === "tasks" ? (
              <TasksListPanel
                tasks={tasks}
                onToggleTask={handleToggleTask}
                onDeleteTask={handleDeleteTask}
              />
            ) : null}

            {activeTab === "create" ? (
              <CreateTaskPanel
                value={title}
                onChangeText={setTitle}
                onSubmit={handleCreateTask}
                disabled={submitting}
              />
            ) : null}

            {activeTab === "metrics" ? (
              <TasksMetricsPanel
                totalTasks={tasks.length}
                doneTasks={doneTasks}
                pendingTasks={pendingTasks}
                streakDays={3}
              />
            ) : null}
          </View>
        </ScrollView>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F7F5FC",
  },

  root: {
    flex: 1,
    position: "relative",
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 120,
  },

  heroCard: {
    backgroundColor: "rgba(255,255,255,0.54)",
    borderRadius: 30,
    paddingHorizontal: 18,
    paddingVertical: 22,
    marginBottom: 14,
    overflow: "hidden",
  },

  screenTitle: {
    fontSize: 34,
    color: theme.colors.text,
    fontFamily: "Poppins-Bold",
    textAlign: "center",
    marginBottom: 10,
  },

  screenSubtitle: {
    fontSize: 16,
    lineHeight: 26,
    color: "#625C7A",
    fontFamily: "Poppins-Regular",
    marginBottom: 18,
    textAlign: "left",
  },

  summaryPill: {
    minHeight: 58,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.96)",
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#A48BE4",
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },

  summarySparkle: {
    fontSize: 18,
    marginRight: 8,
  },

  summaryStrong: {
    fontSize: 16,
    color: theme.colors.primaryDark,
    fontFamily: "Poppins-Bold",
  },

  summaryDot: {
    fontSize: 16,
    color: "#8D86A7",
    fontFamily: "Poppins-Regular",
  },

  summaryText: {
    fontSize: 16,
    color: "#5E5876",
    fontFamily: "Poppins-Regular",
  },

  summaryArrow: {
    marginLeft: "auto",
    fontSize: 26,
    color: "#8D86A7",
    fontFamily: "Poppins-Regular",
  },

  tabsCard: {
    backgroundColor: "rgba(255,255,255,0.76)",
    borderRadius: 24,
    padding: 8,
    borderWidth: 1,
    borderColor: "rgba(123,92,255,0.10)",
    marginBottom: 8,
  },

  panelWrap: {
    marginTop: 2,
  },

  message: {
    marginTop: 8,
    marginBottom: 4,
    fontSize: 14,
    color: "#B44C4C",
    fontFamily: "Poppins-Regular",
  },

  bgBubbleOne: {
    position: "absolute",
    top: 28,
    right: 24,
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: "rgba(123,92,255,0.08)",
  },

  bgBubbleTwo: {
    position: "absolute",
    top: 56,
    left: -10,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(123,92,255,0.10)",
  },

  bgBubbleThree: {
    position: "absolute",
    top: 112,
    left: 68,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(123,92,255,0.10)",
  },
});