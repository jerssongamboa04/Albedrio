import { useEffect, useMemo, useState } from "react";
import { View, Text, FlatList, Pressable, StyleSheet } from "react-native";
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

export function HomeScreen() {
    const user = useAuthStore((s) => s.user);

    const [tasks, setTasks] = useState<Task[]>([]);
    const [title, setTitle] = useState("");
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [msg, setMsg] = useState<string | null>(null);

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

    useEffect(() => {
        loadTasks();
    }, []);

    const doneTasks = useMemo(
        () => tasks.filter((task) => task.is_done).length,
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

                            <TaskComposer
                                value={title}
                                onChangeText={setTitle}
                                onSubmit={handleCreateTask}
                                disabled={submitting}
                            />

                            {msg ? <Text style={styles.message}>{msg}</Text> : null}

                            <View style={styles.actionsRow}>
                                <Pressable
                                    onPress={loadTasks}
                                    disabled={loading}
                                    style={({ pressed }) => [
                                        styles.secondaryButton,
                                        pressed && styles.pressed,
                                        loading && styles.disabled,
                                    ]}
                                >
                                    <Text style={styles.secondaryButtonText}>
                                        {loading ? "Actualizando..." : "Refrescar"}
                                    </Text>
                                </Pressable>

                                <Pressable
                                    onPress={async () => signOut()}
                                    style={({ pressed }) => [
                                        styles.ghostButton,
                                        pressed && styles.pressed,
                                    ]}
                                >
                                    <Text style={styles.ghostButtonText}>Cerrar sesión</Text>
                                </Pressable>
                            </View>
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