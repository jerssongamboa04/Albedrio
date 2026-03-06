// src/app/Root.tsx
import { useEffect, useCallback, useRef, useState } from "react";
import { View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import * as SplashScreen from "expo-splash-screen";
import * as Linking from "expo-linking";
import * as QueryParams from "expo-auth-session/build/QueryParams";

import { RootNavigator } from "../navigation/RootNavigator";
import { preloadAppResources } from "../lib/preload";
import { useAuthStore } from "../store/auth.store";
import { supabase } from "../lib/supabase";

SplashScreen.preventAutoHideAsync().catch(() => {});

export function Root() {
  const { setSession, setInitialized, setRecovery } = useAuthStore();
  const [ready, setReady] = useState(false);

  const authSubRef = useRef<ReturnType<typeof supabase.auth.onAuthStateChange> | null>(null);
  const lastHandledUrlRef = useRef<string | null>(null);

  // ✅ Hook “estable” para links (como en el ejemplo oficial)
  const url = Linking.useURL();

  async function handleAuthRedirect(incomingUrl: string) {
    if (!incomingUrl) return;
    if (lastHandledUrlRef.current === incomingUrl) return;
    lastHandledUrlRef.current = incomingUrl;

    // Parse params (query + hash)
    const { params, errorCode } = QueryParams.getQueryParams(incomingUrl);
    if (errorCode) return;

    // Detectar path
    const parsed = Linking.parse(incomingUrl);
    const path = parsed?.path ?? "";

    // ✅ Recovery si:
    // - Supabase manda type=recovery
    // - o el deeplink apunta a /reset-password
    const isRecovery = params?.type === "recovery" || path.includes("reset-password");
    if (isRecovery) setRecovery(true);

    // Patrón oficial Supabase: crear sesión desde token hash si existe
    const access_token = params?.access_token;
    const refresh_token = params?.refresh_token;

    if (access_token && refresh_token) {
      await supabase.auth.setSession({ access_token, refresh_token });
      return;
    }

    // Caso alternativo: code PKCE
    const code = params?.code;
    if (code) {
      await supabase.auth.exchangeCodeForSession(code);
      return;
    }
  }

  useEffect(() => {
    let mounted = true;

    async function boot() {
      try {
        await preloadAppResources();

        // Procesar URL inicial (app cerrada)
        const initialUrl = await Linking.getInitialURL();
        if (initialUrl) {
          try {
            await handleAuthRedirect(initialUrl);
          } catch {
            // ignorar
          }
        }

        // Sesión inicial
        const { data } = await supabase.auth.getSession();
        if (!mounted) return;

        setSession(data.session ?? null);
        setInitialized(true);

        // Listener auth único (NO dependemos de PASSWORD_RECOVERY)
        authSubRef.current = supabase.auth.onAuthStateChange((_event, newSession) => {
          setSession(newSession);
          // Importante: NO hacemos setRecovery(false) en SIGNED_IN
          // porque en recovery a menudo se emite SIGNED_IN.
        });
      } finally {
        if (mounted) setReady(true);
      }
    }

    void boot();

    return () => {
      mounted = false;
      authSubRef.current?.data?.subscription?.unsubscribe();
    };
  }, [setInitialized, setRecovery, setSession]);

  // ✅ Procesar cada URL entrante cuando cambie
  useEffect(() => {
    if (!url) return;
    void handleAuthRedirect(url);
  }, [url]);

  const onLayout = useCallback(async () => {
    if (ready) await SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  return (
    <SafeAreaProvider>
      <View style={{ flex: 1 }} onLayout={onLayout}>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </View>
    </SafeAreaProvider>
  );
}