import { Tabs } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useThemeColor } from "../../hooks/use-theme-color";

export default function TabLayout() {
  const tintColor = useThemeColor("tint", "light");

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: tintColor,
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="home" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="detect"
        options={{
          title: "Detect",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="leaf" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
