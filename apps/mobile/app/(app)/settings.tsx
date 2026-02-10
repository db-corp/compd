import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import {
  ArrowLeft,
  Instagram,
  Link2,
  Unlink,
  CheckCircle,
} from "lucide-react-native";
import { startInstagramAuth } from "../../lib/instagramAuth";
import { startTikTokAuth } from "../../lib/tiktokAuth";

export default function Settings() {
  const router = useRouter();
  const user = useQuery(api.users.getCurrent);
  const creator = useQuery(api.creators.getCurrent);
  const business = useQuery(api.businesses.getCurrent);
  const disconnectInstagram = useMutation(api.socialAuth.disconnectInstagram);
  const disconnectTikTok = useMutation(api.socialAuth.disconnectTikTok);

  const connectInstagram = useMutation(api.socialAuth.connectInstagram);
  const connectTikTok = useMutation(api.socialAuth.connectTikTok);

  const [disconnecting, setDisconnecting] = useState<string | null>(null);
  const [connecting, setConnecting] = useState<string | null>(null);

  const isCreator = user?.role === "creator";

  const handleConnectInstagram = async () => {
    if (!user) return;
    setConnecting("instagram");
    try {
      const result = await startInstagramAuth(user.clerkId);
      if (result.success && result.handle) {
        await connectInstagram({
          handle: result.handle,
          followerCount: result.followerCount,
        });
      } else if (result.error) {
        Alert.alert("Instagram", result.error);
      }
    } catch (err: any) {
      Alert.alert("Error", err.message ?? "Failed to connect Instagram");
    }
    setConnecting(null);
  };

  const handleConnectTikTok = async () => {
    if (!user) return;
    setConnecting("tiktok");
    try {
      const result = await startTikTokAuth(user.clerkId);
      if (result.success && result.handle) {
        await connectTikTok({
          handle: result.handle,
          followerCount: result.followerCount,
        });
      } else if (result.error) {
        Alert.alert("TikTok", result.error);
      }
    } catch (err: any) {
      Alert.alert("Error", err.message ?? "Failed to connect TikTok");
    }
    setConnecting(null);
  };

  const handleDisconnectInstagram = async () => {
    Alert.alert(
      "Disconnect Instagram?",
      "Your Instagram handle and metrics will be removed.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Disconnect",
          style: "destructive",
          onPress: async () => {
            setDisconnecting("instagram");
            try {
              await disconnectInstagram({});
            } catch (err: any) {
              Alert.alert("Error", err.message);
            }
            setDisconnecting(null);
          },
        },
      ]
    );
  };

  const handleDisconnectTikTok = async () => {
    Alert.alert(
      "Disconnect TikTok?",
      "Your TikTok handle and metrics will be removed.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Disconnect",
          style: "destructive",
          onPress: async () => {
            setDisconnecting("tiktok");
            try {
              await disconnectTikTok({});
            } catch (err: any) {
              Alert.alert("Error", err.message);
            }
            setDisconnecting(null);
          },
        },
      ]
    );
  };

  if (!user) {
    return (
      <View style={styles.loading}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={20} color="#2A2622" strokeWidth={1.5} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Connected Accounts */}
        <Text style={styles.sectionTitle}>Connected accounts</Text>

        {/* Instagram */}
        <View style={styles.accountCard}>
          <View style={styles.accountHeader}>
            <Instagram size={18} color="#C13584" strokeWidth={1.5} />
            <Text style={styles.accountTitle}>Instagram</Text>
          </View>

          {(isCreator ? creator?.instagramHandle : business?.instagramHandle) ? (
            <>
              <View style={styles.accountInfo}>
                <View style={styles.connectedBadge}>
                  <CheckCircle size={12} color="#1A7A6D" strokeWidth={1.5} />
                  <Text style={styles.connectedText}>Connected</Text>
                </View>
                <Text style={styles.handleText}>
                  @{isCreator ? creator?.instagramHandle : business?.instagramHandle}
                </Text>
              </View>

              {isCreator && creator?.instagramFollowerCount != null && creator.instagramFollowerCount > 0 && (
                <View style={styles.metricsRow}>
                  <View style={styles.metricItem}>
                    <Text style={styles.metricValue}>
                      {creator.instagramFollowerCount.toLocaleString()}
                    </Text>
                    <Text style={styles.metricLabel}>Followers</Text>
                  </View>
                  {creator.instagramEngagementRate != null && (
                    <View style={styles.metricItem}>
                      <Text style={styles.metricValue}>
                        {(creator.instagramEngagementRate * 100).toFixed(1)}%
                      </Text>
                      <Text style={styles.metricLabel}>Engagement</Text>
                    </View>
                  )}
                </View>
              )}

              {isCreator && creator?.metricsLastUpdatedAt && (
                <Text style={styles.lastSynced}>
                  Last synced: {new Date(creator.metricsLastUpdatedAt).toLocaleDateString()}
                </Text>
              )}

              <TouchableOpacity
                style={styles.disconnectButton}
                onPress={handleDisconnectInstagram}
                disabled={disconnecting === "instagram"}
              >
                {disconnecting === "instagram" ? (
                  <ActivityIndicator size="small" color="#C93B3B" />
                ) : (
                  <Unlink size={14} color="#C93B3B" strokeWidth={1.5} />
                )}
                <Text style={styles.disconnectText}>Disconnect</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={styles.connectButton}
              onPress={handleConnectInstagram}
              disabled={connecting === "instagram"}
            >
              {connecting === "instagram" ? (
                <ActivityIndicator size="small" color="#1A7A6D" />
              ) : (
                <Link2 size={14} color="#1A7A6D" strokeWidth={1.5} />
              )}
              <Text style={styles.connectText}>
                {connecting === "instagram" ? "Connecting..." : "Connect Instagram"}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* TikTok (creator only) */}
        {isCreator && (
          <View style={styles.accountCard}>
            <View style={styles.accountHeader}>
              <View style={styles.tiktokIcon}>
                <Text style={{ color: "#FFF", fontSize: 10, fontWeight: "700" }}>TT</Text>
              </View>
              <Text style={styles.accountTitle}>TikTok</Text>
            </View>

            {creator?.tiktokHandle ? (
              <>
                <View style={styles.accountInfo}>
                  <View style={styles.connectedBadge}>
                    <CheckCircle size={12} color="#1A7A6D" strokeWidth={1.5} />
                    <Text style={styles.connectedText}>Connected</Text>
                  </View>
                  <Text style={styles.handleText}>@{creator.tiktokHandle}</Text>
                </View>

                {creator.tiktokFollowerCount != null && creator.tiktokFollowerCount > 0 && (
                  <View style={styles.metricsRow}>
                    <View style={styles.metricItem}>
                      <Text style={styles.metricValue}>
                        {creator.tiktokFollowerCount.toLocaleString()}
                      </Text>
                      <Text style={styles.metricLabel}>Followers</Text>
                    </View>
                    {creator.tiktokEngagementRate != null && (
                      <View style={styles.metricItem}>
                        <Text style={styles.metricValue}>
                          {(creator.tiktokEngagementRate * 100).toFixed(1)}%
                        </Text>
                        <Text style={styles.metricLabel}>Engagement</Text>
                      </View>
                    )}
                  </View>
                )}

                <TouchableOpacity
                  style={styles.disconnectButton}
                  onPress={handleDisconnectTikTok}
                  disabled={disconnecting === "tiktok"}
                >
                  {disconnecting === "tiktok" ? (
                    <ActivityIndicator size="small" color="#C93B3B" />
                  ) : (
                    <Unlink size={14} color="#C93B3B" strokeWidth={1.5} />
                  )}
                  <Text style={styles.disconnectText}>Disconnect</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                style={styles.connectButton}
                onPress={handleConnectTikTok}
                disabled={connecting === "tiktok"}
              >
                {connecting === "tiktok" ? (
                  <ActivityIndicator size="small" color="#1A7A6D" />
                ) : (
                  <Link2 size={14} color="#1A7A6D" strokeWidth={1.5} />
                )}
                <Text style={styles.connectText}>
                  {connecting === "tiktok" ? "Connecting..." : "Connect TikTok"}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        <Text style={styles.oauthNote}>
          OAuth verification requires app approval from Meta and TikTok.
          Manual handle entry is currently available for testing.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FDFCFA" },
  loading: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#FDFCFA" },
  loadingText: { fontFamily: "DMSans_400Regular", fontSize: 14, color: "#A39D94" },

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

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 100,
  },

  sectionTitle: {
    fontFamily: "DMSans_700Bold",
    fontSize: 18,
    color: "#2A2622",
    marginBottom: 12,
  },

  accountCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#F0EDE8",
    marginBottom: 12,
  },
  accountHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  accountTitle: {
    fontFamily: "DMSans_700Bold",
    fontSize: 15,
    color: "#2A2622",
  },
  accountInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  connectedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#EEF8F6",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  connectedText: {
    fontFamily: "DMSans_500Medium",
    fontSize: 11,
    color: "#1A7A6D",
  },
  handleText: {
    fontFamily: "DMSans_500Medium",
    fontSize: 14,
    color: "#2A2622",
  },
  metricsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 8,
  },
  metricItem: {
    backgroundColor: "#FAF8F5",
    borderRadius: 8,
    padding: 10,
    flex: 1,
    alignItems: "center",
  },
  metricValue: {
    fontFamily: "DMSans_700Bold",
    fontSize: 16,
    color: "#2A2622",
  },
  metricLabel: {
    fontFamily: "DMSans_400Regular",
    fontSize: 11,
    color: "#827B72",
    marginTop: 2,
  },
  lastSynced: {
    fontFamily: "DMSans_400Regular",
    fontSize: 11,
    color: "#A39D94",
    marginBottom: 8,
  },
  disconnectButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#FDECEC",
    borderRadius: 8,
    backgroundColor: "#FDECEC",
  },
  disconnectText: {
    fontFamily: "DMSans_500Medium",
    fontSize: 13,
    color: "#C93B3B",
  },
  connectButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#1A7A6D",
    borderRadius: 8,
    backgroundColor: "#EEF8F6",
  },
  connectText: {
    fontFamily: "DMSans_500Medium",
    fontSize: 13,
    color: "#1A7A6D",
  },
  tiktokIcon: {
    width: 22,
    height: 22,
    borderRadius: 5,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },
  oauthNote: {
    fontFamily: "DMSans_400Regular",
    fontSize: 12,
    color: "#A39D94",
    marginTop: 8,
    fontStyle: "italic",
    textAlign: "center",
  },
});
