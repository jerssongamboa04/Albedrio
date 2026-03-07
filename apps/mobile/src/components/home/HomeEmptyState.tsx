import { View, Text, Pressable, StyleSheet } from "react-native";

type Props = {
  onAddPress?: () => void;
};

export function HomeEmptyState({ onAddPress }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🍃</Text>
      <Text style={styles.title}>Tu dojo está en calma</Text>
      <Text style={styles.subtitle}>
        Hoy no tienes tareas pendientes. También está bien respirar.
      </Text>

      <Pressable
        onPress={onAddPress}
        style={({ pressed }) => [
          styles.button,
          pressed && styles.pressed,
        ]}
      >
        <Text style={styles.buttonText}>Añadir primera tarea</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
  },
  emoji: {
    fontSize: 34,
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1E2430",
    textAlign: "center",
  },
  subtitle: {
    marginTop: 8,
    fontSize: 15,
    lineHeight: 22,
    color: "#667085",
    textAlign: "center",
    marginBottom: 18,
  },
  button: {
    minHeight: 46,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: "#EAEFFD",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#33406B",
    fontSize: 14,
    fontWeight: "700",
  },
  pressed: {
    opacity: 0.85,
  },
});