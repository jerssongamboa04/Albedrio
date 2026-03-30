import { useEffect, useMemo, useState } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "../store/auth.store";
import { signOut } from "../services/auth.service";
import {
    createTask,
    deleteTask,
    fetchTasks,
    toggleTaskDone,
    type Task,
} from "../services/tasks.service";
import { HomeHeader } from "../components/home/HomeHeader";
import { DailyProgressCard } from "../components/home/DailyProgressCard";
import { TaskComposer } from "../components/home/TaskComposer";
import { TaskList } from "../components/home/TaskList";
import { MascotCharacter } from "../components/MascotCharacter";
import { getMascotState } from "../features/home/utils/getMascotState";
import { NextStepCard } from "../components/home/NextStepCard";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AppStackParamList } from "../navigation/types";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import { ManageTasksCard } from "../components/home/ManageTasksCard";
type Props = NativeStackScreenProps<AppStackParamList, "Home">;

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

export function HomeScreen({ navigation }: Props) {
    const user = useAuthStore((s) => s.user);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [title, setTitle] = useState("");
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [msg, setMsg] = useState<string | null>(null);
    const [suggestedIndex, setSuggestedIndex] = useState(0);

    async function loadTasks() {
        setLoading(true);
        setMsg(null);

        const { data, error } = await fetchTasks();

        if (error) setMsg(`❌ ${error.message}`);
        else setTasks((data ?? []) as Task[]);

        setLoading(false);
    }

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

    useFocusEffect(
        useCallback(() => {
            loadTasks();
        }, [])
    );

    const doneTasks = useMemo(
        () => tasks.filter((task) => task.is_done).length,
        [tasks]
    );
    const pendingTasks = useMemo(
        () => tasks.filter((task) => !task.is_done),
        [tasks]
    );

    const nextSuggestedTask = useMemo(
        () => pendingTasks[0]?.title ?? null,
        [pendingTasks]
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

    if (!user) return null;
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
    actionsRow: {
        flexDirection: "row",
        gap: 10,
        marginBottom: 8,
    },
    secondaryButton: {
        minHeight: 46,
        paddingHorizontal: 16,
        borderRadius: 14,
        backgroundColor: "#EAEFFD",
        alignItems: "center",
        justifyContent: "center",
    },
    secondaryButtonText: {
        color: "#33406B",
        fontSize: 14,
        fontWeight: "700",
        fontFamily: "Poppins-SemiBold",
    },
    ghostButton: {
        minHeight: 46,
        paddingHorizontal: 16,
        borderRadius: 14,
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#E3E8F2",
        alignItems: "center",
        justifyContent: "center",
    },
    ghostButtonText: {
        color: "#4E5666",
        fontSize: 14,
        fontWeight: "700",
        fontFamily: "Poppins-SemiBold",
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