import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeft,
  MapPin,
  Clock,
  Calendar,
  Camera,
  Tag,
  Shield,
} from "lucide-react-native";
import { DAYS, COMP_TYPE_LABELS } from "../../../lib/constants";

export default function OfferDetail() {
  const { id } = useLocalSearchParams();
  const offerId = id as string as Id<"offers">;
  const router = useRouter();
  const offer = useQuery(api.offers.getById, { id: offerId });

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
        {/* Business info */}
        <View style={styles.businessRow}>
          <View>
            <Text style={styles.businessName}>
              {offer.business?.name ?? "Business"}
            </Text>
            {offer.business?.city && (
              <View style={styles.locationRow}>
                <MapPin size={12} color="#827B72" strokeWidth={1.5} />
                <Text style={styles.locationText}>
                  {offer.business.city}, {offer.business.state}
                </Text>
              </View>
            )}
          </View>
          {offer.business?.isVerified && (
            <View style={styles.verifiedBadge}>
              <Shield size={12} color="#1A7A6D" strokeWidth={1.5} />
              <Text style={styles.verifiedText}>Verified</Text>
            </View>
          )}
        </View>

        {/* Title & description */}
        <Text style={styles.offerTitle}>{offer.title}</Text>
        <Text style={styles.offerDesc}>{offer.description}</Text>

        {/* Value card */}
        <View style={styles.valueCard}>
          <View style={styles.valueRow}>
            <Text style={styles.valueLabel}>
              {COMP_TYPE_LABELS[offer.compensationType]} value
            </Text>
            <Text style={styles.valueAmount}>
              ${offer.barterRetailValue}
            </Text>
          </View>
          {offer.barterDescription && (
            <Text style={styles.barterDesc}>{offer.barterDescription}</Text>
          )}
          {offer.cashAmount != null && offer.cashAmount > 0 && (
            <View style={[styles.valueRow, { marginTop: 8 }]}>
              <Text style={styles.valueLabel}>Cash bonus</Text>
              <Text style={styles.valueAmount}>${offer.cashAmount}</Text>
            </View>
          )}
          {offer.exclusions && (
            <Text style={styles.exclusions}>
              Exclusions: {offer.exclusions}
            </Text>
          )}
        </View>

        {/* Content requirements */}
        <Text style={styles.sectionTitle}>Content requirements</Text>
        <View style={styles.section}>
          <View style={styles.row}>
            <Camera size={14} color="#827B72" strokeWidth={1.5} />
            <Text style={styles.rowLabel}>Tier {offer.contentTier}</Text>
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
          <View style={[styles.row, { marginTop: 8 }]}>
            <Clock size={14} color="#827B72" strokeWidth={1.5} />
            <Text style={styles.rowLabel}>
              Post within {offer.contentWindowHours}h · Keep up{" "}
              {offer.persistenceDays} days
            </Text>
          </View>
          {offer.requiredHashtags.length > 0 && (
            <View style={styles.tagsRow}>
              {offer.requiredHashtags.map((h, i) => (
                <View key={i} style={styles.tagChip}>
                  <Text style={styles.tagText}>{h}</Text>
                </View>
              ))}
            </View>
          )}
          {offer.requiredTags.length > 0 && (
            <View style={styles.tagsRow}>
              {offer.requiredTags.map((t, i) => (
                <View key={i} style={styles.tagChip}>
                  <Text style={styles.tagText}>{t}</Text>
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

        {/* Availability */}
        <Text style={styles.sectionTitle}>Availability</Text>
        <View style={styles.section}>
          {offer.availabilityWindows.map((w, i) => (
            <View key={i} style={styles.availabilityRow}>
              <Calendar size={14} color="#827B72" strokeWidth={1.5} />
              <Text style={styles.rowLabel}>
                {w.dayOfWeek.map((d) => DAYS[d]).join(", ")} · {w.startTime}–
                {w.endTime}
              </Text>
            </View>
          ))}
          <Text style={styles.redemptionNote}>
            Max {offer.maxRedemptionsPerWeek} redemptions per week
          </Text>
        </View>
      </ScrollView>

      {/* Apply button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.applyButton} activeOpacity={0.8}>
          <Text style={styles.applyButtonText}>Apply to this offer</Text>
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120,
  },
  businessRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  businessName: {
    fontFamily: "DMSans_700Bold",
    fontSize: 15,
    color: "#615B53",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  locationText: {
    fontFamily: "DMSans_400Regular",
    fontSize: 12,
    color: "#827B72",
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#EEF8F6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  verifiedText: {
    fontFamily: "DMSans_500Medium",
    fontSize: 11,
    color: "#1A7A6D",
  },
  offerTitle: {
    fontFamily: "DMSerifDisplay_400Regular",
    fontSize: 26,
    color: "#2A2622",
    marginBottom: 8,
  },
  offerDesc: {
    fontFamily: "DMSans_400Regular",
    fontSize: 15,
    color: "#615B53",
    lineHeight: 22,
    marginBottom: 20,
  },
  valueCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#F0EDE8",
    marginBottom: 24,
  },
  valueRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  valueLabel: {
    fontFamily: "DMSans_500Medium",
    fontSize: 14,
    color: "#827B72",
  },
  valueAmount: {
    fontFamily: "DMSans_700Bold",
    fontSize: 22,
    color: "#2A2622",
  },
  barterDesc: {
    fontFamily: "DMSans_400Regular",
    fontSize: 13,
    color: "#A39D94",
    marginTop: 4,
  },
  exclusions: {
    fontFamily: "DMSans_400Regular",
    fontSize: 12,
    color: "#A39D94",
    fontStyle: "italic",
    marginTop: 8,
  },
  sectionTitle: {
    fontFamily: "DMSans_700Bold",
    fontSize: 16,
    color: "#2A2622",
    marginBottom: 10,
  },
  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#F0EDE8",
    marginBottom: 24,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  rowLabel: {
    fontFamily: "DMSans_400Regular",
    fontSize: 14,
    color: "#615B53",
  },
  deliverableRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FAF8F5",
    borderRadius: 8,
    padding: 10,
    marginTop: 8,
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
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 10,
  },
  tagChip: {
    backgroundColor: "#EEF8F6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagText: {
    fontFamily: "DMSans_500Medium",
    fontSize: 12,
    color: "#1A7A6D",
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
  availabilityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  redemptionNote: {
    fontFamily: "DMSans_400Regular",
    fontSize: 12,
    color: "#A39D94",
    marginTop: 4,
  },
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
  applyButtonText: {
    fontFamily: "DMSans_700Bold",
    fontSize: 16,
    color: "#FFFFFF",
  },
});
