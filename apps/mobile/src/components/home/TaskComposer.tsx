import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import { copy } from "../../lib/copy";

type Props = {
  value: string;
  onChangeText: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
};

export function TaskComposer({
  value,
  onChangeText,
  onSubmit,
  disabled = false,
}: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Añadir nueva tarea</Text>

      <View style={styles.row}>
        <TextInput
          placeholder={copy.home.newTaskPlaceholder}
          placeholderTextColor="#8F96A3"
          value={value}
          onChangeText={onChangeText}
          style={styles.input}
          returnKeyType="done"
          onSubmitEditing={onSubmit}
        />

        <Pressable
          onPress={onSubmit}
          disabled={disabled}
          style={({ pressed }) => [
            styles.button,
            pressed && styles.pressed,
            disabled && styles.disabled,
          ]}
        >
          <Text style={styles.buttonText}>
            {disabled ? "Añadiendo..." : "Añadir"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#ECEFF5",
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E2430",
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  input: {
    flex: 1,
    minHeight: 52,
    borderRadius: 16,
    backgroundColor: "#F6F7FB",
    paddingHorizontal: 14,
    fontSize: 15,
    color: "#1E2430",
    borderWidth: 1,
    borderColor: "#E5E9F2",
  },
  button: {
    minHeight: 52,
    paddingHorizontal: 18,
    borderRadius: 16,
    backgroundColor: "#1E2430",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.6,
  },
});