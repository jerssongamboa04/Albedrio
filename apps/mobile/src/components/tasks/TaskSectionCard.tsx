import { StyleSheet, Text, View } from "react-native";
import { theme } from "../../lib/theme";

type TaskSectionCardProps = {
  title: string;
  children: React.ReactNode;
};

export function TaskSectionCard({
  title,
  children,
}: TaskSectionCardProps) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 20,
  },

  title: {
    fontSize: 18,
    color: theme.colors.text,
    fontFamily: "Poppins-Bold",
    marginBottom: 10,
    paddingHorizontal: 4,
  },

  content: {
    backgroundColor: "rgba(255,255,255,0.62)",
    borderRadius: 24,
    padding: 12,
    borderWidth: 1,
    borderColor: theme.colors.stroke,
  },
});