import { createNativeStackNavigator } from "@react-navigation/native-stack";
import type { AppStackParamList } from "./types";
import { TaskStartScreen } from "../screens/TaskStartScreen";
import { TaskDetailScreen } from "../screens/TaskDetailScreen";
import { AppTabs } from "./AppTabs";

const Stack = createNativeStackNavigator<AppStackParamList>();

export function AppStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={AppTabs} />
      <Stack.Screen name="TaskStartScreen" component={TaskStartScreen} />
      <Stack.Screen name="TaskDetailScreen" component={TaskDetailScreen} />
    </Stack.Navigator>
  );
}