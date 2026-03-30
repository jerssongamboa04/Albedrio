import { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
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
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AppStackParamList } from "../navigation/types";

type Props = NativeStackScreenProps<AppStackParamList, "TaskManagementScreen">;

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
            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.screenTitle}>Tareas</Text>
                <Text style={styles.screenSubtitle}>
                    Gestiona tus tareas, crea nuevas y consulta tu seguimiento.
                </Text>

                <TaskTabs activeTab={activeTab} onChangeTab={setActiveTab} />

                {msg ? <Text style={styles.message}>{msg}</Text> : null}

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
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#F7F8FC",
    },

    content: {
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 32,
    },

    screenTitle: {
        fontSize: 28,
        color: theme.colors.text,
        fontFamily: "Poppins-Bold",
        marginBottom: 6,
    },

    screenSubtitle: {
        fontSize: 15,
        lineHeight: 24,
        color: theme.colors.muted,
        fontFamily: "Poppins-Regular",
        marginBottom: 16,
    },

    message: {
        marginTop: 14,
        fontSize: 14,
        color: "#B44C4C",
        fontFamily: "Poppins-Regular",
    },
});