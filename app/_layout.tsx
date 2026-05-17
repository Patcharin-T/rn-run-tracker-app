import {
  Kanit_400Regular,
  Kanit_700Bold,
  useFonts,
} from "@expo-google-fonts/kanit";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";

export default function RootLayout() {
  //โหลดฟ้อน Kanit
  const [fontsLoadad] = useFonts({
    Kanit_400Regular,
    Kanit_700Bold,
  });

  useEffect(() => {
    async function prepare() {
      if (fontsLoadad) {
        await SplashScreen.hideAsync();
      }
    }
    prepare();
  }, [fontsLoadad]);
  if (!fontsLoadad) {
    return null;
  }

  //-----------------------------------------------------------
  return (
    <Stack
      // ตกแต่ง Header
      screenOptions={{
        headerStyle: {
          backgroundColor: "#34c9ad", //พื้นหลงัสีฟ้า
        },
        headerTitleStyle: {
          fontFamily: "Kanit_400Regular",
          fontSize: 20,
          color: "#fff",
        },
        headerTitleAlign: "center",
        headerTintColor: "#fff",
        headerBackButtonDisplayMode: "minimal",
      }}
    >
      {/* หน้า index ไม่มี่ Header  */}
      <Stack.Screen name="index" options={{ headerShown: false }} />
      {/* หน้าอื่นๆมีTitle */}
      <Stack.Screen name="run" options={{ title: "Run Tracker V.1.0.0" }} />
      <Stack.Screen name="add" options={{ title: "เพิ่มรายการวิ่ง" }} />
      <Stack.Screen name="[id]" options={{ title: "รายละเอียดการวิ่ง" }} />
    </Stack>
  );
}
