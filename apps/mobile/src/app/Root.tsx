import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { supabase } from "../lib/supabase";
import { useAuthStore } from "../store/auth.store";
import { AuthScreen } from "../screens/AuthScreen";
import { HomeScreen } from "../screens/HomeScreen";
import { View, Text } from "react-native";

export function Root() {
  const { session, user, initialized, setSession, setInitialized } = useAuthStore();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session ?? null);
      setInitialized(true);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => {
      sub.subscription.unsubscribe();
    };
  }, [setInitialized, setSession]);

  if (!initialized) {
    return (
      <SafeAreaProvider>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text>Cargando sesión...</Text>
        </View>
      </SafeAreaProvider>
    );
  }

  return <SafeAreaProvider>{session && user ? <HomeScreen /> : <AuthScreen />}</SafeAreaProvider>;
}
