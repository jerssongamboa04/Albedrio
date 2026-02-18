import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { View, Text } from "react-native";

export function Root() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: 24,
          }}
        >
          <Text style={{ fontSize: 28, fontWeight: "700" }}>
            Albendrio
          </Text>
          <Text
            style={{
              marginTop: 10,
              fontSize: 16,
              opacity: 0.7,
              textAlign: "center",
            }}
          >
            ✅ Estructura moderna y sin deprecated APIs
          </Text>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
