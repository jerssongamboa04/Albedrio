import { View, Text, StyleSheet, TextInput, Pressable, Image } from "react-native";
import { useState } from "react";

import { Ionicons } from "@expo/vector-icons";
import { theme } from "../../lib/theme";
import type {
  CreateTaskInput,
  TaskType,
  TaskPriority,
  TaskEnergyLevel,
  TaskClarityLevel,
  TaskDifficultyLevel,
  TaskDayMoment,
} from "../../services/tasks.service";
import { Platform } from "react-native";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
const albeCreateImage = require("../../../assets/characters/albe-create.png");




type OptionCardProps<T extends string> = {
  value: T;
  label: string;
  description?: string;
  selected: boolean;
  onPress: (value: T) => void;
  icon?: keyof typeof Ionicons.glyphMap;
};

function OptionCard<T extends string>({
  value,
  label,
  description,
  selected,
  onPress,
  icon,
}: OptionCardProps<T>) {
  return (
    <Pressable
      onPress={() => onPress(value)}
      style={[styles.optionCard, selected && styles.optionCardActive]}
    >
      <View style={styles.optionCardHeader}>
        {icon ? (
          <View style={[styles.optionIconWrap, selected && styles.optionIconWrapActive]}>
            <Ionicons
              name={icon}
              size={18}
              color={selected ? "#7B5CFF" : "#7C7696"}
            />
          </View>
        ) : null}

        <Text style={[styles.optionCardLabel, selected && styles.optionCardLabelActive]}>
          {label}
        </Text>
      </View>

      {description ? (
        <Text
          style={[
            styles.optionCardDescription,
            selected && styles.optionCardDescriptionActive,
          ]}
        >
          {description}
        </Text>
      ) : null}
    </Pressable>
  );
}

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

type CreateTaskPanelProps = {
  form: CreateTaskInput;
  onChange: (next: CreateTaskInput) => void;
  onSubmit: () => void;
  disabled?: boolean;
};

const TASK_TYPE_OPTIONS: Array<{
  value: TaskType;
  label: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
}> = [
    {
      value: "one_time",
      label: "Puntual",
      description: "Algo concreto que quieres resolver",
      icon: "flash-outline",
    },
    {
      value: "daily",
      label: "Diaria",
      description: "Algo que forma parte de tu rutina",
      icon: "repeat-outline",
    },
  ];

const ESTIMATED_MINUTES_OPTIONS: ChipOption<number>[] = [
  { value: 5, label: "5 min" },
  { value: 10, label: "10 min" },
  { value: 15, label: "15 min" },
  { value: 25, label: "25 min" },
  { value: 45, label: "45 min" },
  { value: 60, label: "1 h o +" },
];

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
export function CreateTaskPanel({
  form,
  onChange,
  onSubmit,
  disabled = false,
}: CreateTaskPanelProps) {
  const isValid = form.title.trim().length > 0;

  function updateField<K extends keyof CreateTaskInput>(
    key: K,
    value: CreateTaskInput[K]
  ) {
    onChange({
      ...form,
      [key]: value,
    });
  }

  function handleChangeTaskType(nextType: TaskType) {
    onChange({
      ...form,
      task_type: nextType,
      due_date: nextType === "one_time" ? form.due_date ?? null : null,
      day_moment: nextType === "daily" ? form.day_moment ?? "any" : null,
    });
  }
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState<Date>(new Date());

  function handleOpenDatePicker() {
    setTempDate(parseDateString(form.due_date));
    setShowDatePicker(true);
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

  function handleClearDate() {
    updateField("due_date", null);
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

  return (
    <View style={styles.container}>
      <View style={styles.heroCard}>
        <View style={styles.heroTextWrap}>
          <Text style={styles.heroTitle}>Crear una nueva tarea</Text>
          <Text style={styles.heroSubtitle}>
            Vamos a darle forma para que luego sea más fácil ponerla en marcha.
          </Text>
        </View>

        <View style={styles.heroMascotWrap}>
          <View style={styles.heroGlow} />
          <View style={styles.heroBubble} />
          <Image
            source={albeCreateImage}
            style={styles.heroMascotImage}
            resizeMode="contain"
          />
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.sectionTitleRow}>
          <Ionicons name="layers-outline" size={18} color="#7B5CFF" />
          <Text style={styles.sectionTitle}>¿Qué tipo de tarea es?</Text>
        </View>

        <View style={styles.optionGrid}>
          {TASK_TYPE_OPTIONS.map((option) => (
            <OptionCard
              key={option.value}
              value={option.value}
              label={option.label}
              description={option.description}
              selected={form.task_type === option.value}
              onPress={handleChangeTaskType}
              icon={option.icon}
            />
          ))}
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.sectionTitleRow}>
          <Ionicons name="pencil-outline" size={18} color="#7B5CFF" />
          <Text style={styles.sectionTitle}>¿Qué tienes que hacer?</Text>
        </View>

        <TextInput
          value={form.title}
          onChangeText={(text) => updateField("title", text)}
          placeholder="Ej. avanzar el apartado 8 de la memoria"
          placeholderTextColor="#AAA4BE"
          style={styles.titleInput}
        />

        <Text style={styles.helperText}>
          Ponlo como tú lo entiendas ahora. Luego Albendrio te ayuda a aterrizarlo.
        </Text>
      </View>

      <View style={styles.card}>
        <View style={styles.sectionTitleRow}>
          <Ionicons name="sparkles-outline" size={18} color="#7B5CFF" />
          <Text style={styles.sectionTitle}>
            Vamos a entender un poco mejor esta tarea
          </Text>
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

      {form.task_type === "one_time" ? (
        <View style={styles.card}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="calendar-outline" size={18} color="#7B5CFF" />
            <Text style={styles.sectionTitle}>Un poco más de contexto</Text>
          </View>

          <View style={styles.fieldBlock}>
            <View style={styles.fieldLabelRow}>
              <Ionicons name="calendar-outline" size={16} color="#7B5CFF" />
              <Text style={styles.fieldLabel}>¿Para cuándo te gustaría tenerla lista?</Text>
            </View>

            <Pressable
              onPress={handleOpenDatePicker}
              style={styles.dateField}
            >
              <View style={styles.dateFieldLeft}>
                <View style={styles.dateIconWrap}>
                  <Ionicons name="calendar-clear-outline" size={18} color="#7B5CFF" />
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

              <Ionicons name="chevron-forward-outline" size={18} color="#8C84A8" />
            </Pressable>

            {form.due_date ? (
              <Pressable onPress={handleClearDate} style={styles.clearDateButton}>
                <Ionicons name="close-circle-outline" size={16} color="#8C84A8" />
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
                    <Pressable onPress={handleCancelDate} style={styles.datePickerSecondaryButton}>
                      <Text style={styles.datePickerSecondaryText}>Cancelar</Text>
                    </Pressable>

                    <Pressable onPress={handleConfirmDate} style={styles.datePickerPrimaryButton}>
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
        onPress={onSubmit}
        disabled={disabled || !isValid}
        style={[
          styles.submitButton,
          (disabled || !isValid) && styles.submitButtonDisabled,
        ]}
      >
        <Ionicons name="add-circle-outline" size={20} color="#FFFFFF" />
        <Text style={styles.submitButtonText}>Crear tarea</Text>
      </Pressable>

      <Text style={styles.footerText}>
        La terminamos de pulir después, si hace falta.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 18,
    gap: 14,
  },

  heroCard: {
    backgroundColor: "#EFE9FF",
    borderRadius: 28,
    paddingHorizontal: 18,
    paddingVertical: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#A48BE4",
    shadowOpacity: 0.14,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },

  heroTextWrap: {
    flex: 1,
    paddingRight: 14,
  },

  heroTitle: {
    fontSize: 24,
    color: theme.colors.text,
    fontFamily: "Poppins-Bold",
    marginBottom: 6,
  },

  heroSubtitle: {
    fontSize: 14,
    lineHeight: 22,
    color: "#645D7D",
    fontFamily: "Poppins-Regular",
  },

  heroMascotWrap: {
    width: 58,
    height: 58,
    alignItems: "center",
    justifyContent: "center",
  },

  heroMascotBadge: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#A48BE4",
    shadowOpacity: 0.18,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
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

  optionGrid: {
    gap: 12,
  },

  optionCard: {
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: "#FAF8FF",
    borderWidth: 1,
    borderColor: "#E7E0FF",
  },

  optionCardActive: {
    backgroundColor: "#F3EEFF",
    borderColor: "#7B5CFF",
  },

  optionCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },

  optionIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  optionIconWrapActive: {
    backgroundColor: "#FFFFFF",
  },

  optionCardLabel: {
    fontSize: 15,
    color: "#4E4865",
    fontFamily: "Poppins-SemiBold",
  },

  optionCardLabelActive: {
    color: "#7B5CFF",
  },

  optionCardDescription: {
    fontSize: 13,
    lineHeight: 20,
    color: "#78718F",
    fontFamily: "Poppins-Regular",
  },

  optionCardDescriptionActive: {
    color: "#645A92",
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

  footerText: {
    textAlign: "center",
    fontSize: 13,
    lineHeight: 20,
    color: "#7D7695",
    fontFamily: "Poppins-Regular",
    marginBottom: 10,
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

  heroGlow: {
    position: "absolute",
    width: 94,
    height: 94,
    borderRadius: 47,
    backgroundColor: "rgba(123,92,255,0.14)",
  },

  heroBubble: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "rgba(123,92,255,0.18)",
  },

  heroMascotImage: {
    width: 132,
    height: 132,
    marginTop: 6,
    marginRight: -4,
  },
});