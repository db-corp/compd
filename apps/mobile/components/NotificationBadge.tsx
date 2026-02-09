import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Bell } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function NotificationBadge() {
  const unreadCount = useQuery(api.notifications.unreadCount);
  const router = useRouter();

  return (
    <TouchableOpacity
      onPress={() => router.push("/(app)/notifications")}
      style={styles.button}
    >
      <Bell size={22} color="#2A2622" strokeWidth={1.5} />
      {(unreadCount ?? 0) > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {unreadCount! > 99 ? "99+" : unreadCount}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 4,
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: 0,
    right: 0,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#E8573D",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  badgeText: {
    color: "#fff",
    fontSize: 9,
    fontFamily: "DMSans_700Bold",
  },
});
