import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { useRouter } from "expo-router";
import { ChevronLeft, Bell, CheckCheck } from "lucide-react-native";
import { timeAgo } from "../../lib/constants";

export default function NotificationsScreen() {
  const notifications = useQuery(api.notifications.list, { limit: 50 });
  const unreadCount = useQuery(api.notifications.unreadCount);
  const markRead = useMutation(api.notifications.markRead);
  const markAllRead = useMutation(api.notifications.markAllRead);
  const router = useRouter();

  function handlePress(n: { _id: Id<"notifications">; isRead: boolean; dealId?: Id<"deals"> }) {
    if (!n.isRead) {
      markRead({ id: n._id });
    }
    if (n.dealId) {
      router.push({ pathname: "/(app)/deal/[id]", params: { id: n.dealId } });
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={24} color="#2A2622" strokeWidth={1.5} />
        </TouchableOpacity>
        <Text style={styles.heading}>Notifications</Text>
        {(unreadCount ?? 0) > 0 && (
          <TouchableOpacity
            onPress={() => markAllRead({})}
            style={styles.markAllBtn}
          >
            <CheckCheck size={18} color="#E8573D" strokeWidth={1.5} />
          </TouchableOpacity>
        )}
      </View>

      {notifications === undefined ? (
        <View style={styles.loading}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      ) : notifications.length === 0 ? (
        <View style={styles.empty}>
          <Bell size={40} color="#C5BFB6" strokeWidth={1.5} />
          <Text style={styles.emptyTitle}>No notifications</Text>
          <Text style={styles.emptyBody}>
            You'll be notified about deal updates here
          </Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.card, !item.isRead && styles.cardUnread]}
              onPress={() => handlePress(item)}
              activeOpacity={0.7}
            >
              <View style={styles.cardRow}>
                {!item.isRead && <View style={styles.unreadDot} />}
                <View style={{ flex: 1, marginLeft: item.isRead ? 14 : 0 }}>
                  <Text style={styles.title}>{item.title}</Text>
                  <Text style={styles.body} numberOfLines={2}>
                    {item.body}
                  </Text>
                  <Text style={styles.time}>{timeAgo(item.createdAt)}</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FDFCFA" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 12,
    gap: 12,
  },
  backBtn: { padding: 4 },
  heading: {
    flex: 1,
    fontFamily: "DMSerifDisplay_400Regular",
    fontSize: 24,
    color: "#2A2622",
  },
  markAllBtn: { padding: 4 },
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: {
    fontFamily: "DMSans_400Regular",
    fontSize: 14,
    color: "#A39D94",
  },
  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontFamily: "DMSans_500Medium",
    fontSize: 16,
    color: "#615B53",
    marginTop: 12,
  },
  emptyBody: {
    fontFamily: "DMSans_400Regular",
    fontSize: 14,
    color: "#A39D94",
    textAlign: "center",
    marginTop: 4,
  },
  listContent: { paddingHorizontal: 16, paddingBottom: 40 },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#F0EDE8",
  },
  cardUnread: { backgroundColor: "#FEF7F5" },
  cardRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E8573D",
    marginTop: 6,
  },
  title: {
    fontFamily: "DMSans_700Bold",
    fontSize: 14,
    color: "#2A2622",
  },
  body: {
    fontFamily: "DMSans_400Regular",
    fontSize: 13,
    color: "#615B53",
    marginTop: 2,
  },
  time: {
    fontFamily: "DMSans_400Regular",
    fontSize: 11,
    color: "#A39D94",
    marginTop: 4,
  },
});
