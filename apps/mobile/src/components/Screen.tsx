import { ReactNode } from "react";
import { View, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "../lib/theme";

export function Screen({ children }: { children: ReactNode }) {
  return (
    <LinearGradient colors={[theme.colors.bgTop, theme.colors.bgBottom]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.container}>{children}</View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: theme.spacing(3),
    paddingTop: theme.spacing(2),
  },
});
