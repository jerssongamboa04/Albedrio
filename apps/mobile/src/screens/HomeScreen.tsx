import { useEffect, useState } from "react";
import { View, Text, Button, TextInput, FlatList, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "../store/auth.store";
import { signOut } from "../services/auth.service";
import { createTask, deleteTask, fetchTasks, toggleTaskDone, type Task } from "../services/tasks.service";

export function HomeScreen() {
    const user = useAuthStore((s) => s.user);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [title, setTitle] = useState("");
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState<string | null>(null);

    async function load() {
        setLoading(true);
        setMsg(null);
        const { data, error } = await fetchTasks();
        if (error) setMsg(`❌ ${error.message}`);
        else setTasks((data ?? []) as Task[]);
        setLoading(false);
    }

    useEffect(() => {
        load();
    }, []);

    if (!user) return null;

    return (
        <SafeAreaView style={{ flex: 1, padding: 16 }}>
            <Text style={{ fontSize: 20, fontWeight: "700" }}>Tus tareas</Text>
            <Text style={{ marginTop: 4, opacity: 0.7 }}>{user.email}</Text>

            <View style={{ marginTop: 16, flexDirection: "row", gap: 8 }}>
                <TextInput
                    placeholder="Nueva tarea..."
                    value={title}
                    onChangeText={setTitle}
                    style={{ flex: 1, borderWidth: 1, borderRadius: 10, padding: 10 }}
                />
                <Button
                    title="Añadir"
                    onPress={async () => {
                        const t = title.trim();
                        if (!t) return;
                        setMsg(null);
                        const { error } = await createTask(user.id, t);
                        if (error) setMsg(`❌ ${error.message}`);
                        setTitle("");
                        await load();
                    }}
                />
            </View>

            {msg ? <Text style={{ marginTop: 10 }}>{msg}</Text> : null}
            <View style={{ marginTop: 10 }}>
                <Button title={loading ? "Cargando..." : "Refrescar"} onPress={load} disabled={loading} />
            </View>

            <FlatList
                style={{ marginTop: 16 }}
                data={tasks}
                keyExtractor={(item) => item.id}
                ListEmptyComponent={<Text style={{ marginTop: 20, opacity: 0.7 }}>No tienes tareas aún.</Text>}
                renderItem={({ item }) => (
                    <View
                        style={{
                            padding: 12,
                            borderWidth: 1,
                            borderRadius: 12,
                            marginBottom: 10,
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 10,
                        }}
                    >
                        <Pressable
                            onPress={async () => {
                                const next = !item.is_done;

                                const { data, error } = await toggleTaskDone(item.id, next);

                                if (error) {
                                    setMsg(`❌ Toggle error: ${error.message}`);
                                    return;
                                }

                                console.log("TOGGLED OK:", data);
                                await load();
                            }}
                            style={{ flex: 1 }}
                        >

                            <Text style={{ fontSize: 16, textDecorationLine: item.is_done ? "line-through" : "none" }}>
                                {item.title}
                            </Text>
                            <Text style={{ marginTop: 4, opacity: 0.6, fontSize: 12 }}>
                                {item.is_done ? "✅ Hecha" : "⬜ Pendiente"}
                            </Text>
                        </Pressable>

                        <Button
                            title="Borrar"
                            onPress={async () => {
                                await deleteTask(item.id);
                                await load();
                            }}
                        />
                    </View>
                )}
            />

            <View style={{ marginTop: 8 }}>
                <Button title="Cerrar sesión" onPress={async () => signOut()} />
            </View>
        </SafeAreaView>
    );
}
