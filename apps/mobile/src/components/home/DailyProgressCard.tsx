import { useEffect, useState } from "react";
import { View, Text, StyleSheet, LayoutChangeEvent } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  withDelay,
  Easing,
  interpolateColor,
  cancelAnimation,
} from "react-native-reanimated";

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

type Props = {
  doneTasks: number;
  totalTasks: number;
  streakDays: number;
};

export function DailyProgressCard({
  doneTasks,
  totalTasks,
  streakDays,
}: Props) {
  const progress = totalTasks > 0 ? doneTasks / totalTasks : 0;
  const isComplete = totalTasks > 0 && doneTasks === totalTasks;
  const isHighProgress = progress > 0.5 && !isComplete;
  const isMidProgress = progress > 0.2 && progress <= 0.5;
  const isLowProgress = progress > 0 && progress <= 0.2;

  const [trackWidth, setTrackWidth] = useState(0);

  const animatedWidth = useSharedValue(0);
  const badgeOpacity = useSharedValue(0);
  const badgeTranslateY = useSharedValue(10);
  const shimmerTranslate = useSharedValue(-120);
  const glowOpacity = useSharedValue(0.18);

  useEffect(() => {
    if (trackWidth === 0) return;

    animatedWidth.value = withTiming(trackWidth * progress, {
      duration: 700,
      easing: Easing.out(Easing.cubic),
    });

    badgeOpacity.value = withTiming(1, { duration: 350 });
    badgeTranslateY.value = withTiming(0, { duration: 350 });

    glowOpacity.value = withTiming(isComplete ? 0.34 : isHighProgress ? 0.26 : 0.18, {
      duration: 450,
    });

    if (isComplete && trackWidth > 0) {
      shimmerTranslate.value = -120;
      shimmerTranslate.value = withDelay(
        250,
        withRepeat(
          withTiming(trackWidth + 120, {
            duration: 1500,
            easing: Easing.linear,
          }),
          -1,
          false
        )
      );
    } else {
      cancelAnimation(shimmerTranslate);
      shimmerTranslate.value = -120;
    }
  }, [
    progress,
    trackWidth,
    isComplete,
    isHighProgress,
    animatedWidth,
    badgeOpacity,
    badgeTranslateY,
    shimmerTranslate,
    glowOpacity,
  ]);

  let subtitle = "Hoy aún no has añadido ninguna misión.";
  let bottomText = "Añade tu primera tarea para empezar a moverte.";
  let streakIcon = "✨";

  if (isLowProgress) {
    subtitle = "Buen comienzo. Vamos paso a paso.";
    bottomText = `Llevas ${doneTasks} de ${totalTasks} tareas completadas.`;
    streakIcon = "🌱";
  }

  if (isMidProgress) {
    subtitle = "Ya has activado el día. Sigue así.";
    bottomText = `Llevas ${doneTasks} de ${totalTasks} tareas completadas.`;
    streakIcon = "✨";
  }

  if (isHighProgress) {
    subtitle = "Modo ninja activado. Ya llevas buen ritmo.";
    bottomText = "Te queda muy poco para despejar el día.";
    streakIcon = "🔥";
  }

  if (isComplete) {
    subtitle = "Misión cumplida. Tu dojo queda en calma.";
    bottomText = "Hoy has completado todo lo que tenías pendiente.";
    streakIcon = "🔥";
  }

  const mainText =
    totalTasks === 0
      ? "Todo listo para empezar"
      : `${doneTasks} de ${totalTasks} pasos completados`;

  const animatedFillStyle = useAnimatedStyle(() => {
    const normalizedProgress =
      trackWidth > 0 ? animatedWidth.value / trackWidth : 0;

    return {
      width: animatedWidth.value,
      backgroundColor: isComplete
        ? "transparent"
        : interpolateColor(
            normalizedProgress,
            [0, 0.2, 0.5, 1],
            ["#C9B8FF", "#B8A7FF", "#9B84FF", "#7B57FF"]
          ),
    };
  });

  const animatedBadgeStyle = useAnimatedStyle(() => {
    return {
      opacity: badgeOpacity.value,
      transform: [{ translateY: badgeTranslateY.value }],
    };
  });

  const animatedShimmerStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: shimmerTranslate.value }, { rotate: "18deg" }],
    };
  });

  const animatedGlowStyle = useAnimatedStyle(() => {
    return {
      opacity: glowOpacity.value,
    };
  });

  function handleTrackLayout(event: LayoutChangeEvent) {
    setTrackWidth(event.nativeEvent.layout.width);
  }

  return (
    <View style={styles.card}>
      <Animated.View style={[styles.decorationGlow, animatedGlowStyle]} />

      <Text style={styles.eyebrow}>Tu progreso de hoy</Text>

      <Text style={styles.mainText}>{mainText}</Text>

      <Text style={styles.subText}>{subtitle}</Text>

      <View style={styles.progressTrack} onLayout={handleTrackLayout}>
        <Animated.View style={[styles.progressFill, animatedFillStyle]}>
          {isComplete ? (
            <>
              <LinearGradient
                colors={["#7C59FF", "#6F4CFF", "#8A67FF"]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.completeGradient}
              />
              <AnimatedLinearGradient
                colors={[
                  "rgba(255,255,255,0)",
                  "rgba(255,255,255,0.18)",
                  "rgba(255,255,255,0.38)",
                  "rgba(255,255,255,0.18)",
                  "rgba(255,255,255,0)",
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.shimmer, animatedShimmerStyle]}
              />
            </>
          ) : null}
        </Animated.View>
      </View>

      <Animated.View style={[styles.metaRow, animatedBadgeStyle]}>
        <View
          style={[
            styles.streakBadge,
            isComplete && styles.streakBadgeComplete,
            isHighProgress && styles.streakBadgeHigh,
          ]}
        >
          <Text style={styles.streakBadgeText}>
            {streakIcon} Racha actual · {streakDays} días
          </Text>
        </View>
      </Animated.View>

      <Text style={styles.bottomText}>{bottomText}</Text>

      <Text style={styles.sparkle}>✦</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 0,
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    paddingTop: 42,
    paddingHorizontal: 20,
    paddingBottom: 22,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#ECE8F7",
    zIndex: 5,
    shadowColor: "#D8CCF3",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 4,
    overflow: "hidden",
  },
  decorationGlow: {
    position: "absolute",
    right: -20,
    bottom: -12,
    width: 150,
    height: 150,
    borderRadius: 999,
    backgroundColor: "#E7D8FF",
  },
  eyebrow: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 14,
    lineHeight: 20,
    color: "#7C719D",
    marginBottom: 10,
  },
  mainText: {
    fontFamily: "Poppins-Bold",
    fontSize: 28,
    lineHeight: 36,
    color: "#221A44",
    letterSpacing: -0.5,
  },
  subText: {
    marginTop: 10,
    fontFamily: "Poppins-Regular",
    fontSize: 16,
    lineHeight: 24,
    color: "#5F5878",
  },
  progressTrack: {
    marginTop: 20,
    height: 18,
    borderRadius: 999,
    backgroundColor: "#E9ECF7",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
    overflow: "hidden",
    position: "relative",
  },
  completeGradient: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 999,
  },
  shimmer: {
    position: "absolute",
    top: -14,
    left: 0,
    width: 56,
    height: 46,
  },
  metaRow: {
    marginTop: 20,
  },
  streakBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#F4EEFF",
  },
  streakBadgeHigh: {
    backgroundColor: "#F0E8FF",
  },
  streakBadgeComplete: {
    backgroundColor: "#EEE5FF",
  },
  streakBadgeText: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 13,
    color: "#5A4C88",
  },
  bottomText: {
    marginTop: 14,
    fontFamily: "Poppins-Regular",
    fontSize: 15,
    lineHeight: 22,
    color: "#67617F",
  },
  sparkle: {
    position: "absolute",
    right: 24,
    bottom: 18,
    fontSize: 16,
    color: "#E2D7FA",
  },
});