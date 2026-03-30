import { View, Text, StyleSheet } from "react-native";
import { TaskComposer } from "../home/TaskComposer";
import { theme } from "../../lib/theme";

type CreateTaskPanelProps = {
  value: string;
  onChangeText: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
};

export function CreateTaskPanel({
  value,
  onChangeText,
  onSubmit,
  disabled = false,
}: CreateTaskPanelProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Crea una nueva tarea</Text>
      <Text style={styles.subtitle}>
        Añade una nueva tarea para seguir organizando tu día.
      </Text>

      <TaskComposer
        value={value}
        onChangeText={onChangeText}
        onSubmit={onSubmit}
        disabled={disabled}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 18,
  },

  title: {
    fontSize: 22,
    color: theme.colors.text,
    fontFamily: "Poppins-Bold",
    marginBottom: 6,
  },

  subtitle: {
    fontSize: 14,
    lineHeight: 22,
    color: theme.colors.muted,
    fontFamily: "Poppins-Regular",
    marginBottom: 14,
  },
});