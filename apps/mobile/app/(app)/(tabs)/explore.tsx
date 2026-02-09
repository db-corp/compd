import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useState, useCallback } from "react";
import { useRouter } from "expo-router";
import { MapPin, Tag, Star, ChevronRight, Bell } from "lucide-react-native";
import { EXPLORE_CATEGORIES as CATEGORIES, COMP_TYPE_LABELS } from "../../../lib/constants";
import BusinessAvatar from "../../../components/BusinessAvatar";

export default function Explore() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [refreshing, setRefreshing] = useState(false);

  const offers = useQuery(api.offers.discover, {
    category: selectedCategory === "all" ? undefined : selectedCategory,
  });
  const unreadCount = useQuery(api.notifications.unreadCount);

  const router = useRouter();

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Convex auto-refreshes, so just show spinner briefly
    setTimeout(() => setRefreshing(false), 500);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Text style={styles.heading}>Discover</Text>
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
        <Text style={styles.subtitle}>Find offers from local businesses</Text>
      </View>

      {/* Category filter */}
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={CATEGORIES}
        keyExtractor={(item) => item.key}
        contentContainerStyle={styles.filterRow}
        style={{ flexGrow: 0, flexShrink: 0 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => setSelectedCategory(item.key)}
            style={[
              styles.filterChip,
              selectedCategory === item.key && styles.filterChipActive,
            ]}
          >
            <Text
              style={[
                styles.filterChipText,
                selectedCategory === item.key && styles.filterChipTextActive,
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Offers list */}
      {offers === undefined ? (
        <View style={styles.loading}>
          <Text style={styles.loadingText}>Loading offers...</Text>
        </View>
      ) : offers.length === 0 ? (
        <View style={styles.empty}>
          <Tag size={40} color="#C5BFB6" strokeWidth={1.5} />
          <Text style={styles.emptyTitle}>No offers found</Text>
          <Text style={styles.emptyBody}>
            {selectedCategory !== "all"
              ? "Try a different category"
              : "Check back soon for new offers from local businesses"}
          </Text>
        </View>
      ) : (
        <FlatList
          data={offers}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() =>
                router.push({
                  pathname: "/(app)/offer/[id]",
                  params: { id: item._id },
                })
              }
              activeOpacity={0.7}
            >
              <View style={styles.cardHeader}>
                <View style={styles.cardHeaderLeft}>
                  <BusinessAvatar
                    name={item.business?.name ?? "Business"}
                    photoUrl={item.business?.photos?.[0]}
                    size={36}
                  />
                  <Text style={styles.businessName}>
                    {item.business?.name ?? "Business"}
                  </Text>
                  {item.business?.isVerified && (
                    <View style={styles.verifiedBadge}>
                      <Text style={styles.verifiedText}>Verified</Text>
                    </View>
                  )}
                </View>
                <ChevronRight size={16} color="#A39D94" strokeWidth={1.5} />
              </View>

              <Text style={styles.offerTitle}>{item.title}</Text>
              <Text style={styles.offerDesc} numberOfLines={2}>
                {item.description}
              </Text>

              <View style={styles.cardMeta}>
                <View style={styles.metaItem}>
                  <Tag size={12} color="#827B72" strokeWidth={1.5} />
                  <Text style={styles.metaText}>
                    {COMP_TYPE_LABELS[item.compensationType] ??
                      item.compensationType}
                  </Text>
                </View>
                <View style={styles.metaItem}>
                  <Text style={styles.metaValue}>
                    ${item.barterRetailValue}
                  </Text>
                  <Text style={styles.metaText}>value</Text>
                </View>
                {item.business?.city && (
                  <View style={styles.metaItem}>
                    <MapPin size={12} color="#827B72" strokeWidth={1.5} />
                    <Text style={styles.metaText}>
                      {item.business.city}, {item.business.state}
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.cardFooter}>
                <View style={styles.tierBadge}>
                  <Text style={styles.tierText}>Tier {item.contentTier}</Text>
                </View>
                <Text style={styles.deliverableSummary}>
                  {item.deliverables
                    .map((d) => `${d.quantity}x ${d.type}`)
                    .join(", ")}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FDFCFA",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 12,
  },
  heading: {
    fontFamily: "DMSerifDisplay_400Regular",
    fontSize: 28,
    color: "#2A2622",
  },
  subtitle: {
    fontFamily: "DMSans_400Regular",
    fontSize: 14,
    color: "#827B72",
    marginTop: 2,
  },
  filterRow: {
    paddingHorizontal: 16,
    paddingRight: 32,
    paddingVertical: 12,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F0EDE8",
  },
  filterChipActive: {
    backgroundColor: "#E8573D",
  },
  filterChipText: {
    fontFamily: "DMSans_500Medium",
    fontSize: 13,
    color: "#615B53",
  },
  filterChipTextActive: {
    color: "#FFFFFF",
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
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
    lineHeight: 20,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#F0EDE8",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  cardHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  businessName: {
    fontFamily: "DMSans_500Medium",
    fontSize: 13,
    color: "#827B72",
  },
  verifiedBadge: {
    backgroundColor: "#EEF8F6",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  verifiedText: {
    fontFamily: "DMSans_500Medium",
    fontSize: 10,
    color: "#1A7A6D",
  },
  offerTitle: {
    fontFamily: "DMSans_700Bold",
    fontSize: 17,
    color: "#2A2622",
    marginBottom: 4,
  },
  offerDesc: {
    fontFamily: "DMSans_400Regular",
    fontSize: 14,
    color: "#827B72",
    lineHeight: 20,
    marginBottom: 12,
  },
  cardMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontFamily: "DMSans_400Regular",
    fontSize: 12,
    color: "#827B72",
  },
  metaValue: {
    fontFamily: "DMSans_700Bold",
    fontSize: 12,
    color: "#2A2622",
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F0EDE8",
  },
  tierBadge: {
    backgroundColor: "#FEF2F0",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tierText: {
    fontFamily: "DMSans_500Medium",
    fontSize: 11,
    color: "#E8573D",
  },
  deliverableSummary: {
    fontFamily: "DMSans_400Regular",
    fontSize: 12,
    color: "#A39D94",
    flex: 1,
  },
});
