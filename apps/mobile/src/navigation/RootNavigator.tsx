// src/navigation/RootNavigator.tsx
import { View, Text } from "react-native";
import { useAuthStore } from "../store/auth.store";
import { AuthStack } from "./AuthStack";
import { AppStack } from "./AppStack";

export function RootNavigator() {
  const { session, user, initialized, recovery } = useAuthStore();

  if (!initialized) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Cargando sesión...</Text>
      </View>
    );
  }

  // ✅ Si estamos en recovery, SIEMPRE mostramos ResetPassword (aunque haya sesión)
  if (recovery) return <AuthStack />;

  return session && user ? <AppStack /> : <AuthStack />;
}