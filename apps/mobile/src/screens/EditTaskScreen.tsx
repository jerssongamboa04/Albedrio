import { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { theme } from "../lib/theme";
import { useTasksStore } from "../store/tasks.store";
import type { AppStackParamList } from "../navigation/types";
import type {
  Task,
  UpdateTaskInput,
  TaskPriority,
  TaskEnergyLevel,
  TaskClarityLevel,
  TaskDifficultyLevel,
  TaskDayMoment,
} from "../services/tasks.service";

type Props = NativeStackScreenProps<AppStackParamList, "EditTaskScreen">;

type ChipOption<T extends string | number> = {
  value: T;
  label: string;
};

type ChipsFieldProps<T extends string | number> = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  options: ChipOption<T>[];
  value: T | null;
  onChange: (value: T) => void;
};

const PRIORITY_OPTIONS: ChipOption<TaskPriority>[] = [
  { value: "low", label: "Baja" },
  { value: "medium", label: "Media" },
  { value: "high", label: "Alta" },
];

const ENERGY_OPTIONS: ChipOption<TaskEnergyLevel>[] = [
  { value: "low", label: "Baja" },
  { value: "medium", label: "Media" },
  { value: "high", label: "Alta" },
];

const CLARITY_OPTIONS: ChipOption<TaskClarityLevel>[] = [
  { value: "clear", label: "La tengo clara" },
  { value: "somewhat_clear", label: "Más o menos" },
  { value: "blocked", label: "No sé por dónde empezar" },
];

const DIFFICULTY_OPTIONS: ChipOption<TaskDifficultyLevel>[] = [
  { value: "light", label: "Ligera" },
  { value: "medium", label: "Normal" },
  { value: "hard", label: "Difícil" },
];

const DAY_MOMENT_OPTIONS: ChipOption<TaskDayMoment>[] = [
  { value: "morning", label: "Mañana" },
  { value: "afternoon", label: "Tarde" },
  { value: "evening", label: "Noche" },
  { value: "any", label: "Indiferente" },
];

const ESTIMATED_MINUTES_OPTIONS: ChipOption<number>[] = [
  { value: 5, label: "5 min" },
  { value: 10, label: "10 min" },
  { value: 15, label: "15 min" },
  { value: 25, label: "25 min" },
  { value: 45, label: "45 min" },
  { value: 60, label: "1 h o +" },
];

function ChipsField<T extends string | number>({
  label,
  icon,
  options,
  value,
  onChange,
}: ChipsFieldProps<T>) {
  return (
    <View style={styles.fieldBlock}>
      <View style={styles.fieldLabelRow}>
        <Ionicons name={icon} size={16} color="#7B5CFF" />
        <Text style={styles.fieldLabel}>{label}</Text>
      </View>

      <View style={styles.chipsWrap}>
        {options.map((option) => {
          const selected = value === option.value;

          return (
            <Pressable
              key={String(option.value)}
              onPress={() => onChange(option.value)}
              style={[styles.chip, selected && styles.chipActive]}
            >
              <Text style={[styles.chipText, selected && styles.chipTextActive]}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function getTaskTypeLabel(type: Task["task_type"]) {
  return type === "daily" ? "Diaria" : "Puntual";
}

function parseDateString(value: string | null) {
  if (!value) return new Date();

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

function formatDateLabel(value: string | null) {
  if (!value) return "Selecciona una fecha objetivo";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Selecciona una fecha objetivo";

  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function buildInitialForm(task: Task): UpdateTaskInput {
  return {
    title: task.title,
    notes: task.notes ?? null,
    due_date: task.due_date ?? null,
    estimated_minutes: task.estimated_minutes ?? null,
    priority: task.priority,
    energy_level: task.energy_level,
    clarity_level: task.clarity_level,
    difficulty_level: task.difficulty_level,
    day_moment: task.day_moment ?? "any",
  };
}

export function EditTaskScreen({ route, navigation }: Props) {
  const { taskId } = route.params;

  const tasks = useTasksStore((s) => s.tasks);
  const saving = useTasksStore((s) => s.saving);
  const editTask = useTasksStore((s) => s.editTask);

  const task = useMemo(
    () => tasks.find((item) => item.id === taskId) ?? null,
    [tasks, taskId]
  );

  const [form, setForm] = useState<UpdateTaskInput | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState<Date>(new Date());

  useEffect(() => {
    if (!task) return;
    setForm(buildInitialForm(task));
  }, [task]);

  function updateField<K extends keyof UpdateTaskInput>(
    key: K,
    value: UpdateTaskInput[K]
  ) {
    if (!form) return;

    setForm({
      ...form,
      [key]: value,
    });
  }

  function handleOpenDatePicker() {
    if (!form) return;
    setTempDate(parseDateString(form.due_date));
    setShowDatePicker(true);
  }

  function handleDateChange(event: DateTimePickerEvent, selectedDate?: Date) {
    if (event.type === "dismissed") {
      setShowDatePicker(false);
      return;
    }

    if (!selectedDate) return;

    setTempDate(selectedDate);

    if (Platform.OS !== "ios") {
      const yyyy = selectedDate.getFullYear();
      const mm = String(selectedDate.getMonth() + 1).padStart(2, "0");
      const dd = String(selectedDate.getDate()).padStart(2, "0");

      updateField("due_date", `${yyyy}-${mm}-${dd}`);
      setShowDatePicker(false);
    }
  }

  function handleConfirmDate() {
    const yyyy = tempDate.getFullYear();
    const mm = String(tempDate.getMonth() + 1).padStart(2, "0");
    const dd = String(tempDate.getDate()).padStart(2, "0");

    updateField("due_date", `${yyyy}-${mm}-${dd}`);
    setShowDatePicker(false);
  }

  function handleCancelDate() {
    setShowDatePicker(false);
  }

  function handleClearDate() {
    updateField("due_date", null);
  }

  async function handleSubmit() {
    if (!task || !form) return;

    const trimmedTitle = form.title.trim();

    if (!trimmedTitle) {
      setMsg("❌ El título no puede estar vacío.");
      return;
    }

    setMsg(null);

    const payload: UpdateTaskInput = {
      ...form,
      title: trimmedTitle,
      due_date: task.task_type === "one_time" ? form.due_date ?? null : null,
      day_moment: task.task_type === "daily" ? form.day_moment ?? "any" : null,
    };

    const result = await editTask(task.id, task.task_type, payload);

    if (result.error) {
      setMsg(`❌ ${result.error}`);
      return;
    }

    navigation.goBack();
  }

  if (!task || !form) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.notFoundWrap}>
          <Ionicons name="create-outline" size={34} color="#9C8FD9" />
          <Text style={styles.notFoundTitle}>No se puede editar esta tarea</Text>
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

  const isValid = form.title.trim().length > 0;

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

          <Text style={styles.eyebrow}>Editar tarea</Text>
          <Text style={styles.title}>Ajusta esta tarea sin perder su contexto</Text>
          <Text style={styles.subtitle}>
            Puedes afinar su contenido y su nivel de exigencia para que encaje mejor contigo.
          </Text>

          <View style={styles.typeBadge}>
            <Ionicons name="layers-outline" size={16} color="#7B5CFF" />
            <Text style={styles.typeBadgeText}>
              Tipo de tarea: {getTaskTypeLabel(task.task_type)}
            </Text>
          </View>
        </View>

        {msg ? <Text style={styles.message}>{msg}</Text> : null}

        <View style={styles.card}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="pencil-outline" size={18} color="#7B5CFF" />
            <Text style={styles.sectionTitle}>Qué quieres hacer</Text>
          </View>

          <TextInput
            value={form.title}
            onChangeText={(text) => updateField("title", text)}
            placeholder="Empieza con un verbo. Ej. aspirar el cuarto"
            placeholderTextColor="#AAA4BE"
            style={styles.titleInput}
          />

          <Text style={styles.helperText}>
            Ajusta el enunciado para que la tarea sea más clara y accionable.
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="sparkles-outline" size={18} color="#7B5CFF" />
            <Text style={styles.sectionTitle}>Vamos a afinarla un poco</Text>
          </View>

          <ChipsField
            label="¿Cuánto crees que te llevará?"
            icon="time-outline"
            options={ESTIMATED_MINUTES_OPTIONS}
            value={form.estimated_minutes}
            onChange={(value) => updateField("estimated_minutes", value)}
          />

          <ChipsField
            label="¿Qué importancia tiene ahora mismo?"
            icon="flag-outline"
            options={PRIORITY_OPTIONS}
            value={form.priority}
            onChange={(value) => updateField("priority", value)}
          />

          <ChipsField
            label="¿Cuánta energía te pide?"
            icon="flash-outline"
            options={ENERGY_OPTIONS}
            value={form.energy_level}
            onChange={(value) => updateField("energy_level", value)}
          />

          <ChipsField
            label="¿La tienes clara o se te hace difusa?"
            icon="bulb-outline"
            options={CLARITY_OPTIONS}
            value={form.clarity_level}
            onChange={(value) => updateField("clarity_level", value)}
          />

          <ChipsField
            label="¿Cómo de pesada se te hace?"
            icon="barbell-outline"
            options={DIFFICULTY_OPTIONS}
            value={form.difficulty_level}
            onChange={(value) => updateField("difficulty_level", value)}
          />
        </View>

        {task.task_type === "one_time" ? (
          <View style={styles.card}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="calendar-outline" size={18} color="#7B5CFF" />
              <Text style={styles.sectionTitle}>Fecha y contexto</Text>
            </View>

            <View style={styles.fieldBlock}>
              <View style={styles.fieldLabelRow}>
                <Ionicons name="calendar-outline" size={16} color="#7B5CFF" />
                <Text style={styles.fieldLabel}>Fecha objetivo</Text>
              </View>

              <Pressable onPress={handleOpenDatePicker} style={styles.dateField}>
                <View style={styles.dateFieldLeft}>
                  <View style={styles.dateIconWrap}>
                    <Ionicons
                      name="calendar-clear-outline"
                      size={18}
                      color="#7B5CFF"
                    />
                  </View>

                  <Text
                    style={[
                      styles.dateFieldText,
                      !form.due_date && styles.dateFieldPlaceholder,
                    ]}
                  >
                    {formatDateLabel(form.due_date)}
                  </Text>
                </View>

                <Ionicons
                  name="chevron-forward-outline"
                  size={18}
                  color="#8C84A8"
                />
              </Pressable>

              {form.due_date ? (
                <Pressable onPress={handleClearDate} style={styles.clearDateButton}>
                  <Ionicons
                    name="close-circle-outline"
                    size={16}
                    color="#8C84A8"
                  />
                  <Text style={styles.clearDateText}>Quitar fecha</Text>
                </Pressable>
              ) : null}

              {showDatePicker ? (
                <View style={styles.datePickerWrap}>
                  <DateTimePicker
                    value={Platform.OS === "ios" ? tempDate : parseDateString(form.due_date)}
                    mode="date"
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    onChange={handleDateChange}
                    minimumDate={new Date()}
                  />

                  {Platform.OS === "ios" ? (
                    <View style={styles.datePickerActions}>
                      <Pressable
                        onPress={handleCancelDate}
                        style={styles.datePickerSecondaryButton}
                      >
                        <Text style={styles.datePickerSecondaryText}>Cancelar</Text>
                      </Pressable>

                      <Pressable
                        onPress={handleConfirmDate}
                        style={styles.datePickerPrimaryButton}
                      >
                        <Text style={styles.datePickerPrimaryText}>Aceptar</Text>
                      </Pressable>
                    </View>
                  ) : null}
                </View>
              ) : null}
            </View>

            <TextInput
              value={form.notes ?? ""}
              onChangeText={(text) => updateField("notes", text || null)}
              placeholder="Añade un poco de contexto si te ayuda"
              placeholderTextColor="#AAA4BE"
              style={[styles.secondaryInput, styles.notesInput]}
              multiline
            />
          </View>
        ) : (
          <View style={styles.card}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="sunny-outline" size={18} color="#7B5CFF" />
              <Text style={styles.sectionTitle}>Cómo encaja en tu día</Text>
            </View>

            <ChipsField
              label="¿En qué momento del día encaja mejor?"
              icon="partly-sunny-outline"
              options={DAY_MOMENT_OPTIONS}
              value={form.day_moment}
              onChange={(value) => updateField("day_moment", value)}
            />

            <TextInput
              value={form.notes ?? ""}
              onChangeText={(text) => updateField("notes", text || null)}
              placeholder="Añade un poco de contexto si te ayuda"
              placeholderTextColor="#AAA4BE"
              style={[styles.secondaryInput, styles.notesInput]}
              multiline
            />
          </View>
        )}

        <Pressable
          onPress={handleSubmit}
          disabled={saving || !isValid}
          style={[
            styles.submitButton,
            (saving || !isValid) && styles.submitButtonDisabled,
          ]}
        >
          <Ionicons name="save-outline" size={20} color="#FFFFFF" />
          <Text style={styles.submitButtonText}>
            {saving ? "Guardando..." : "Guardar cambios"}
          </Text>
        </Pressable>
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
    fontSize: 26,
    lineHeight: 34,
    color: theme.colors.text,
    fontFamily: "Poppins-Bold",
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 14,
    lineHeight: 22,
    color: "#645D7D",
    fontFamily: "Poppins-Regular",
    marginBottom: 14,
  },

  typeBadge: {
    alignSelf: "flex-start",
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

  typeBadgeText: {
    fontSize: 12,
    color: "#5F5878",
    fontFamily: "Poppins-Medium",
  },

  message: {
    fontSize: 14,
    color: "#B44C4C",
    fontFamily: "Poppins-Regular",
  },

  card: {
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: "rgba(123,92,255,0.08)",
  },

  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  },

  sectionTitle: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text,
    fontFamily: "Poppins-SemiBold",
  },

  titleInput: {
    minHeight: 54,
    borderRadius: 18,
    backgroundColor: "#FAF8FF",
    borderWidth: 1,
    borderColor: "#E7E0FF",
    paddingHorizontal: 16,
    fontSize: 15,
    color: theme.colors.text,
    fontFamily: "Poppins-Regular",
    marginBottom: 10,
  },

  secondaryInput: {
    minHeight: 52,
    borderRadius: 18,
    backgroundColor: "#FAF8FF",
    borderWidth: 1,
    borderColor: "#E7E0FF",
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 14,
    color: theme.colors.text,
    fontFamily: "Poppins-Regular",
    marginBottom: 12,
  },

  notesInput: {
    minHeight: 96,
    textAlignVertical: "top",
  },

  helperText: {
    fontSize: 13,
    lineHeight: 20,
    color: "#7D7695",
    fontFamily: "Poppins-Regular",
  },

  fieldBlock: {
    marginBottom: 16,
  },

  fieldLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },

  fieldLabel: {
    flex: 1,
    fontSize: 14,
    color: "#5B5472",
    fontFamily: "Poppins-SemiBold",
  },

  chipsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  chip: {
    minHeight: 40,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: "#F7F4FF",
    borderWidth: 1,
    borderColor: "#E4DBFF",
    alignItems: "center",
    justifyContent: "center",
  },

  chipActive: {
    backgroundColor: "#EDE6FF",
    borderColor: "#7B5CFF",
  },

  chipText: {
    fontSize: 13,
    color: "#5F5878",
    fontFamily: "Poppins-Medium",
  },

  chipTextActive: {
    color: "#7B5CFF",
    fontFamily: "Poppins-SemiBold",
  },

  dateField: {
    minHeight: 56,
    borderRadius: 18,
    backgroundColor: "#FAF8FF",
    borderWidth: 1,
    borderColor: "#E7E0FF",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  dateFieldLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 10,
  },

  dateIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  dateFieldText: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.text,
    fontFamily: "Poppins-Medium",
  },

  dateFieldPlaceholder: {
    color: "#AAA4BE",
    fontFamily: "Poppins-Regular",
  },

  clearDateButton: {
    marginTop: 10,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  clearDateText: {
    fontSize: 13,
    color: "#8C84A8",
    fontFamily: "Poppins-Medium",
  },

  datePickerWrap: {
    marginTop: 12,
    borderRadius: 20,
    backgroundColor: "#FAF8FF",
    borderWidth: 1,
    borderColor: "#E7E0FF",
    padding: 12,
  },

  datePickerActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 10,
  },

  datePickerSecondaryButton: {
    minHeight: 40,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E0F4",
    alignItems: "center",
    justifyContent: "center",
  },

  datePickerSecondaryText: {
    color: "#6D6686",
    fontSize: 13,
    fontFamily: "Poppins-SemiBold",
  },

  datePickerPrimaryButton: {
    minHeight: 40,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: "#7B5CFF",
    alignItems: "center",
    justifyContent: "center",
  },

  datePickerPrimaryText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontFamily: "Poppins-Bold",
  },

  submitButton: {
    minHeight: 56,
    borderRadius: 20,
    backgroundColor: "#7B5CFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginTop: 4,
    shadowColor: "#7B5CFF",
    shadowOpacity: 0.26,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },

  submitButtonDisabled: {
    opacity: 0.6,
  },

  submitButtonText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontFamily: "Poppins-Bold",
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