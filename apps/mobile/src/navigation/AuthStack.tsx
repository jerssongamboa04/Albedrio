// src/navigation/AuthStack.tsx
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "./types";
import { useAuthStore } from "../store/auth.store";
import { AuthScreen } from "../screens/AuthScreen";
import { RegisterScreen } from "../screens/RegisterScreen";
import { ForgotPasswordScreen } from "../screens/ForgotPasswordScreen";
import { ResetPasswordScreen } from "../screens/ResetPasswordScreen";
import { TaskStartScreen } from "../screens/TaskStartScreen";

const Stack = createNativeStackNavigator<AuthStackParamList>();

export function AuthStack() {
  const recovery = useAuthStore((s) => s.recovery);

  return (
    <Stack.Navigator
      key={recovery ? "recovery" : "auth"}
      initialRouteName={recovery ? "ResetPassword" : "Login"}
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Login" component={AuthScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
    </Stack.Navigator>
  );
}