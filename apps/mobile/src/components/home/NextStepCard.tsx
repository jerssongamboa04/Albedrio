import { useEffect, useMemo, useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../../lib/theme";
import type {
  AvailableTime,
  UserEnergyLevel,
} from "../../store/context.store";

export type NextStepCardMode = "capture" | "recommendation" | "empty";

type NextStepCardProps = {
  title?: string;
  mode: NextStepCardMode;
  recommendationTitle?: string | null;
  recommendationReason?: string | null;
  onContextComplete?: (payload: {
    availableTime: AvailableTime;
    energyLevel: UserEnergyLevel;
  }) => void;
  onStart?: () => void;
  isLoading?: boolean;
};

const TIME_OPTIONS: { label: string; value: AvailableTime }[] = [
  { label: "5 min", value: 5 },
  { label: "15 min", value: 15 },
  { label: "30 min", value: 30 },
  { label: "60 min", value: 60 },
];

const ENERGY_OPTIONS: { label: string; value: UserEnergyLevel }[] = [
  { label: "Baja", value: "low" },
  { label: "Media", value: "medium" },
  { label: "Alta", value: "high" },
];

export function NextStepCard({
  title = "Tu siguiente paso",
  mode,
  recommendationTitle,
  recommendationReason,
  onContextComplete,
  onStart,
  isLoading = false,
}: NextStepCardProps) {
  const [step, setStep] = useState<"time" | "energy">("time");
  const [selectedTime, setSelectedTime] = useState<AvailableTime | null>(null);

  useEffect(() => {
    if (mode === "capture") {
      setStep("time");
      setSelectedTime(null);
    }
  }, [mode]);

  const iconName = useMemo(() => {
    if (mode === "capture") return "sparkles-outline";
    if (mode === "recommendation") return "flash-outline";
    return "checkmark-done-outline";
  }, [mode]);

  function handleSelectTime(value: AvailableTime) {
    setSelectedTime(value);
    setStep("energy");
  }

  function handleSelectEnergy(value: UserEnergyLevel) {
    if (!selectedTime || !onContextComplete) return;

    onContextComplete({
      availableTime: selectedTime,
      energyLevel: value,
    });
  }

  function renderCaptureStep() {
    if (step === "time") {
      return (
        <>
          <View style={styles.contentBox}>
            <Text style={styles.promptEyebrow}>Paso 1 de 2</Text>
            <Text style={styles.promptTitle}>¿Cuánto tiempo tienes ahora?</Text>
            <Text style={styles.promptText}>
              Elige una opción rápida y te sugiero el mejor paso para este momento.
            </Text>
          </View>

          <View style={styles.optionsGrid}>
            {TIME_OPTIONS.map((option) => (
              <Pressable
                key={option.value}
                style={({ pressed }) => [
                  styles.optionChip,
                  pressed && styles.optionChipPressed,
                ]}
                onPress={() => handleSelectTime(option.value)}
              >
                <Text style={styles.optionChipText}>{option.label}</Text>
              </Pressable>
            ))}
          </View>
        </>
      );
    }

    return (
      <>
        <View style={styles.contentBox}>
          <Text style={styles.promptEyebrow}>Paso 2 de 2</Text>
          <Text style={styles.promptTitle}>¿Cómo vas de energía?</Text>
          <Text style={styles.promptText}>
            Con esto ya puedo recomendarte una tarea que encaje mejor contigo.
          </Text>

          {selectedTime ? (
            <View style={styles.contextPill}>
              <Ionicons name="time-outline" size={14} color="#6E59C8" />
              <Text style={styles.contextPillText}>
                Tiempo elegido: {selectedTime} min
              </Text>
            </View>
          ) : null}
        </View>

        <View style={styles.optionsGrid}>
          {ENERGY_OPTIONS.map((option) => (
            <Pressable
              key={option.value}
              style={({ pressed }) => [
                styles.optionChip,
                pressed && styles.optionChipPressed,
              ]}
              onPress={() => handleSelectEnergy(option.value)}
            >
              <Text style={styles.optionChipText}>{option.label}</Text>
            </Pressable>
          ))}
        </View>
      </>
    );
  }

  function renderRecommendation() {
    const hasRecommendation =
      !!recommendationTitle && recommendationTitle.trim().length > 0;

    const mainText = isLoading
      ? "Buscando el siguiente paso más razonable para ti..."
      : hasRecommendation
        ? recommendationTitle
        : "Ahora mismo no hay una tarea clara que recomendar.";

    return (
      <>
        <View style={styles.contentBox}>
          <Text
            style={[
              styles.taskText,
              !hasRecommendation && !isLoading ? styles.emptyTaskText : null,
            ]}
            numberOfLines={3}
          >
            {mainText}
          </Text>

          {recommendationReason ? (
            <Text style={styles.reasonText}>{recommendationReason}</Text>
          ) : null}
        </View>

        {hasRecommendation ? (
          <Pressable
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.primaryButtonPressed,
            ]}
            onPress={onStart}
          >
            <Text style={styles.primaryButtonText}>Empezar ahora</Text>
            <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
          </Pressable>
        ) : null}
      </>
    );
  }

  function renderEmpty() {
    return (
      <View style={styles.contentBox}>
        <Text style={[styles.taskText, styles.emptyTaskText]}>
          Hoy ya has despejado todo lo importante.
        </Text>
        <Text style={styles.reasonText}>
          Cuando tengas tareas pendientes de hoy, Albe podrá proponerte el mejor
          siguiente paso.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.topBadge}>
        <Ionicons name="sparkles-outline" size={14} color="#6E59C8" />
        <Text style={styles.topBadgeText}>Recomendación de Albe</Text>
      </View>

      <View style={styles.headerRow}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.iconWrap}>
          <Ionicons name={iconName} size={18} color="#1f8705" />
        </View>
      </View>

      {mode === "capture" && renderCaptureStep()}
      {mode === "recommendation" && renderRecommendation()}
      {mode === "empty" && renderEmpty()}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#F6F1FF",
    borderRadius: 28,
    padding: theme.spacing(2.5),
    borderWidth: 1,
    borderColor: "#E7DBFF",
    shadowColor: "#A48BE4",
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
    marginBottom: 16,
  },

  topBadge: {
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
    marginBottom: theme.spacing(1.5),
  },

  topBadgeText: {
    fontSize: 12,
    color: "#6E59C8",
    fontFamily: "Poppins-SemiBold",
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: theme.spacing(1.75),
    gap: theme.spacing(1.5),
  },

  title: {
    flex: 1,
    fontSize: 24,
    color: theme.colors.text,
    fontFamily: "Poppins-Bold",
  },

  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#EEE4FF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#1f8705",
  },

  contentBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    paddingVertical: theme.spacing(2.1),
    paddingHorizontal: theme.spacing(2),
    borderWidth: 1,
    borderColor: "#E9E2F6",
    marginBottom: theme.spacing(1.75),
  },

  promptEyebrow: {
    fontSize: 12,
    color: "#6E59C8",
    fontFamily: "Poppins-SemiBold",
    marginBottom: 6,
  },

  promptTitle: {
    fontSize: 20,
    lineHeight: 28,
    color: theme.colors.text,
    fontFamily: "Poppins-Bold",
    marginBottom: 6,
  },

  promptText: {
    fontSize: 14,
    lineHeight: 22,
    color: theme.colors.muted,
    fontFamily: "Poppins-Regular",
  },

  contextPill: {
    marginTop: 14,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F5EEFF",
    borderWidth: 1,
    borderColor: "#E0D0FF",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  contextPillText: {
    fontSize: 12,
    color: "#6E59C8",
    fontFamily: "Poppins-SemiBold",
  },

  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  optionChip: {
    minHeight: 48,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DCCEFF",
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  optionChipPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.985 }],
  },

  optionChipText: {
    fontSize: 15,
    color: theme.colors.text,
    fontFamily: "Poppins-SemiBold",
  },

  taskText: {
    fontSize: 18,
    lineHeight: 26,
    color: theme.colors.text,
    fontFamily: "Poppins-SemiBold",
  },

  emptyTaskText: {
    fontSize: 16,
    lineHeight: 24,
    color: theme.colors.muted,
    fontFamily: "Poppins-Medium",
  },

  reasonText: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 22,
    color: "#6C6784",
    fontFamily: "Poppins-Regular",
  },

  primaryButton: {
    minHeight: 52,
    paddingHorizontal: theme.spacing(2.2),
    borderRadius: 18,
    backgroundColor: theme.colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  primaryButtonPressed: {
    opacity: 0.94,
    transform: [{ scale: 0.985 }],
  },

  primaryButtonText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontFamily: "Poppins-Bold",
  },
});