import { createNativeStackNavigator } from "@react-navigation/native-stack";
import type { AppStackParamList } from "./types";
import { HomeScreen } from "../screens/HomeScreen";
import { TaskStartScreen } from "../screens/TaskStartScreen";
import { TaskManagementScreen } from "../screens/TaskManagementScreen";

const Stack = createNativeStackNavigator<AppStackParamList>();

export function AppStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="TaskStartScreen" component={TaskStartScreen} />
      <Stack.Screen name="TaskManagementScreen" component={TaskManagementScreen} />
    </Stack.Navigator>
  );
}