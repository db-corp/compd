import { Tabs } from "expo-router";
import { Search, Handshake, User } from "lucide-react-native";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#E8573D",
        tabBarInactiveTintColor: "#A39D94",
        tabBarLabelStyle: {
          fontFamily: "DMSans_500Medium",
          fontSize: 11,
        },
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopColor: "#F0EDE8",
        },
        headerStyle: {
          backgroundColor: "#FDFCFA",
        },
        headerTitleStyle: {
          fontFamily: "DMSerifDisplay_400Regular",
          fontSize: 22,
          color: "#2A2622",
        },
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="explore"
        options={{
          title: "Explore",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Search size={size} color={color} strokeWidth={1.5} />
          ),
        }}
      />
      <Tabs.Screen
        name="deals"
        options={{
          title: "Deals",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Handshake size={size} color={color} strokeWidth={1.5} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <User size={size} color={color} strokeWidth={1.5} />
          ),
        }}
      />
    </Tabs>
  );
}
