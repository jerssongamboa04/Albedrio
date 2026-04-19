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
import { useContextStore } from "../store/context.store";

import { HomeHeader } from "../components/home/HomeHeader";
import { DailyProgressCard } from "../components/home/DailyProgressCard";
import { MascotCharacter } from "../components/MascotCharacter";
import { getMascotState } from "../features/home/utils/getMascotState";
import { NextStepCard, type NextStepCardMode } from "../components/home/NextStepCard";
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
import {
  getRecommendedTask,
  getRecommendationReasonText,
} from "../services/nextAction.service";
import { supabase } from "../lib/supabase";

const Stack = createNativeStackNavigator<AppStackParamList>();

type HomeProfileRecord = {
  display_name: string | null;
};

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
  const tasksLoading = useTasksStore((s) => s.loading);
  const error = useTasksStore((s) => s.error);
  const loadTasks = useTasksStore((s) => s.loadTasks);
  const toggleTaskDone = useTasksStore((s) => s.toggleTaskDone);
  const removeTask = useTasksStore((s) => s.removeTask);

  const availableTime = useContextStore((s) => s.availableTime);
  const energyLevel = useContextStore((s) => s.energyLevel);
  const expiresAt = useContextStore((s) => s.expiresAt);
  const setContext = useContextStore((s) => s.setContext);
  const hasValidContext = useContextStore((s) => s.hasValidContext);
  const clearExpiredContext = useContextStore((s) => s.clearExpiredContext);

  const [msg, setMsg] = useState<string | null>(null);
  const [completedTodayTaskIds, setCompletedTodayTaskIds] = useState<string[]>([]);
  const [trackingSummary, setTrackingSummary] =
    useState<TrackingSummary | null>(null);
  const [profileDisplayName, setProfileDisplayName] = useState<string | null>(null);
  const [contextClock, setContextClock] = useState(() => Date.now());

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

  const loadProfileDisplayName = useCallback(async () => {
    if (!user?.id) {
      setProfileDisplayName(null);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        throw error;
      }

      const profileData = data as HomeProfileRecord | null;
      const nextDisplayName = profileData?.display_name?.trim() ?? null;

      setProfileDisplayName(nextDisplayName);
    } catch (error) {
      console.error("Error al cargar el nombre de perfil en Home:", error);
      setProfileDisplayName(null);
    }
  }, [user?.id]);

  useFocusEffect(
    useCallback(() => {
      clearExpiredContext();
      loadTasks();
      loadHomeSnapshotSources();
      loadProfileDisplayName();
    }, [
      clearExpiredContext,
      loadTasks,
      loadHomeSnapshotSources,
      loadProfileDisplayName,
    ])
  );

  useEffect(() => {
    if (!expiresAt) return;

    const intervalId = setInterval(() => {
      clearExpiredContext();
      setContextClock(Date.now());
    }, 30000);

    return () => clearInterval(intervalId);
  }, [expiresAt, clearExpiredContext]);

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

  const fallbackDisplayName = getDisplayName(user?.email);
  const displayName = profileDisplayName || fallbackDisplayName;

  const mascotState = useMemo(
    () =>
      getMascotState({
        completedTasks: doneTodayCount,
        totalTasks: totalTodayCount,
      }),
    [doneTodayCount, totalTodayCount]
  );

  const contextIsValid = useMemo(() => {
    void contextClock;
    return hasValidContext();
  }, [hasValidContext, availableTime, energyLevel, expiresAt, contextClock]);

  const recommendation = useMemo(() => {
    if (!contextIsValid) return null;

    return getRecommendedTask(
      pendingTodayTasks,
      {
        availableTime,
        energyLevel,
      },
      new Date()
    );
  }, [pendingTodayTasks, contextIsValid, availableTime, energyLevel]);

  const recommendationTask = recommendation?.task ?? null;
  const recommendationReason = recommendation
    ? getRecommendationReasonText(recommendation.reasons)
    : null;

  const nextStepCardMode = useMemo<NextStepCardMode>(() => {
    if (pendingTodayTasks.length === 0) {
      return "empty";
    }

    if (!contextIsValid) {
      return "capture";
    }

    return recommendationTask ? "recommendation" : "empty";
  }, [pendingTodayTasks.length, contextIsValid, recommendationTask]);

  const nextStepCardLoading = tasksLoading && contextIsValid;

  const handleContextComplete = useCallback(
    (payload: { availableTime: 5 | 15 | 30 | 60; energyLevel: "low" | "medium" | "high" }) => {
      setContext(payload);
      setContextClock(Date.now());
    },
    [setContext]
  );

  function handleStartSuggestedTask() {
    if (!recommendationTask) return;

    navigation.navigate("TaskStartScreen", {
      taskId: recommendationTask.id,
      taskTitle: recommendationTask.title,
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
                  Lo que hagas hoy también cuenta. Vamos a empezar por aquí.
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
                mode={nextStepCardMode}
                recommendationTitle={recommendationTask?.title ?? null}
                recommendationReason={recommendationReason}
                onContextComplete={handleContextComplete}
                onStart={handleStartSuggestedTask}
                isLoading={nextStepCardLoading}
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