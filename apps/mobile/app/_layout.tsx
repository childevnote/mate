import "../global.css";
import { Stack } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider as JotaiProvider } from "jotai";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef } from "react";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { userService } from "../lib/api";
import { useAtomValue } from "jotai";
import { userAtom } from "../lib/store";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 60 * 1000 },
  },
});

function PushTokenRegistrar() {
  const user = useAtomValue(userAtom);
  const registered = useRef(false);

  useEffect(() => {
    if (!user || registered.current) return;

    const registerPushToken = async () => {
      try {
        const { status: existingStatus } =
          await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== "granted") {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }

        if (finalStatus !== "granted") return;

        const tokenData = await Notifications.getExpoPushTokenAsync();
        const platform =
          Platform.OS === "ios"
            ? "ios"
            : Platform.OS === "android"
            ? "android"
            : "web";

        await userService.registerPushToken({
          token: tokenData.data,
          platform,
        });

        registered.current = true;
      } catch (err) {
        console.warn("Push token registration failed:", err);
      }
    };

    registerPushToken();
  }, [user]);

  return null;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <JotaiProvider>
          <PushTokenRegistrar />
          <StatusBar style="auto" />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="posts/[id]"
              options={{ headerShown: true, title: "게시글" }}
            />
            <Stack.Screen
              name="write"
              options={{ headerShown: true, title: "글 작성" }}
            />
            <Stack.Screen
              name="login"
              options={{ headerShown: true, title: "로그인" }}
            />
            <Stack.Screen
              name="signup"
              options={{ headerShown: true, title: "회원가입" }}
            />
          </Stack>
        </JotaiProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
