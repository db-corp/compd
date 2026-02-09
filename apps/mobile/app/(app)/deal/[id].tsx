import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  ArrowLeft,
  MapPin,
  CheckCircle,
  Send,
  Camera,
  Clock,
  MessageSquare,
  Star,
  AlertTriangle,
  ShieldAlert,
  Wallet,
} from "lucide-react-native";
import { STATE_CONFIG, TERMINAL_STATES } from "../../../lib/constants";

export default function DealDetail() {
  const { id } = useLocalSearchParams();
  const dealId = id as string as Id<"deals">;
  const router = useRouter();
  const deal = useQuery(api.deals.getById, { id: dealId });
  const messages = useQuery(api.messages.listByDeal, { dealId: dealId });
  const checkInMut = useMutation(api.deals.checkIn);
  const submitContentMut = useMutation(api.deals.submitContent);
  const rateBusinessMut = useMutation(api.deals.rateBusiness);
  const sendMessageMut = useMutation(api.messages.send);
  const cancelMut = useMutation(api.deals.cancel);
  const createDisputeMut = useMutation(api.disputes.create);
  const dispute = useQuery(api.disputes.getByDeal, { dealId: dealId });

  const [tab, setTab] = useState<"details" | "chat">("details");
  const [msgInput, setMsgInput] = useState("");
  const [contentUrl, setContentUrl] = useState("");
  const [showCheckinForm, setShowCheckinForm] = useState(false);
  const [checkinCode, setCheckinCode] = useState("");
  const [showDisputeForm, setShowDisputeForm] = useState(false);
  const [disputeReason, setDisputeReason] = useState("");
  const [disputeDesc, setDisputeDesc] = useState("");
  const [error, setError] = useState("");

  if (deal === undefined) {
    return (
      <View style={styles.loading}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }
  if (!deal) {
    return (
      <View style={styles.loading}>
        <Text style={styles.loadingText}>Deal not found</Text>
      </View>
    );
  }

  const stateInfo = STATE_CONFIG[deal.state] ?? STATE_CONFIG.applied;
  const isTerminal = TERMINAL_STATES.includes(deal.state);

  async function handleCheckIn() {
    try {
      await checkInMut({
        dealId: dealId,
        method: checkinCode ? "code" : "manual",
        code: checkinCode || undefined,
      });
      setShowCheckinForm(false);
    } catch (e: any) {
      setError(e.message);
    }
  }

  async function handleSubmitContent() {
    if (!contentUrl.trim()) return;
    try {
      await submitContentMut({
        dealId: dealId,
        contentUrls: [contentUrl.trim()],
      });
      setContentUrl("");
    } catch (e: any) {
      setError(e.message);
    }
  }

  async function handleSendMessage() {
    if (!msgInput.trim()) return;
    await sendMessageMut({ dealId: dealId, content: msgInput.trim() });
    setMsgInput("");
  }

  async function handleCancel() {
    try {
      await cancelMut({ dealId: dealId });
    } catch (e: any) {
      setError(e.message);
    }
  }

  async function handleOpenDispute() {
    if (!disputeReason.trim() || !disputeDesc.trim()) return;
    try {
      await createDisputeMut({
        dealId: dealId,
        reason: disputeReason.trim(),
        description: disputeDesc.trim(),
      });
      setShowDisputeForm(false);
      setDisputeReason("");
      setDisputeDesc("");
    } catch (e: any) {
      setError(e.message);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={20} color="#2A2622" strokeWidth={1.5} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {deal.business?.name ?? "Deal"}
          </Text>
          <View style={[styles.stateBadge, { backgroundColor: stateInfo.bg }]}>
            <Text style={[styles.stateText, { color: stateInfo.color }]}>
              {stateInfo.label}
            </Text>
          </View>
        </View>
        <View style={{ width: 36 }} />
      </View>

      {/* Tab switcher */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          onPress={() => setTab("details")}
          style={[styles.tabBtn, tab === "details" && styles.tabBtnActive]}
        >
          <Text style={[styles.tabText, tab === "details" && styles.tabTextActive]}>
            Details
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setTab("chat")}
          style={[styles.tabBtn, tab === "chat" && styles.tabBtnActive]}
        >
          <MessageSquare size={14} color={tab === "chat" ? "#E8573D" : "#A39D94"} strokeWidth={1.5} />
          <Text style={[styles.tabText, tab === "chat" && styles.tabTextActive]}>
            Chat
          </Text>
        </TouchableOpacity>
      </View>

      {tab === "details" ? (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          {error ? (
            <TouchableOpacity onPress={() => setError("")} style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>{error}</Text>
              <Text style={styles.errorDismiss}>Dismiss</Text>
            </TouchableOpacity>
          ) : null}

          {/* Value card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Deal terms</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Value</Text>
              <Text style={styles.value}>${deal.contractTerms.barterRetailValue}</Text>
            </View>
            {deal.contractTerms.barterDescription && (
              <Text style={styles.desc}>{deal.contractTerms.barterDescription}</Text>
            )}
            <View style={styles.row}>
              <Text style={styles.label}>Scheduled</Text>
              <Text style={styles.value}>{new Date(deal.scheduledDate).toLocaleDateString()}</Text>
            </View>
            {deal.business?.address && (
              <View style={styles.locationRow}>
                <MapPin size={12} color="#827B72" strokeWidth={1.5} />
                <Text style={styles.locationText}>{deal.business.address}</Text>
              </View>
            )}
          </View>

          {/* Deliverables */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Content requirements</Text>
            {deal.contractTerms.deliverables.map((d, i) => (
              <View key={i} style={styles.deliverableRow}>
                <Camera size={14} color="#E8573D" strokeWidth={1.5} />
                <Text style={styles.deliverableText}>
                  {d.quantity}x {d.platform} {d.type}
                </Text>
              </View>
            ))}
            <View style={styles.row}>
              <Clock size={14} color="#827B72" strokeWidth={1.5} />
              <Text style={styles.label}>
                Post within {deal.contractTerms.contentWindowHours}h · Keep up {deal.contractTerms.persistenceDays} days
              </Text>
            </View>
          </View>

          {/* Payment summary */}
          <View style={styles.card}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Wallet size={16} color="#2D8F5F" strokeWidth={1.5} />
                <Text style={styles.cardTitle}>Payment</Text>
              </View>
              <View style={{ backgroundColor: "#FEF7E7", borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 }}>
                <Text style={{ fontFamily: "DMSans_700Bold", fontSize: 9, color: "#A4750F" }}>DEMO</Text>
              </View>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Barter value</Text>
              <Text style={styles.value}>${deal.contractTerms.barterRetailValue}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Deposit</Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Text style={styles.value}>
                  {deal.commitmentDeposit.required ? `$${deal.commitmentDeposit.amount}` : "None"}
                </Text>
                {deal.commitmentDeposit.required && (
                  <View style={{
                    backgroundColor:
                      deal.commitmentDeposit.status === "held" ? "#FEF7E7" :
                      deal.commitmentDeposit.status === "released" ? "#E8F5EE" :
                      deal.commitmentDeposit.status === "forfeited" ? "#FDECEC" : "#F0EDE8",
                    borderRadius: 4, paddingHorizontal: 5, paddingVertical: 1,
                  }}>
                    <Text style={{
                      fontFamily: "DMSans_500Medium", fontSize: 10,
                      color:
                        deal.commitmentDeposit.status === "held" ? "#A4750F" :
                        deal.commitmentDeposit.status === "released" ? "#2D8F5F" :
                        deal.commitmentDeposit.status === "forfeited" ? "#C93B3B" : "#615B53",
                    }}>
                      {deal.commitmentDeposit.status}
                    </Text>
                  </View>
                )}
              </View>
            </View>
            {deal.platformFee.amount > 0 && (
              <View style={styles.row}>
                <Text style={styles.label}>Platform fee</Text>
                <Text style={styles.value}>${deal.platformFee.amount}</Text>
              </View>
            )}
          </View>

          {/* Revision note */}
          {deal.state === "revision_requested" && deal.revisionNote && (
            <View style={[styles.card, { borderColor: "#D4870B", borderWidth: 1 }]}>
              <Text style={[styles.cardTitle, { color: "#D4870B" }]}>Revision requested</Text>
              <Text style={styles.desc}>{deal.revisionNote}</Text>
            </View>
          )}

          {/* Dispute info card */}
          {dispute && (
            <View style={[styles.card, { borderColor: "#C93B3B", borderWidth: 1 }]}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <ShieldAlert size={16} color="#C93B3B" strokeWidth={1.5} />
                <Text style={[styles.cardTitle, { color: "#C93B3B", marginBottom: 0 }]}>
                  Dispute — {dispute.status === "resolved" ? "Resolved" : "Open"}
                </Text>
              </View>
              <Text style={[styles.label, { marginBottom: 2 }]}>Reason: {dispute.reason}</Text>
              <Text style={styles.desc}>{dispute.description}</Text>
              {dispute.resolution && (
                <View style={[styles.row, { marginTop: 4 }]}>
                  <Text style={styles.label}>Resolution</Text>
                  <Text style={[styles.value, { textTransform: "capitalize" }]}>{dispute.resolution}</Text>
                </View>
              )}
            </View>
          )}

          {/* State-specific action buttons */}
          {deal.state === "approved" && (
            <View style={styles.actionSection}>
              {showCheckinForm ? (
                <View>
                  <Text style={styles.actionLabel}>Enter check-in code (or leave blank)</Text>
                  <TextInput
                    style={styles.input}
                    value={checkinCode}
                    onChangeText={setCheckinCode}
                    placeholder="4-digit code"
                    keyboardType="number-pad"
                    maxLength={4}
                  />
                  <TouchableOpacity style={styles.primaryBtn} onPress={handleCheckIn}>
                    <CheckCircle size={16} color="#FFF" strokeWidth={1.5} />
                    <Text style={styles.primaryBtnText}>Check in</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity style={styles.primaryBtn} onPress={() => setShowCheckinForm(true)}>
                  <CheckCircle size={16} color="#FFF" strokeWidth={1.5} />
                  <Text style={styles.primaryBtnText}>Check in at location</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {(deal.state === "content_pending" || deal.state === "revision_requested") && (
            <View style={styles.actionSection}>
              <Text style={styles.actionLabel}>Submit content URL</Text>
              <TextInput
                style={styles.input}
                value={contentUrl}
                onChangeText={setContentUrl}
                placeholder="https://instagram.com/p/..."
                autoCapitalize="none"
                keyboardType="url"
              />
              <TouchableOpacity style={styles.primaryBtn} onPress={handleSubmitContent}>
                <Send size={16} color="#FFF" strokeWidth={1.5} />
                <Text style={styles.primaryBtnText}>Submit content</Text>
              </TouchableOpacity>
            </View>
          )}

          {deal.state === "completed" && !deal.creatorRating && (
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={() =>
                rateBusinessMut({
                  dealId: dealId,
                  experienceQuality: 5,
                  offerAccuracy: 5,
                  staffFriendliness: 5,
                })
              }
            >
              <Star size={16} color="#FFF" strokeWidth={1.5} />
              <Text style={styles.primaryBtnText}>Rate business</Text>
            </TouchableOpacity>
          )}

          {/* Dispute button for revision_requested (creator can escalate) */}
          {deal.state === "revision_requested" && !dispute && (
            <View style={styles.actionSection}>
              {showDisputeForm ? (
                <View style={[styles.card, { borderColor: "#C93B3B", borderWidth: 1 }]}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 }}>
                    <AlertTriangle size={16} color="#C93B3B" strokeWidth={1.5} />
                    <Text style={[styles.cardTitle, { color: "#C93B3B", marginBottom: 0 }]}>Open a dispute</Text>
                  </View>
                  <TextInput
                    style={styles.input}
                    value={disputeReason}
                    onChangeText={setDisputeReason}
                    placeholder="Reason for dispute"
                  />
                  <TextInput
                    style={[styles.input, { height: 80, textAlignVertical: "top" }]}
                    value={disputeDesc}
                    onChangeText={setDisputeDesc}
                    placeholder="Describe the issue..."
                    multiline
                  />
                  <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: "#C93B3B" }]} onPress={handleOpenDispute}>
                    <ShieldAlert size={16} color="#FFF" strokeWidth={1.5} />
                    <Text style={styles.primaryBtnText}>Open dispute</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.cancelBtn, { marginTop: 8 }]} onPress={() => setShowDisputeForm(false)}>
                    <Text style={styles.cancelBtnText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={[styles.cancelBtn, { borderColor: "#C93B3B" }]}
                  onPress={() => setShowDisputeForm(true)}
                >
                  <Text style={[styles.cancelBtnText, { color: "#C93B3B" }]}>Open dispute</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Cancel button for cancellable states */}
          {["applied", "approved"].includes(deal.state) && (
            <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
              <Text style={styles.cancelBtnText}>Cancel deal</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      ) : (
        /* Chat tab */
        <View style={styles.chatContainer}>
          <FlatList
            data={messages ?? []}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.chatList}
            renderItem={({ item }) => (
              <View style={[styles.msgBubble, item.senderRole === "creator" ? styles.msgRight : styles.msgLeft]}>
                {item.isSystemMessage && <Text style={styles.msgSystem}>System</Text>}
                <Text style={styles.msgText}>{item.content}</Text>
                <Text style={styles.msgTime}>
                  {new Date(item.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </Text>
              </View>
            )}
            ListEmptyComponent={
              <View style={styles.chatEmpty}>
                <Text style={styles.chatEmptyText}>No messages yet</Text>
              </View>
            }
          />
          {!isTerminal && (
            <View style={styles.chatInput}>
              <TextInput
                style={styles.chatTextInput}
                value={msgInput}
                onChangeText={setMsgInput}
                placeholder="Type a message..."
                multiline
              />
              <TouchableOpacity style={styles.sendBtn} onPress={handleSendMessage}>
                <Send size={16} color="#FFF" strokeWidth={1.5} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FDFCFA" },
  loading: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#FDFCFA" },
  loadingText: { fontFamily: "DMSans_400Regular", fontSize: 14, color: "#A39D94" },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingTop: 56, paddingHorizontal: 16, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: "#F0EDE8",
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: "#F0EDE8",
    justifyContent: "center", alignItems: "center",
  },
  headerCenter: { alignItems: "center", gap: 4 },
  headerTitle: { fontFamily: "DMSans_700Bold", fontSize: 16, color: "#2A2622" },
  stateBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  stateText: { fontFamily: "DMSans_500Medium", fontSize: 11 },
  tabRow: {
    flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#F0EDE8",
  },
  tabBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 6, paddingVertical: 12, borderBottomWidth: 2, borderBottomColor: "transparent",
  },
  tabBtnActive: { borderBottomColor: "#E8573D" },
  tabText: { fontFamily: "DMSans_500Medium", fontSize: 14, color: "#A39D94" },
  tabTextActive: { color: "#E8573D" },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  card: {
    backgroundColor: "#FFFFFF", borderRadius: 12, padding: 16,
    borderWidth: 1, borderColor: "#F0EDE8", marginBottom: 16,
  },
  cardTitle: { fontFamily: "DMSans_700Bold", fontSize: 15, color: "#2A2622", marginBottom: 10 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 6, gap: 8 },
  label: { fontFamily: "DMSans_400Regular", fontSize: 14, color: "#827B72" },
  value: { fontFamily: "DMSans_700Bold", fontSize: 14, color: "#2A2622" },
  desc: { fontFamily: "DMSans_400Regular", fontSize: 13, color: "#615B53", lineHeight: 19, marginBottom: 8 },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 },
  locationText: { fontFamily: "DMSans_400Regular", fontSize: 13, color: "#827B72" },
  deliverableRow: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "#FAF8F5", borderRadius: 8, padding: 10, marginBottom: 6,
  },
  deliverableText: { fontFamily: "DMSans_400Regular", fontSize: 13, color: "#615B53" },
  actionSection: { marginBottom: 16 },
  actionLabel: { fontFamily: "DMSans_500Medium", fontSize: 13, color: "#615B53", marginBottom: 8 },
  input: {
    borderWidth: 1, borderColor: "#E0DBD4", borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 10, fontSize: 14,
    fontFamily: "DMSans_400Regular", marginBottom: 10, backgroundColor: "#FFF",
  },
  primaryBtn: {
    backgroundColor: "#E8573D", borderRadius: 12, paddingVertical: 14,
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
  },
  primaryBtnText: { fontFamily: "DMSans_700Bold", fontSize: 15, color: "#FFFFFF" },
  cancelBtn: {
    borderRadius: 12, paddingVertical: 14, alignItems: "center",
    borderWidth: 1, borderColor: "#E0DBD4", marginTop: 8,
  },
  cancelBtnText: { fontFamily: "DMSans_500Medium", fontSize: 14, color: "#A39D94" },
  chatContainer: { flex: 1 },
  chatList: { padding: 16, paddingBottom: 80 },
  msgBubble: { maxWidth: "80%", padding: 10, borderRadius: 12, marginBottom: 8 },
  msgLeft: { alignSelf: "flex-start", backgroundColor: "#F0EDE8" },
  msgRight: { alignSelf: "flex-end", backgroundColor: "#FEF2F0" },
  msgSystem: { fontFamily: "DMSans_500Medium", fontSize: 10, color: "#A39D94", marginBottom: 2 },
  msgText: { fontFamily: "DMSans_400Regular", fontSize: 14, color: "#2A2622" },
  msgTime: { fontFamily: "DMSans_400Regular", fontSize: 10, color: "#A39D94", marginTop: 4 },
  chatEmpty: { flex: 1, justifyContent: "center", alignItems: "center", paddingTop: 60 },
  chatEmptyText: { fontFamily: "DMSans_400Regular", fontSize: 14, color: "#A39D94" },
  chatInput: {
    flexDirection: "row", alignItems: "flex-end", gap: 8,
    padding: 12, paddingBottom: 30, borderTopWidth: 1, borderTopColor: "#F0EDE8",
    backgroundColor: "#FDFCFA",
  },
  chatTextInput: {
    flex: 1, borderWidth: 1, borderColor: "#E0DBD4", borderRadius: 20,
    paddingHorizontal: 16, paddingVertical: 8, fontSize: 14,
    fontFamily: "DMSans_400Regular", maxHeight: 80, backgroundColor: "#FFF",
  },
  sendBtn: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: "#E8573D",
    justifyContent: "center", alignItems: "center",
  },
  errorBanner: {
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  errorBannerText: {
    fontFamily: "DMSans_400Regular",
    fontSize: 13,
    color: "#991B1B",
    flex: 1,
  },
  errorDismiss: {
    fontFamily: "DMSans_700Bold",
    fontSize: 13,
    color: "#DC2626",
    marginLeft: 8,
  },
});
