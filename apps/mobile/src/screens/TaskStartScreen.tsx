import { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, Pressable, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { theme } from "../lib/theme";
import { toggleTaskDone } from "../services/tasks.service";
import type { AppStackParamList } from "../navigation/types";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSequence,
    withTiming,
    Easing,
} from "react-native-reanimated";
type Props = NativeStackScreenProps<AppStackParamList, "TaskStartScreen">;

export function TaskStartScreen({ route, navigation }: Props) {
    const { taskId, taskTitle } = route.params;

    const [count, setCount] = useState(3);
    const [isCompleting, setIsCompleting] = useState(false);
    const [msg, setMsg] = useState<string | null>(null);
    const [isFinalPhase, setIsFinalPhase] = useState(false);
    const scale = useSharedValue(1);
    const glowOpacity = useSharedValue(0.42);
    const finalMessage = "¡A por ello!";
    useEffect(() => {
        if (isFinalPhase) return;

        scale.value = withSequence(
            withTiming(1.08, {
                duration: 220,
                easing: Easing.out(Easing.ease),
            }),
            withTiming(1, {
                duration: 220,
                easing: Easing.out(Easing.ease),
            })
        );

        glowOpacity.value = withSequence(
            withTiming(0.62, { duration: 220 }),
            withTiming(0.42, { duration: 220 })
        );

        if (count <= 1) {
            const finalTimer = setTimeout(() => {
                setIsFinalPhase(true);
            }, 850);

            return () => clearTimeout(finalTimer);
        }

        const timer = setTimeout(() => {
            setCount((prev) => prev - 1);
        }, 1000);

        return () => clearTimeout(timer);
    }, [count, isFinalPhase, scale, glowOpacity]);

    const countdownLabel = useMemo(() => {
        if (count === 3) return "Prepárate";
        if (count === 2) return "Ya casi";
        return "Vamos";
    }, [count]);

    async function handleCompleteTask() {
        setIsCompleting(true);
        setMsg(null);

        const { error } = await toggleTaskDone(taskId, true);

        if (error) {
            setMsg(`❌ ${error.message}`);
            setIsCompleting(false);
            return;
        }

        navigation.goBack();
    }

    function handleGoBack() {
        navigation.goBack();
    }
    const animatedInnerStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value }],
        };
    });

    const animatedOuterStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: 1 }],
        };
    });

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <View style={styles.topBlock}>
                    <View style={styles.heroRow}>
                        <Image
                            source={require("../../assets/characters/AlbeNinja.png")}
                            style={styles.mascot}
                            resizeMode="contain"
                        />

                        <View style={styles.speechBubble}>
                            <Text style={styles.speechTitle}>¡Tu Puedes!✨</Text>
                        </View>
                    </View>

                    <View style={styles.countdownWrap}>
                        <Animated.View style={[styles.countdownOuter, animatedOuterStyle]}>
                            <Animated.View style={[styles.countdownInner, animatedInnerStyle]}>
                                {!isFinalPhase ? (
                                    <>
                                        <Text style={styles.countdownNumber}>{count}</Text>
                                        <Text style={styles.countdownLabel}>{countdownLabel}</Text>
                                    </>
                                ) : (
                                    <View style={styles.finalPhaseWrap}>
                                        <Text style={styles.finalPhaseText}>{finalMessage}</Text>
                                    </View>
                                )}
                            </Animated.View>
                        </Animated.View>
                    </View>

                    <View style={styles.taskCard}>
                        <Text style={styles.taskLabel}>Tu tarea ahora</Text>
                        <Text style={styles.taskTitle}>{taskTitle}</Text>
                    </View>

                    {msg ? <Text style={styles.message}>{msg}</Text> : null}
                </View>

                <View style={styles.actionsRow}>
                    <Pressable
                        style={({ pressed }) => [
                            styles.primaryButton,
                            pressed && styles.pressed,
                            isCompleting && styles.disabled,
                        ]}
                        onPress={handleCompleteTask}
                        disabled={isCompleting}
                    >
                        <Text style={styles.primaryButtonText}>
                            {isCompleting ? "Guardando..." : "Marcar completada"}
                        </Text>
                    </Pressable>

                    <Pressable
                        style={({ pressed }) => [
                            styles.secondaryButton,
                            pressed && styles.pressed,
                        ]}
                        onPress={handleGoBack}
                    >
                        <Text style={styles.secondaryButtonText}>Volver atrás</Text>
                    </Pressable>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#63D48B",
    },

    container: {
        flex: 1,
        paddingHorizontal: 22,
        paddingTop: 10,
        paddingBottom: 24,
        justifyContent: "space-between",
    },

    topBlock: {
        flexShrink: 1,
    },

    heroRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
        marginTop: 4,
        marginBottom: 12,
    },

    mascot: {
        width: 200,
        height: 200,
    },

    speechBubble: {
        flex: 1,
        backgroundColor: "rgba(255,255,255,0.92)",
        borderRadius: 22,
        paddingHorizontal: 4,
        paddingVertical: 12,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },

    speechTitle: {
        fontSize: 18,
        color: theme.colors.text,
        fontFamily: "Poppins-Bold",

    },

    speechText: {
        fontSize: 14,
        lineHeight: 18,
        color: theme.colors.muted,
        fontFamily: "Poppins-Regular",
    },

    countdownWrap: {
        alignItems: "center",
        marginTop: 4,
        marginBottom: 14,
    },

    countdownOuter: {
        width: 270,
        height: 270,
        borderRadius: 135,
        backgroundColor: "rgba(255,255,255,0.42)",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 6,
        borderColor: "rgba(255,255,255,0.80)",
    },

    countdownInner: {
        width: 232,
        height: 232,
        borderRadius: 116,
        backgroundColor: "#6A4FF2",
        alignItems: "center",
        justifyContent: "center",
    },

    countdownNumber: {
        fontSize: 108,
        color: "#FFFFFF",
        fontFamily: "Poppins-Bold",
        lineHeight: 116,
        paddingTop: 8
    },

    countdownLabel: {
        marginTop: 2,
        fontSize: 18,
        color: "#F7FFF8",
        fontFamily: "Poppins-SemiBold",
    },

    taskCard: {
        backgroundColor: "#FFF4D6",
        borderRadius: 24,
        paddingHorizontal: 20,
        paddingVertical: 28,
    },

    taskLabel: {
        textAlign: "center",
        fontSize: 13,
        color: theme.colors.text,
        fontFamily: "Poppins-SemiBold",
        marginBottom: 8,
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },

    taskTitle: {
        textAlign: "center",
        fontSize: 24,
        lineHeight: 31,
        color: "#2A2440",
        fontFamily: "Poppins-Bold",
        marginBottom: 8,
    },

    taskHint: {
        textAlign: "center",
        fontSize: 15,
        color: theme.colors.muted,
        fontFamily: "Poppins-Regular",
    },

    message: {
        textAlign: "center",
        marginTop: 10,
        fontSize: 14,
        color: "#B44C4C",
        fontFamily: "Poppins-Regular",
    },

    actionsRow: {
        marginTop: 18,
        gap: 14,
    },

    primaryButton: {
        minHeight: 58,
        borderRadius: 22,
        backgroundColor: theme.colors.primary,
        alignItems: "center",
        justifyContent: "center",
    },

    primaryButtonText: {
        fontSize: 18,
        color: "#FFFFFF",
        fontFamily: "Poppins-Bold",
    },

    secondaryButton: {
        minHeight: 58,
        borderRadius: 22,
        backgroundColor: "rgba(255,255,255,0.82)",
        borderWidth: 2,
        borderColor: "rgba(123,92,255,0.18)",
        alignItems: "center",
        justifyContent: "center",
    },

    secondaryButtonText: {
        fontSize: 18,
        color: theme.colors.text,
        fontFamily: "Poppins-SemiBold",
    },

    pressed: {
        opacity: 0.9,
        transform: [{ scale: 0.985 }],
    },

    disabled: {
        opacity: 0.65,
    },

    finalPhaseWrap: {
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 18,
    },

    finalPhaseText: {
        fontSize: 34,
        color: "#FFFFFF",
        fontFamily: "Poppins-Bold",
        textAlign: "center",
        lineHeight: 40,
    },

    finalPhaseSubtext: {
        marginTop: 8,
        fontSize: 14,
        color: "rgba(255,255,255,0.96)",
        fontFamily: "Poppins-Regular",
        textAlign: "center",
        lineHeight: 18,
    },
});