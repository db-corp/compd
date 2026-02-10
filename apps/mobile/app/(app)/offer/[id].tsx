import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeft,
  Camera,
  Clock,
  Calendar,
  Shield,
  AlertTriangle,
} from "lucide-react-native";
import { DAYS, COMP_TYPE_LABELS } from "../../../lib/constants";
import BusinessAvatar from "../../../components/BusinessAvatar";

export default function OfferDetail() {
  const { id } = useLocalSearchParams();
  const offerId = id as string as Id<"offers">;
  const router = useRouter();
  const offer = useQuery(api.offers.getById, { id: offerId });
  const creator = useQuery(api.creators.getCurrent);
  const applyMutation = useMutation(api.deals.apply);
  const [applying, setApplying] = useState(false);

  const isIneligible = creator && !creator.instagramConnected && !creator.tiktokConnected;

  const handleApply = async () => {
    if (!offer || isIneligible) return;
    setApplying(true);
    try {
      await applyMutation({
        offerId,
        scheduledDate: Date.now() + 7 * 24 * 60 * 60 * 1000, // Default: 1 week out
      });
      Alert.alert("Applied!", "Your application has been submitted.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (err: any) {
      Alert.alert("Could not apply", err.message ?? "Something went wrong");
    } finally {
      setApplying(false);
    }
  };

  if (offer === undefined) {
    return (
      <View style={styles.loading}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!offer) {
    return (
      <View style={styles.loading}>
        <Text style={styles.loadingText}>Offer not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={20} color="#2A2622" strokeWidth={1.5} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Offer details
        </Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Business hero row */}
        <View style={styles.businessRow}>
          <BusinessAvatar
            name={offer.business?.name ?? "Business"}
            photoUrl={offer.business?.photos?.[0]}
            size={48}
          />
          <View style={styles.businessInfo}>
            <View style={styles.businessNameRow}>
              <Text style={styles.businessName}>
                {offer.business?.name ?? "Business"}
              </Text>
              {offer.business?.isVerified && (
                <View style={styles.verifiedBadge}>
                  <Shield size={10} color="#1A7A6D" strokeWidth={1.5} />
                  <Text style={styles.verifiedText}>Verified</Text>
                </View>
              )}
            </View>
            {offer.business?.city && (
              <Text style={styles.locationText}>
                {offer.business.city}, {offer.business.state}
              </Text>
            )}
          </View>
        </View>

        {/* Title */}
        <Text style={styles.offerTitle}>{offer.title}</Text>

        {/* Value badges */}
        <View style={styles.badgeRow}>
          <View style={styles.valueBadge}>
            <Text style={styles.valueBadgeText}>
              ${offer.barterRetailValue}{" "}
              {COMP_TYPE_LABELS[offer.compensationType]?.toLowerCase() ??
                offer.compensationType}
            </Text>
          </View>
          {offer.cashAmount != null && offer.cashAmount > 0 && (
            <View style={styles.cashBadge}>
              <Text style={styles.cashBadgeText}>
                +${offer.cashAmount} cash
              </Text>
            </View>
          )}
        </View>

        {/* Description (shown once) */}
        <Text style={styles.description}>{offer.description}</Text>
        {offer.exclusions && (
          <Text style={styles.exclusions}>
            Exclusions: {offer.exclusions}
          </Text>
        )}

        {/* Content requirements card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <Camera size={16} color="#E8573D" strokeWidth={1.5} />
              <Text style={styles.cardTitle}>What to post</Text>
            </View>
            <View style={styles.tierBadge}>
              <Text style={styles.tierText}>Tier {offer.contentTier}</Text>
            </View>
          </View>

          {offer.deliverables.map((d, i) => (
            <View key={i} style={styles.deliverableRow}>
              <Text style={styles.deliverablePlatform}>
                {d.platform.charAt(0).toUpperCase() + d.platform.slice(1)}
              </Text>
              <Text style={styles.deliverableType}>
                {d.quantity}x {d.type}
                {d.minDurationSeconds ? ` (${d.minDurationSeconds}s+)` : ""}
              </Text>
            </View>
          ))}

          <View style={styles.timingRow}>
            <Clock size={13} color="#827B72" strokeWidth={1.5} />
            <Text style={styles.timingText}>
              Post within {offer.contentWindowHours}h{" "}
              <Text style={styles.timingDot}>&middot;</Text> Keep up{" "}
              {offer.persistenceDays} days
            </Text>
          </View>

          {/* Hashtags (teal) */}
          {offer.requiredHashtags.length > 0 && (
            <View style={styles.chipRow}>
              {offer.requiredHashtags.map((h, i) => (
                <View key={i} style={styles.hashtagChip}>
                  <Text style={styles.hashtagText}>{h}</Text>
                </View>
              ))}
            </View>
          )}

          {/* @mentions (amber) */}
          {offer.requiredTags.length > 0 && (
            <View style={styles.chipRow}>
              {offer.requiredTags.map((t, i) => (
                <View key={i} style={styles.mentionChip}>
                  <Text style={styles.mentionText}>{t}</Text>
                </View>
              ))}
            </View>
          )}

          {offer.creativeDirection && (
            <View style={styles.directionBox}>
              <Text style={styles.directionLabel}>Creative direction</Text>
              <Text style={styles.directionText}>
                {offer.creativeDirection}
              </Text>
            </View>
          )}
        </View>

        {/* Availability card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <Calendar size={16} color="#E8573D" strokeWidth={1.5} />
              <Text style={styles.cardTitle}>Availability</Text>
            </View>
          </View>

          {offer.availabilityWindows.map((w, i) => (
            <View
              key={i}
              style={[
                styles.availRow,
                i < offer.availabilityWindows.length - 1 &&
                  styles.availRowBorder,
              ]}
            >
              <Text style={styles.availDays}>
                {w.dayOfWeek.map((d) => DAYS[d]).join(", ")}
              </Text>
              <Text style={styles.availTime}>
                {w.startTime}–{w.endTime}
              </Text>
            </View>
          ))}

          <Text style={styles.redemptionNote}>
            Max {offer.maxRedemptionsPerWeek} redemptions per week
          </Text>
        </View>
      </ScrollView>

      {/* Eligibility banner */}
      {creator && !creator.instagramConnected && !creator.tiktokConnected && (
        <View style={styles.eligibilityBanner}>
          <AlertTriangle size={16} color="#A4750F" strokeWidth={1.5} />
          <Text style={styles.eligibilityText}>
            Connect a social account in Settings to apply to offers
          </Text>
        </View>
      )}

      {/* Apply button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.applyButton, (isIneligible || applying) && styles.applyButtonDisabled]}
          activeOpacity={0.8}
          onPress={handleApply}
          disabled={!!isIneligible || applying}
        >
          {applying ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.applyButtonText}>
              {isIneligible ? "Connect a social account to apply" : "Apply to this offer"}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FDFCFA",
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FDFCFA",
  },
  loadingText: {
    fontFamily: "DMSans_400Regular",
    fontSize: 14,
    color: "#A39D94",
  },

  // ── Header ──────────────────────────
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 56,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: "#FDFCFA",
    borderBottomWidth: 1,
    borderBottomColor: "#F0EDE8",
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F0EDE8",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontFamily: "DMSans_500Medium",
    fontSize: 16,
    color: "#2A2622",
  },

  // ── Scroll area ─────────────────────
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120,
  },

  // ── Business hero ───────────────────
  businessRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 20,
  },
  businessInfo: {
    flex: 1,
  },
  businessNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  businessName: {
    fontFamily: "DMSans_700Bold",
    fontSize: 16,
    color: "#2A2622",
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
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
  locationText: {
    fontFamily: "DMSans_400Regular",
    fontSize: 13,
    color: "#827B72",
    marginTop: 2,
  },

  // ── Title & badges ──────────────────
  offerTitle: {
    fontFamily: "DMSerifDisplay_400Regular",
    fontSize: 26,
    color: "#2A2622",
    marginBottom: 12,
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  valueBadge: {
    backgroundColor: "#FEF2F0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  valueBadgeText: {
    fontFamily: "DMSans_700Bold",
    fontSize: 14,
    color: "#E8573D",
  },
  cashBadge: {
    backgroundColor: "#EEF8F6",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  cashBadgeText: {
    fontFamily: "DMSans_700Bold",
    fontSize: 14,
    color: "#1A7A6D",
  },

  // ── Description ─────────────────────
  description: {
    fontFamily: "DMSans_400Regular",
    fontSize: 15,
    color: "#615B53",
    lineHeight: 22,
    marginBottom: 6,
  },
  exclusions: {
    fontFamily: "DMSans_400Regular",
    fontSize: 13,
    color: "#A39D94",
    fontStyle: "italic",
    marginBottom: 6,
  },

  // ── Shared card ─────────────────────
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#F0EDE8",
    marginTop: 18,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  cardHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cardTitle: {
    fontFamily: "DMSans_700Bold",
    fontSize: 15,
    color: "#2A2622",
  },

  // ── Content requirements ────────────
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
  deliverableRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FAF8F5",
    borderRadius: 8,
    padding: 10,
    marginBottom: 6,
  },
  deliverablePlatform: {
    fontFamily: "DMSans_500Medium",
    fontSize: 13,
    color: "#E8573D",
  },
  deliverableType: {
    fontFamily: "DMSans_400Regular",
    fontSize: 13,
    color: "#615B53",
  },
  timingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 6,
    marginBottom: 4,
  },
  timingText: {
    fontFamily: "DMSans_400Regular",
    fontSize: 13,
    color: "#615B53",
  },
  timingDot: {
    color: "#A39D94",
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 8,
  },
  hashtagChip: {
    backgroundColor: "#EEF8F6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  hashtagText: {
    fontFamily: "DMSans_500Medium",
    fontSize: 12,
    color: "#1A7A6D",
  },
  mentionChip: {
    backgroundColor: "#FEF7E7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  mentionText: {
    fontFamily: "DMSans_500Medium",
    fontSize: 12,
    color: "#A4750F",
  },
  directionBox: {
    backgroundColor: "#FAF8F5",
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
  },
  directionLabel: {
    fontFamily: "DMSans_500Medium",
    fontSize: 12,
    color: "#827B72",
    marginBottom: 4,
  },
  directionText: {
    fontFamily: "DMSans_400Regular",
    fontSize: 13,
    color: "#615B53",
    lineHeight: 19,
  },

  // ── Availability ────────────────────
  availRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
  availRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#F0EDE8",
  },
  availDays: {
    fontFamily: "DMSans_500Medium",
    fontSize: 14,
    color: "#2A2622",
  },
  availTime: {
    fontFamily: "DMSans_400Regular",
    fontSize: 14,
    color: "#615B53",
  },
  redemptionNote: {
    fontFamily: "DMSans_400Regular",
    fontSize: 12,
    color: "#A39D94",
    marginTop: 8,
  },

  // ── Eligibility banner ─────────────
  eligibilityBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FEF7E7",
    borderTopWidth: 1,
    borderTopColor: "#F5E6B8",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  eligibilityText: {
    fontFamily: "DMSans_400Regular",
    fontSize: 13,
    color: "#A4750F",
    flex: 1,
  },

  // ── Bottom bar ──────────────────────
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 34,
    backgroundColor: "#FDFCFA",
    borderTopWidth: 1,
    borderTopColor: "#F0EDE8",
  },
  applyButton: {
    backgroundColor: "#E8573D",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  applyButtonDisabled: {
    backgroundColor: "#A39D94",
  },
  applyButtonText: {
    fontFamily: "DMSans_700Bold",
    fontSize: 16,
    color: "#FFFFFF",
  },
});
