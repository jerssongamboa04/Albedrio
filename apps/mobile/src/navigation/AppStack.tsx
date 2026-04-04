import { createNativeStackNavigator } from "@react-navigation/native-stack";
import type { AppStackParamList } from "./types";
import { TaskStartScreen } from "../screens/TaskStartScreen";
import { TaskDetailScreen } from "../screens/TaskDetailScreen";
import { AppTabs } from "./AppTabs";
import { AntiBlockScreen } from "../screens/AntiBlockScreen";
import { BreakdownScreen } from "../screens/BreakdownScreen";
const Stack = createNativeStackNavigator<AppStackParamList>();

export function AppStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={AppTabs} />
      <Stack.Screen name="TaskStartScreen" component={TaskStartScreen} />
      <Stack.Screen name="TaskDetailScreen" component={TaskDetailScreen} />
      <Stack.Screen name="AntiBlockScreen" component={AntiBlockScreen} />
      <Stack.Screen name="BreakdownScreen" component={BreakdownScreen} />
    </Stack.Navigator>
  );
}