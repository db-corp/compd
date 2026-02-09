import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useState } from "react";
import { useRouter } from "expo-router";
import { Handshake, ChevronRight, Bell } from "lucide-react-native";
import { STATE_CONFIG, DEAL_FILTERS as FILTERS, ACTIVE_STATES, PENDING_STATES, DONE_STATES } from "../../../lib/constants";

export default function DealsTab() {
  const deals = useQuery(api.deals.listByCreator, {});
  const unreadCount = useQuery(api.notifications.unreadCount);
  const [filter, setFilter] = useState("active");
  const router = useRouter();

  const filtered = deals?.filter((d) => {
    if (filter === "active") return ACTIVE_STATES.includes(d.state);
    if (filter === "pending") return PENDING_STATES.includes(d.state);
    return DONE_STATES.includes(d.state);
  }) ?? [];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Text style={styles.heading}>My Deals</Text>
          <TouchableOpacity
            onPress={() => router.push("/(app)/notifications")}
            style={{ padding: 4, position: "relative" }}
          >
            <Bell size={22} color="#2A2622" strokeWidth={1.5} />
            {(unreadCount ?? 0) > 0 && (
              <View style={{
                position: "absolute", top: 0, right: 0,
                minWidth: 16, height: 16, borderRadius: 8,
                backgroundColor: "#E8573D", alignItems: "center",
                justifyContent: "center", paddingHorizontal: 3,
              }}>
                <Text style={{ color: "#fff", fontSize: 9, fontFamily: "DMSans_700Bold" }}>
                  {unreadCount! > 99 ? "99+" : unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter tabs */}
      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.key}
            onPress={() => setFilter(f.key)}
            style={[styles.filterTab, filter === f.key && styles.filterTabActive]}
          >
            <Text style={[styles.filterTabText, filter === f.key && styles.filterTabTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {deals === undefined ? (
        <View style={styles.loading}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.empty}>
          <Handshake size={40} color="#C5BFB6" strokeWidth={1.5} />
          <Text style={styles.emptyTitle}>No deals</Text>
          <Text style={styles.emptyBody}>
            {filter === "active"
              ? "Apply to offers to get started"
              : filter === "pending"
                ? "No pending applications"
                : "No past deals yet"}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const stateInfo = STATE_CONFIG[item.state] ?? STATE_CONFIG.applied;
            return (
              <TouchableOpacity
                style={styles.card}
                onPress={() =>
                  router.push({
                    pathname: "/(app)/deal/[id]",
                    params: { id: item._id },
                  })
                }
                activeOpacity={0.7}
              >
                <View style={styles.cardTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.businessName}>
                      {item.business?.name ?? "Business"}
                    </Text>
                    <Text style={styles.offerTitle}>
                      {item.offer?.title ?? "Offer"}
                    </Text>
                  </View>
                  <ChevronRight size={16} color="#A39D94" strokeWidth={1.5} />
                </View>
                <View style={styles.cardBottom}>
                  <View style={[styles.stateBadge, { backgroundColor: stateInfo.bg }]}>
                    <Text style={[styles.stateText, { color: stateInfo.color }]}>
                      {stateInfo.label}
                    </Text>
                  </View>
                  <Text style={styles.dateText}>
                    {new Date(item.scheduledDate).toLocaleDateString()}
                  </Text>
                  <Text style={styles.valueText}>
                    ${item.contractTerms.barterRetailValue}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FDFCFA" },
  header: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 8 },
  heading: { fontFamily: "DMSerifDisplay_400Regular", fontSize: 28, color: "#2A2622" },
  filterRow: { flexDirection: "row", paddingHorizontal: 16, gap: 8, marginBottom: 12 },
  filterTab: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: "#F0EDE8",
  },
  filterTabActive: { backgroundColor: "#E8573D" },
  filterTabText: { fontFamily: "DMSans_500Medium", fontSize: 13, color: "#615B53" },
  filterTabTextActive: { color: "#FFFFFF" },
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { fontFamily: "DMSans_400Regular", fontSize: 14, color: "#A39D94" },
  empty: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 32 },
  emptyTitle: { fontFamily: "DMSans_500Medium", fontSize: 16, color: "#615B53", marginTop: 12 },
  emptyBody: { fontFamily: "DMSans_400Regular", fontSize: 14, color: "#A39D94", textAlign: "center", marginTop: 4 },
  listContent: { paddingHorizontal: 16, paddingBottom: 100 },
  card: {
    backgroundColor: "#FFFFFF", borderRadius: 12, padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: "#F0EDE8",
  },
  cardTop: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  businessName: { fontFamily: "DMSans_500Medium", fontSize: 13, color: "#827B72" },
  offerTitle: { fontFamily: "DMSans_700Bold", fontSize: 16, color: "#2A2622", marginTop: 2 },
  cardBottom: { flexDirection: "row", alignItems: "center", gap: 12 },
  stateBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  stateText: { fontFamily: "DMSans_500Medium", fontSize: 11 },
  dateText: { fontFamily: "DMSans_400Regular", fontSize: 12, color: "#A39D94" },
  valueText: { fontFamily: "DMSans_700Bold", fontSize: 12, color: "#2A2622" },
});
