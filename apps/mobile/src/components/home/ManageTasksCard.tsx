import { View, Text, Pressable, StyleSheet } from "react-native";
import { theme } from "../../lib/theme";

type ManageTasksCardProps = {
  onPress?: () => void;
};

export function ManageTasksCard({ onPress }: ManageTasksCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.icon}>🗂️</Text>
        <Text style={styles.title}>Gestiona tus tareas</Text>
      </View>

      <Text style={styles.description}>
        Accede a tu lista, crea nuevas tareas y consulta tu seguimiento.
      </Text>

      <Pressable
        style={({ pressed }) => [
          styles.button,
          pressed && styles.pressed,
        ]}
        onPress={onPress}
      >
        <Text style={styles.buttonText}>Ver tareas</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFF",
    borderRadius: 28,
    padding: 20,
    marginTop: 18,
    borderWidth: 1,
    borderColor: theme.colors.stroke,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },

  icon: {
    fontSize: 22,
  },

  title: {
    fontSize: 20,
    color: theme.colors.text,
    fontFamily: "Poppins-Bold",
  },

  description: {
    fontSize: 16,
    lineHeight: 24,
    color: theme.colors.muted,
    fontFamily: "Poppins-Regular",
    marginBottom: 18,
  },

  button: {
    minHeight: 52,
    borderRadius: 18,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 22,
  },

  buttonText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontFamily: "Poppins-Bold",
  },

  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.985 }],
  },
});