import { View, Text, Pressable, StyleSheet } from "react-native";
import { theme } from "../../lib/theme";

export type TaskTabKey = "tasks" | "create" | "metrics";

type TabItem = {
  key: TaskTabKey;
  label: string;
};

const TABS: TabItem[] = [
  { key: "tasks", label: "Tareas" },
  { key: "create", label: "Crear" },
  { key: "metrics", label: "Seguimiento" },
];

type TaskTabsProps = {
  activeTab: TaskTabKey;
  onChangeTab: (tab: TaskTabKey) => void;
};

export function TaskTabs({ activeTab, onChangeTab }: TaskTabsProps) {
  return (
    <View style={styles.wrapper}>
      {TABS.map((tab) => {
        const isActive = activeTab === tab.key;

        return (
          <Pressable
            key={tab.key}
            style={({ pressed }) => [
              styles.tab,
              isActive && styles.tabActive,
              pressed && styles.pressed,
            ]}
            onPress={() => onChangeTab(tab.key)}
          >
            <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    gap: 6,
  },

  tab: {
    flex: 1,
    minHeight: 48,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },

  tabActive: {
    backgroundColor: theme.colors.primary,
  },

  tabText: {
    fontSize: 14,
    color: "#7D7697",
    fontFamily: "Poppins-SemiBold",
  },

  tabTextActive: {
    color: "#FFFFFF",
  },

  pressed: {
    opacity: 0.92,
  },
});