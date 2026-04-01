import { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { theme } from "../lib/theme";
import { useTasksStore } from "../store/tasks.store";
import type { AppStackParamList } from "../navigation/types";
import type { Task } from "../services/tasks.service";

type Props = NativeStackScreenProps<AppStackParamList, "TaskDetailScreen">;

function getPriorityLabel(priority: Task["priority"]) {
  switch (priority) {
    case "low":
      return "Baja";
    case "medium":
      return "Media";
    case "high":
      return "Alta";
    default:
      return "Media";
  }
}

function getEnergyLabel(energy: Task["energy_level"]) {
  switch (energy) {
    case "low":
      return "Baja";
    case "medium":
      return "Media";
    case "high":
      return "Alta";
    default:
      return "Media";
  }
}

function getClarityLabel(clarity: Task["clarity_level"]) {
  switch (clarity) {
    case "clear":
      return "La tienes clara";
    case "somewhat_clear":
      return "Más o menos clara";
    case "blocked":
      return "No sabes por dónde empezar";
    default:
      return "La tienes clara";
  }
}

function getDifficultyLabel(difficulty: Task["difficulty_level"]) {
  switch (difficulty) {
    case "light":
      return "Ligera";
    case "medium":
      return "Normal";
    case "hard":
      return "Difícil";
    default:
      return "Normal";
  }
}

function getTaskTypeLabel(type: Task["task_type"]) {
  return type === "daily" ? "Diaria" : "Puntual";
}

function getDayMomentLabel(dayMoment: Task["day_moment"]) {
  switch (dayMoment) {
    case "morning":
      return "Mañana";
    case "afternoon":
      return "Tarde";
    case "evening":
      return "Noche";
    case "any":
      return "Indiferente";
    default:
      return null;
  }
}

function formatDueDate(value: string | null) {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatEstimatedMinutes(value: number | null) {
  if (!value) return "No definido";
  if (value >= 60) return "1 h o más";
  return `${value} min`;
}

type InfoChipProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
};

function InfoChip({ icon, label }: InfoChipProps) {
  return (
    <View style={styles.infoChip}>
      <Ionicons name={icon} size={15} color="#7B5CFF" />
      <Text style={styles.infoChipText}>{label}</Text>
    </View>
  );
}

type DetailRowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
};

function DetailRow({ icon, label, value }: DetailRowProps) {
  return (
    <View style={styles.detailRow}>
      <View style={styles.detailRowLeft}>
        <View style={styles.detailIconWrap}>
          <Ionicons name={icon} size={16} color="#7B5CFF" />
        </View>
        <Text style={styles.detailLabel}>{label}</Text>
      </View>

      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

export function TaskDetailScreen({ route, navigation }: Props) {
  const { taskId } = route.params;
  const tasks = useTasksStore((s) => s.tasks);

  const task = useMemo(
    () => tasks.find((item) => item.id === taskId) ?? null,
    [tasks, taskId]
  );

  const shouldSuggestBreakdown =
    task?.clarity_level === "somewhat_clear" ||
    task?.clarity_level === "blocked" ||
    task?.difficulty_level === "hard";

  const shouldSuggestAntiBlock =
    task?.clarity_level === "blocked" ||
    task?.difficulty_level === "hard";

  if (!task) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.notFoundWrap}>
          <Ionicons name="alert-circle-outline" size={34} color="#9C8FD9" />
          <Text style={styles.notFoundTitle}>No hemos encontrado esta tarea</Text>
          <Text style={styles.notFoundText}>
            Puede que ya no exista o que todavía no esté cargada en memoria.
          </Text>

          <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Volver</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const dueDateLabel = formatDueDate(task.due_date);
  const dayMomentLabel = getDayMomentLabel(task.day_moment);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Pressable style={styles.topBackButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={18} color="#6E61A8" />
          <Text style={styles.topBackButtonText}>Volver</Text>
        </Pressable>

        <View style={styles.heroCard}>
          <View style={styles.heroGlow} />
          <View style={styles.heroBubble} />

          <Text style={styles.eyebrow}>Detalle de tarea</Text>
          <Text style={styles.title}>{task.title}</Text>

          <View style={styles.heroChips}>
            <InfoChip icon="layers-outline" label={getTaskTypeLabel(task.task_type)} />
            <InfoChip icon="flame-outline" label={`Prioridad ${getPriorityLabel(task.priority)}`} />
            <InfoChip icon="time-outline" label={formatEstimatedMinutes(task.estimated_minutes)} />
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Información de la tarea</Text>

          <DetailRow
            icon="flash-outline"
            label="Energía necesaria"
            value={getEnergyLabel(task.energy_level)}
          />
          <DetailRow
            icon="bulb-outline"
            label="Claridad"
            value={getClarityLabel(task.clarity_level)}
          />
          <DetailRow
            icon="barbell-outline"
            label="Dificultad percibida"
            value={getDifficultyLabel(task.difficulty_level)}
          />

          {task.task_type === "one_time" && dueDateLabel ? (
            <DetailRow
              icon="calendar-outline"
              label="Fecha objetivo"
              value={dueDateLabel}
            />
          ) : null}

          {task.task_type === "daily" && dayMomentLabel ? (
            <DetailRow
              icon="partly-sunny-outline"
              label="Momento del día"
              value={dayMomentLabel}
            />
          ) : null}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Contexto</Text>

          <Text style={styles.contextText}>
            {task.notes?.trim()
              ? task.notes
              : "Esta tarea todavía no tiene contexto adicional."}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Ayuda para avanzar</Text>

          <View style={styles.actionCardWrap}>
            <View style={styles.actionCard}>
              <View style={styles.actionCardHeader}>
                <View style={styles.actionIconWrap}>
                  <Ionicons name="git-branch-outline" size={18} color="#7B5CFF" />
                </View>
                <View style={styles.actionTextWrap}>
                  <Text style={styles.actionTitle}>Descomponer tarea</Text>
                  <Text style={styles.actionSubtitle}>
                    Convierte esta tarea en pasos más manejables.
                  </Text>
                </View>
              </View>

              {shouldSuggestBreakdown ? (
                <View style={styles.suggestionBadge}>
                  <Text style={styles.suggestionBadgeText}>Recomendado</Text>
                </View>
              ) : null}
            </View>

            <View style={styles.actionCard}>
              <View style={styles.actionCardHeader}>
                <View style={styles.actionIconWrap}>
                  <Ionicons name="sparkles-outline" size={18} color="#7B5CFF" />
                </View>
                <View style={styles.actionTextWrap}>
                  <Text style={styles.actionTitle}>Modo anti-bloqueo</Text>
                  <Text style={styles.actionSubtitle}>
                    Encuentra una forma más fácil de empezar.
                  </Text>
                </View>
              </View>

              {shouldSuggestAntiBlock ? (
                <View style={styles.suggestionBadge}>
                  <Text style={styles.suggestionBadgeText}>Muy útil aquí</Text>
                </View>
              ) : null}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F7F5FC",
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 36,
    gap: 14,
  },

  topBackButton: {
    alignSelf: "flex-start",
    minHeight: 40,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.86)",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  topBackButtonText: {
    fontSize: 14,
    color: "#6E61A8",
    fontFamily: "Poppins-SemiBold",
  },

  heroCard: {
    position: "relative",
    backgroundColor: "#EFE9FF",
    borderRadius: 28,
    paddingHorizontal: 18,
    paddingVertical: 20,
    overflow: "hidden",
    shadowColor: "#A48BE4",
    shadowOpacity: 0.14,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },

  heroGlow: {
    position: "absolute",
    top: -14,
    right: -8,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(123,92,255,0.10)",
  },

  heroBubble: {
    position: "absolute",
    top: 18,
    right: 18,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "rgba(123,92,255,0.16)",
  },

  eyebrow: {
    fontSize: 13,
    color: "#7B5CFF",
    fontFamily: "Poppins-SemiBold",
    marginBottom: 8,
  },

  title: {
    fontSize: 28,
    lineHeight: 36,
    color: theme.colors.text,
    fontFamily: "Poppins-Bold",
    marginBottom: 14,
  },

  heroChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  infoChip: {
    minHeight: 34,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.88)",
    borderWidth: 1,
    borderColor: "#E5DDFF",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  infoChipText: {
    fontSize: 12,
    color: "#5F5878",
    fontFamily: "Poppins-Medium",
  },

  card: {
    backgroundColor: "rgba(255,255,255,0.94)",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: "rgba(123,92,255,0.08)",
  },

  sectionTitle: {
    fontSize: 17,
    color: theme.colors.text,
    fontFamily: "Poppins-SemiBold",
    marginBottom: 14,
  },

  detailRow: {
    minHeight: 52,
    borderRadius: 18,
    backgroundColor: "#FAF8FF",
    borderWidth: 1,
    borderColor: "#E7E0FF",
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    gap: 10,
  },

  detailRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 10,
  },

  detailIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  detailLabel: {
    flex: 1,
    fontSize: 14,
    color: "#5E5876",
    fontFamily: "Poppins-Medium",
  },

  detailValue: {
    fontSize: 14,
    color: theme.colors.text,
    fontFamily: "Poppins-SemiBold",
    textAlign: "right",
  },

  contextText: {
    fontSize: 14,
    lineHeight: 24,
    color: "#625C7A",
    fontFamily: "Poppins-Regular",
  },

  actionCardWrap: {
    gap: 12,
  },

  actionCard: {
    borderRadius: 20,
    backgroundColor: "#FAF8FF",
    borderWidth: 1,
    borderColor: "#E7E0FF",
    padding: 14,
  },

  actionCardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },

  actionIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  actionTextWrap: {
    flex: 1,
  },

  actionTitle: {
    fontSize: 15,
    color: theme.colors.text,
    fontFamily: "Poppins-SemiBold",
    marginBottom: 4,
  },

  actionSubtitle: {
    fontSize: 13,
    lineHeight: 20,
    color: "#736D8D",
    fontFamily: "Poppins-Regular",
  },

  suggestionBadge: {
    alignSelf: "flex-start",
    marginTop: 12,
    minHeight: 30,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: "#EEE8FF",
    alignItems: "center",
    justifyContent: "center",
  },

  suggestionBadgeText: {
    fontSize: 12,
    color: "#7B5CFF",
    fontFamily: "Poppins-SemiBold",
  },

  notFoundWrap: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
  },

  notFoundTitle: {
    fontSize: 22,
    color: theme.colors.text,
    fontFamily: "Poppins-Bold",
    marginTop: 14,
    marginBottom: 8,
    textAlign: "center",
  },

  notFoundText: {
    fontSize: 14,
    lineHeight: 22,
    color: "#6F6886",
    fontFamily: "Poppins-Regular",
    textAlign: "center",
    marginBottom: 20,
  },

  backButton: {
    minHeight: 46,
    paddingHorizontal: 18,
    borderRadius: 16,
    backgroundColor: "#7B5CFF",
    alignItems: "center",
    justifyContent: "center",
  },

  backButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: "Poppins-Bold",
  },
});