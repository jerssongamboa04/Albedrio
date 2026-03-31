import { useEffect, useMemo, useState, useCallback } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { CompositeScreenProps } from "@react-navigation/native";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";

import { useAuthStore } from "../store/auth.store";
import { useTasksStore } from "../store/tasks.store";

import { HomeHeader } from "../components/home/HomeHeader";
import { DailyProgressCard } from "../components/home/DailyProgressCard";
import { TaskList } from "../components/home/TaskList";
import { MascotCharacter } from "../components/MascotCharacter";
import { getMascotState } from "../features/home/utils/getMascotState";
import { NextStepCard } from "../components/home/NextStepCard";
import { ManageTasksCard } from "../components/home/ManageTasksCard";

import type { AppStackParamList, AppTabsParamList } from "../navigation/types";
import { TaskStartScreen } from "../screens/TaskStartScreen";
import { AppTabs } from "../navigation/AppTabs";
import type { Task } from "../services/tasks.service";

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
  const loading = useTasksStore((s) => s.loading);
  const error = useTasksStore((s) => s.error);
  const loadTasks = useTasksStore((s) => s.loadTasks);
  const toggleTaskDone = useTasksStore((s) => s.toggleTaskDone);
  const removeTask = useTasksStore((s) => s.removeTask);

  const [msg, setMsg] = useState<string | null>(null);
  const [suggestedIndex, setSuggestedIndex] = useState(0);

  useFocusEffect(
    useCallback(() => {
      loadTasks();
    }, [loadTasks])
  );

  async function handleToggleTask(task: Task) {
    setMsg(null);

    const next = !task.is_done;
    const result = await toggleTaskDone(task.id, next);

    if (result.error) {
      setMsg(`❌ ${result.error}`);
    }
  }

  async function handleDeleteTask(taskId: string) {
    setMsg(null);

    const result = await removeTask(taskId);

    if (result.error) {
      setMsg(`❌ ${result.error}`);
    }
  }

  const doneTasks = useMemo(
    () => tasks.filter((task) => task.is_done).length,
    [tasks]
  );

  const pendingTasks = useMemo(
    () => tasks.filter((task) => !task.is_done),
    [tasks]
  );

  const totalTasks = tasks.length;
  const dailyGoal = 5;

  const mascotState = useMemo(
    () =>
      getMascotState({
        completedTasks: doneTasks,
        totalTasks,
      }),
    [doneTasks, totalTasks]
  );

  const progressText = useMemo(() => {
    if (totalTasks === 0) return "Tu día está despejado.";
    if (doneTasks === 0) return "Todo listo para empezar con calma.";
    if (doneTasks >= dailyGoal) return "Misión del día cumplida. Gran trabajo.";
    return "Buen ritmo. Sigue así.";
  }, [totalTasks, doneTasks, dailyGoal]);

  const displayName = getDisplayName(user?.email);

  useEffect(() => {
    setSuggestedIndex(0);
  }, [pendingTasks.length]);

  const suggestedTask = useMemo(() => {
    if (pendingTasks.length === 0) return null;
    return pendingTasks[suggestedIndex % pendingTasks.length] ?? null;
  }, [pendingTasks, suggestedIndex]);

  const suggestedTaskTitle = suggestedTask?.title ?? null;

  function handleSeeAnotherSuggestion() {
    if (pendingTasks.length <= 1) return;
    setSuggestedIndex((prev) => (prev + 1) % pendingTasks.length);
  }

  function handleStartSuggestedTask() {
    if (!suggestedTask) return;

    navigation.navigate("TaskStartScreen", {
      taskId: suggestedTask.id,
      taskTitle: suggestedTask.title,
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
            <TaskList
              tasks={tasks}
              onToggleTask={handleToggleTask}
              onDeleteTask={handleDeleteTask}
            />
          )}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <>
              <View style={styles.heroStack}>
                <HomeHeader name={displayName} />

                <DailyProgressCard
                  doneTasks={doneTasks}
                  totalTasks={totalTasks}
                  streakDays={3}
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

              <ManageTasksCard
                onPress={() => {
                  navigation.navigate("TaskManagementScreen");
                }}
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