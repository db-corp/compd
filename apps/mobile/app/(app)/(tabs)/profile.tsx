import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useAuth } from "@clerk/clerk-expo";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useRouter } from "expo-router";
import {
  Bell,
  LogOut,
  Shield,
  Award,
  TrendingUp,
  Instagram,
  AtSign,
  Settings,
} from "lucide-react-native";
import { TIER_CONFIG } from "../../../lib/constants";

export default function Profile() {
  const { signOut } = useAuth();
  const user = useQuery(api.users.getCurrent);
  const business = useQuery(api.businesses.getCurrent);
  const creator = useQuery(api.creators.getCurrent);
  const unreadCount = useQuery(api.notifications.unreadCount);
  const router = useRouter();

  if (!user) {
    return (
      <View style={styles.loading}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const isCreator = user.role === "creator";

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.heading}>Profile</Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <TouchableOpacity
            onPress={() => router.push("/(app)/settings")}
            style={{ padding: 4 }}
          >
            <Settings size={22} color="#2A2622" strokeWidth={1.5} />
          </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.push("/(app)/notifications")}
          style={{ padding: 4, position: "relative" }}
        >
          <Bell size={22} color="#2A2622" strokeWidth={1.5} />
          {(unreadCount ?? 0) > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeNum}>
                {unreadCount! > 99 ? "99+" : unreadCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
        </View>
      </View>

      {/* Profile card */}
      <View style={styles.card}>
        <View style={styles.avatarRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(user.name ?? "U").charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{user.name}</Text>
            <Text style={styles.email}>{user.email}</Text>
          </View>
        </View>
        <View style={styles.roleBadge}>
          <Text style={styles.roleBadgeText}>
            {isCreator ? "Creator" : "Business"}
          </Text>
        </View>
      </View>

      {/* Creator-specific sections */}
      {isCreator && creator && (
        <>
          {/* Trust tier card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Shield size={16} color="#1A7A6D" strokeWidth={1.5} />
              <Text style={styles.cardTitle}>Trust tier</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <View style={[styles.tierBadge, { backgroundColor: TIER_CONFIG[creator.trustTier]?.bg ?? "#F0EDE8" }]}>
                <Text style={[styles.tierText, { color: TIER_CONFIG[creator.trustTier]?.color ?? "#615B53" }]}>
                  {TIER_CONFIG[creator.trustTier]?.label ?? creator.trustTier}
                </Text>
              </View>
              {creator.trustTier !== "trusted" && (
                <Text style={styles.tierProgress}>
                  {creator.totalCompletedDeals} / {TIER_CONFIG[creator.trustTier]?.dealsNeeded ?? "?"} deals to{" "}
                  {TIER_CONFIG[creator.trustTier]?.next ?? "next tier"}
                </Text>
              )}
            </View>
            {/* Progress bar */}
            {creator.trustTier !== "trusted" && (
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${Math.min(100, (creator.totalCompletedDeals / (TIER_CONFIG[creator.trustTier]?.dealsNeeded ?? 5)) * 100)}%`,
                    },
                  ]}
                />
              </View>
            )}
            <Text style={styles.tierHint}>
              {creator.trustTier === "new"
                ? "Complete deals to reduce deposit requirements"
                : creator.trustTier === "established"
                  ? "Lower fees and no deposit at the trusted tier"
                  : "You've reached the highest trust tier!"}
            </Text>
          </View>

          {/* Stats */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <TrendingUp size={16} color="#E8573D" strokeWidth={1.5} />
              <Text style={styles.cardTitle}>Performance</Text>
            </View>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{creator.totalCompletedDeals}</Text>
                <Text style={styles.statLabel}>Completed</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {Math.round(creator.fulfillmentRate * 100)}%
                </Text>
                <Text style={styles.statLabel}>Fulfillment</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {creator.averageContentRating > 0
                    ? creator.averageContentRating.toFixed(1)
                    : "--"}
                </Text>
                <Text style={styles.statLabel}>Content rating</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{creator.totalRedeemedDeals}</Text>
                <Text style={styles.statLabel}>Redeemed</Text>
              </View>
            </View>
          </View>

          {/* Social handles */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <AtSign size={16} color="#C13584" strokeWidth={1.5} />
              <Text style={styles.cardTitle}>Social accounts</Text>
            </View>
            {creator.instagramHandle ? (
              <View style={styles.socialRow}>
                <Instagram size={16} color="#C13584" strokeWidth={1.5} />
                <Text style={styles.socialText}>@{creator.instagramHandle}</Text>
                {(creator.instagramFollowerCount ?? 0) > 0 && (
                  <Text style={styles.followerCount}>
                    {creator.instagramFollowerCount!.toLocaleString()} followers
                  </Text>
                )}
              </View>
            ) : (
              <Text style={styles.noSocial}>No Instagram connected</Text>
            )}
            {creator.tiktokHandle ? (
              <View style={[styles.socialRow, { marginTop: 8 }]}>
                <View style={styles.tiktokIcon}>
                  <Text style={{ color: "#FFF", fontSize: 10, fontWeight: "700" }}>TT</Text>
                </View>
                <Text style={styles.socialText}>@{creator.tiktokHandle}</Text>
              </View>
            ) : (
              <Text style={[styles.noSocial, { marginTop: 4 }]}>No TikTok connected</Text>
            )}
          </View>
        </>
      )}

      {/* Business-specific sections */}
      {!isCreator && business && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Award size={16} color="#E8573D" strokeWidth={1.5} />
            <Text style={styles.cardTitle}>Business stats</Text>
          </View>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{business.totalCompletedDeals}</Text>
              <Text style={styles.statLabel}>Deals</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {business.averageCreatorRating > 0
                  ? business.averageCreatorRating.toFixed(1)
                  : "--"}
              </Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {Math.round(business.offerAccuracyRate * 100)}%
              </Text>
              <Text style={styles.statLabel}>Accuracy</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {business.isVerified ? "Yes" : "No"}
              </Text>
              <Text style={styles.statLabel}>Verified</Text>
            </View>
          </View>
        </View>
      )}

      {/* Sign out */}
      <TouchableOpacity style={styles.signOutButton} onPress={() => signOut()}>
        <LogOut size={16} color="#615B53" strokeWidth={1.5} />
        <Text style={styles.signOutText}>Sign out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FDFCFA" },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 100 },
  loading: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#FDFCFA" },
  loadingText: { fontFamily: "DMSans_400Regular", fontSize: 14, color: "#A39D94" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 60,
    paddingBottom: 16,
  },
  heading: {
    fontFamily: "DMSerifDisplay_400Regular",
    fontSize: 28,
    color: "#2A2622",
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
  badgeNum: { color: "#fff", fontSize: 9, fontFamily: "DMSans_700Bold" },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#F0EDE8",
  },
  avatarRow: { flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 12 },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#E8573D",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontFamily: "DMSans_700Bold",
    fontSize: 20,
    color: "#FFFFFF",
  },
  name: {
    fontFamily: "DMSerifDisplay_400Regular",
    fontSize: 20,
    color: "#2A2622",
  },
  email: {
    fontFamily: "DMSans_400Regular",
    fontSize: 13,
    color: "#827B72",
    marginTop: 2,
  },
  roleBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#EEF8F6",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  roleBadgeText: {
    fontFamily: "DMSans_500Medium",
    fontSize: 12,
    color: "#1A7A6D",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  cardTitle: {
    fontFamily: "DMSans_700Bold",
    fontSize: 15,
    color: "#2A2622",
  },
  tierBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
  },
  tierText: {
    fontFamily: "DMSans_700Bold",
    fontSize: 14,
  },
  tierProgress: {
    fontFamily: "DMSans_400Regular",
    fontSize: 12,
    color: "#827B72",
    flex: 1,
  },
  progressBar: {
    height: 6,
    backgroundColor: "#F0EDE8",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: 6,
    backgroundColor: "#1A7A6D",
    borderRadius: 3,
  },
  tierHint: {
    fontFamily: "DMSans_400Regular",
    fontSize: 12,
    color: "#A39D94",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statItem: {
    flex: 1,
    minWidth: "40%",
    backgroundColor: "#FAF8F5",
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
  },
  statValue: {
    fontFamily: "DMSans_700Bold",
    fontSize: 20,
    color: "#2A2622",
  },
  statLabel: {
    fontFamily: "DMSans_400Regular",
    fontSize: 11,
    color: "#827B72",
    marginTop: 2,
  },
  socialRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#FAF8F5",
    borderRadius: 10,
    padding: 12,
  },
  socialText: {
    fontFamily: "DMSans_500Medium",
    fontSize: 14,
    color: "#2A2622",
    flex: 1,
  },
  followerCount: {
    fontFamily: "DMSans_400Regular",
    fontSize: 12,
    color: "#827B72",
  },
  noSocial: {
    fontFamily: "DMSans_400Regular",
    fontSize: 13,
    color: "#A39D94",
  },
  tiktokIcon: {
    width: 20,
    height: 20,
    borderRadius: 4,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },
  signOutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#F0EDE8",
    borderRadius: 12,
    marginTop: 8,
  },
  signOutText: {
    fontFamily: "DMSans_500Medium",
    fontSize: 15,
    color: "#615B53",
  },
});
