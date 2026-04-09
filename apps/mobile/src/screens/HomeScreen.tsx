import { useEffect, useMemo, useState, useCallback } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { CompositeScreenProps } from "@react-navigation/native";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import { useAuthStore } from "../store/auth.store";
import { useTasksStore } from "../store/tasks.store";

import { HomeHeader } from "../components/home/HomeHeader";
import { DailyProgressCard } from "../components/home/DailyProgressCard";
import { MascotCharacter } from "../components/MascotCharacter";
import { getMascotState } from "../features/home/utils/getMascotState";
import { NextStepCard } from "../components/home/NextStepCard";
import { TasksListPanel } from "../components/tasks/TaskListPanel";
import { buildHomeTodaySnapshot } from "../features/home/utils/buildHomeTodaySnapshot";

import type { AppStackParamList, AppTabsParamList } from "../navigation/types";
import { TaskStartScreen } from "../screens/TaskStartScreen";
import { AppTabs } from "../navigation/AppTabs";
import type { Task } from "../services/tasks.service";
import {
  fetchTrackingSummary,
  type TrackingSummary,
} from "../services/progress.service";
import { fetchTodayCompletedTaskIds } from "../services/taskCompletions.service";

const Stack = createNativeStackNavigator<AppStackParamList>();

export function AppStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={AppTabs} />
      <Stack.Screen name="TaskStartScreen" component={TaskStartScreen} />
    </Stack.Navigator>
  );
}

function getDisplayName(email?: string) {
  if (!email) return "Ninja";

  const base = email.split("@")[0];

  const cleaned = base
    .replace(/[0-9]+/g, "")
    .replace(/[._-]+/g, " ")
    .trim();

  if (!cleaned) return "Ninja";

  const firstPart = cleaned.split(" ")[0] ?? "Ninja";
  return firstPart.charAt(0).toUpperCase() + firstPart.slice(1);
}

type Props = CompositeScreenProps<
  BottomTabScreenProps<AppTabsParamList, "Home">,
  NativeStackScreenProps<AppStackParamList>
>;

export function HomeScreen({ navigation }: Props) {
  const user = useAuthStore((s) => s.user);

  const tasks = useTasksStore((s) => s.tasks);
  const error = useTasksStore((s) => s.error);
  const loadTasks = useTasksStore((s) => s.loadTasks);
  const toggleTaskDone = useTasksStore((s) => s.toggleTaskDone);
  const removeTask = useTasksStore((s) => s.removeTask);

  const [msg, setMsg] = useState<string | null>(null);
  const [suggestedIndex, setSuggestedIndex] = useState(0);
  const [completedTodayTaskIds, setCompletedTodayTaskIds] = useState<string[]>(
    []
  );
  const [trackingSummary, setTrackingSummary] =
    useState<TrackingSummary | null>(null);

  const loadHomeSnapshotSources = useCallback(async () => {
    const [
      { data: completedData, error: completedError },
      { data: trackingData, error: trackingError },
    ] = await Promise.all([
      fetchTodayCompletedTaskIds(),
      fetchTrackingSummary(),
    ]);

    if (completedError) {
      setCompletedTodayTaskIds([]);
    } else {
      setCompletedTodayTaskIds((completedData ?? []).map((row) => row.task_id));
    }

    if (trackingError) {
      setTrackingSummary(null);
    } else {
      setTrackingSummary(trackingData ?? null);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadTasks();
      loadHomeSnapshotSources();
    }, [loadTasks, loadHomeSnapshotSources])
  );

  const homeSnapshot = useMemo(() => {
    return buildHomeTodaySnapshot({
      tasks,
      completedTodayTaskIds,
      trackingSummary,
    });
  }, [tasks, completedTodayTaskIds, trackingSummary]);

  const {
    todayTasks,
    pendingTodayTasks,
    doneTodayCount,
    totalTodayCount,
    currentStreak,
  } = homeSnapshot;

  const displayName = getDisplayName(user?.email);

  const mascotState = useMemo(
    () =>
      getMascotState({
        completedTasks: doneTodayCount,
        totalTasks: totalTodayCount,
      }),
    [doneTodayCount, totalTodayCount]
  );

  useEffect(() => {
    setSuggestedIndex(0);
  }, [pendingTodayTasks.length]);

  const suggestedTask = useMemo(() => {
    if (pendingTodayTasks.length === 0) return null;
    return pendingTodayTasks[suggestedIndex % pendingTodayTasks.length] ?? null;
  }, [pendingTodayTasks, suggestedIndex]);

  const suggestedTaskTitle = suggestedTask?.title ?? null;

  function handleSeeAnotherSuggestion() {
    if (pendingTodayTasks.length <= 1) return;
    setSuggestedIndex((prev) => (prev + 1) % pendingTodayTasks.length);
  }

  function handleStartSuggestedTask() {
    if (!suggestedTask) return;

    navigation.navigate("TaskStartScreen", {
      taskId: suggestedTask.id,
      taskTitle: suggestedTask.title,
    });
  }

  async function handleToggleTask(task: Task) {
    setMsg(null);

    const isDoneNow =
      task.task_type === "daily"
        ? completedTodayTaskIds.includes(task.id)
        : task.is_done;

    const next = !isDoneNow;
    const result = await toggleTaskDone(task.id, next);

    if (result.error) {
      setMsg(`❌ ${result.error}`);
      return;
    }

    await loadTasks();
    await loadHomeSnapshotSources();
  }

  async function handleDeleteTask(taskId: string) {
    setMsg(null);

    const result = await removeTask(taskId);

    if (result.error) {
      setMsg(`❌ ${result.error}`);
      return;
    }

    await loadTasks();
    await loadHomeSnapshotSources();
  }

  function handleOpenTaskDetail(task: Task) {
    navigation.navigate("TaskDetailScreen", {
      taskId: task.id,
    });
  }

  if (!user) return null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <FlatList
          data={[{ id: "content" }]}
          keyExtractor={(item) => item.id}
          renderItem={() => (
            <View style={styles.todayFocusCard}>
              <View style={styles.todayFocusHeader}>
                <View style={styles.todayFocusBadge}>
                  <Ionicons
                    name="sunny-outline"
                    size={16}
                    color="#7B5CFF"
                  />
                  <Text style={styles.todayFocusBadgeText}>Hoy</Text>
                </View>

                <Text style={styles.todayFocusTitle}>Tu foco del día</Text>

                <Text style={styles.todayFocusSubtitle}>
                  Una vista puntual de las tareas que realmente tocan hoy.
                </Text>
              </View>

              <View style={styles.todayFocusBody}>
                <TasksListPanel
                  tasks={todayTasks}
                  onToggleTask={handleToggleTask}
                  onDeleteTask={handleDeleteTask}
                  onPressTask={handleOpenTaskDetail}
                  completedTodayTaskIds={completedTodayTaskIds}
                />
              </View>
            </View>
          )}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <>
              <View style={styles.heroStack}>
                <HomeHeader name={displayName} />

                <DailyProgressCard
                  doneTasks={doneTodayCount}
                  totalTasks={totalTodayCount}
                  streakDays={currentStreak}
                />

                <View style={styles.heroMascot}>
                  <MascotCharacter state={mascotState} />
                </View>
              </View>

              <NextStepCard
                suggestedTask={suggestedTaskTitle}
                onStart={handleStartSuggestedTask}
                onSeeAnother={handleSeeAnotherSuggestion}
              />

              {msg ? <Text style={styles.message}>{msg}</Text> : null}
              {error ? <Text style={styles.message}>{`❌ ${error}`}</Text> : null}
            </>
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F7F8FC",
  },

  container: {
    flex: 1,
    paddingHorizontal: 20,
  },

  heroStack: {
    position: "relative",
    marginBottom: 10,
    overflow: "visible",
  },

  heroMascot: {
    position: "absolute",
    right: -6,
    top: -6,
    width: 220,
    height: 220,
    zIndex: 20,
  },

  content: {
    paddingTop: 12,
    paddingBottom: 32,
  },

  todayFocusCard: {
    marginTop: 10,
    backgroundColor: "#FFFF",
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "#E7DBFF",
    padding: 14,
  },

  todayFocusHeader: {
    marginBottom: 8,
    paddingHorizontal: 4,
  },

  todayFocusBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F1E8FF",
    borderWidth: 1,
    borderColor: "#DDCFFF",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 10,
  },

  todayFocusBadgeText: {
    fontSize: 12,
    color: "#6E59C8",
    fontFamily: "Poppins-SemiBold",
  },

  todayFocusTitle: {
    fontSize: 22,
    color: "#241F3D",
    fontFamily: "Poppins-Bold",
    marginBottom: 4,
  },

  todayFocusSubtitle: {
    fontSize: 14,
    lineHeight: 21,
    color: "#6C6784",
    fontFamily: "Poppins-Regular",
  },

  todayFocusBody: {
    backgroundColor: "rgba(255,255,255,0.65)",
    borderRadius: 22,
    paddingHorizontal: 6,
    paddingBottom: 2,
  },

  message: {
    marginBottom: 14,
    fontSize: 14,
    color: "#B44C4C",
    fontFamily: "Poppins-Regular",
  },

  pressed: {
    opacity: 0.85,
  },

  disabled: {
    opacity: 0.6,
  },
});