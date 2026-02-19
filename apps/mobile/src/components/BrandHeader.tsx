import { Image, StyleSheet, View } from "react-native";

export function BrandHeader() {
  return (
    <View style={styles.wrap}>
      <Image source={require("../../assets/brand/logo.png")} style={styles.logo} resizeMode="contain" />
      <Image source={require("../../assets/brand/mascot.png")} style={styles.mascot} resizeMode="contain" />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", marginTop: 6, marginBottom: 10 },
  logo: { width: 280, height: 64 },
  mascot: { width: 160, height: 160, marginTop: 10 },
});
