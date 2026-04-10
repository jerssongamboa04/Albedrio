import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import type { AppTabsParamList } from "./types";
import { HomeScreen } from "../screens/HomeScreen";
import { TaskManagementScreen } from "../screens/TaskManagementScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import { theme } from "../lib/theme";

const Tab = createBottomTabNavigator<AppTabsParamList>();

export function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          height: 78,
          paddingTop: 8,
          paddingBottom: 10,
          backgroundColor: "#FFFFFF",
          borderTopWidth: 1,
          borderTopColor: "rgba(123,92,255,0.12)",
        },
        tabBarLabelStyle: {
          fontSize: 13,
          fontFamily: "Poppins-SemiBold",
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: "#8A84A3",
        tabBarIcon: ({ color, focused }) => {
          if (route.name === "Home") {
            return (
              <Ionicons
                name={focused ? "home" : "home-outline"}
                size={22}
                color={color}
              />
            );
          }

          if (route.name === "TaskManagementScreen") {
            return (
              <Ionicons
                name={focused ? "clipboard" : "clipboard-outline"}
                size={22}
                color={color}
              />
            );
          }

          return (
            <Ionicons
              name={focused ? "person-circle" : "person-circle-outline"}
              size={24}
              color={color}
            />
          );
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: "Inicio" }}
      />

      <Tab.Screen
        name="TaskManagementScreen"
        component={TaskManagementScreen}
        options={{ title: "Tareas" }}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: "Perfil" }}
      />
    </Tab.Navigator>
  );
}