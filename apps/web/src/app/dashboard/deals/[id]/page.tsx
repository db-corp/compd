"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft,
  CheckCircle,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Send,
  ExternalLink,
  RotateCcw,
  Star,
  AlertTriangle,
  ShieldAlert,
  DollarSign,
  Wallet,
  Ticket,
  Copy,
} from "lucide-react";
import LoadingState from "@/components/ui/LoadingState";
import { REVISION_REASON_LABELS } from "@/lib/constants";

const STATE_LABELS: Record<string, { label: string; color: string }> = {
  applied: { label: "Applied", color: "bg-accent-100 text-accent-600" },
  approved: { label: "Approved", color: "bg-secondary-100 text-secondary-700" },
  checked_in: { label: "Checked In", color: "bg-secondary-100 text-secondary-700" },
  content_pending: { label: "Awaiting Content", color: "bg-accent-100 text-accent-600" },
  content_submitted: { label: "Content Submitted", color: "bg-info/10 text-info" },
  content_verified: { label: "Content Verified", color: "bg-info/10 text-info" },
  revision_requested: { label: "Revision Requested", color: "bg-warning/10 text-warning" },
  business_reviewed: { label: "Reviewed", color: "bg-secondary-100 text-secondary-700" },
  completed: { label: "Completed", color: "bg-success/10 text-success" },
  declined: { label: "Declined", color: "bg-neutral-100 text-neutral-400" },
  cancelled: { label: "Cancelled", color: "bg-neutral-100 text-neutral-400" },
  no_show: { label: "No Show", color: "bg-error/10 text-error" },
  expired: { label: "Expired", color: "bg-error/10 text-error" },
  unfulfilled: { label: "Unfulfilled", color: "bg-error/10 text-error" },
  disputed: { label: "Disputed", color: "bg-error/10 text-error" },
};

export default function DealDetailPage() {
  const params = useParams();
  const dealId = params.id as string as Id<"deals">;
  const deal = useQuery(api.deals.getById, { id: dealId });
  const messages = useQuery(api.messages.listByDeal, {
    dealId: dealId,
  });
  const attributionCode = useQuery(api.attribution.getByDeal, { dealId: dealId });
  const approveDeal = useMutation(api.deals.approve);
  const declineDeal = useMutation(api.deals.decline);
  const confirmServiceMut = useMutation(api.deals.confirmService);
  const approveContentMut = useMutation(api.deals.approveContent);
  const requestRevisionMut = useMutation(api.deals.requestRevision);
  const completeDeal = useMutation(api.deals.complete);
  const rateCreatorMut = useMutation(api.deals.rateCreator);
  const sendMessage = useMutation(api.messages.send);
  const createDispute = useMutation(api.disputes.create);
  const dispute = useQuery(api.disputes.getByDeal, { dealId: dealId });
  const resolveDispute = useMutation(api.disputes.resolve);

  const [msgInput, setMsgInput] = useState("");
  const [revisionNote, setRevisionNote] = useState("");
  const [selectedRevisionReasons, setSelectedRevisionReasons] = useState<string[]>([]);
  const [showRevisionForm, setShowRevisionForm] = useState(false);
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [showDisputeForm, setShowDisputeForm] = useState(false);
  const [disputeForm, setDisputeForm] = useState({ reason: "", description: "" });
  const [rating, setRating] = useState({ contentQuality: 5, professionalism: 5, wouldWorkAgain: true, comment: "" });
  const [error, setError] = useState("");

  if (deal === undefined) {
    return <LoadingState />;
  }
  if (!deal) {
    return (
      <div className="text-center py-16">
        <p className="text-neutral-500">Deal not found</p>
      </div>
    );
  }

  const stateInfo = STATE_LABELS[deal.state] ?? STATE_LABELS.applied;

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!msgInput.trim()) return;
    await sendMessage({ dealId: dealId, content: msgInput.trim() });
    setMsgInput("");
  }

  async function handleAction(action: string) {
    try {
      if (action === "approve") await approveDeal({ dealId: dealId });
      if (action === "decline") await declineDeal({ dealId: dealId });
      if (action === "confirm_service") await confirmServiceMut({ dealId: dealId });
      if (action === "approve_content") await approveContentMut({ dealId: dealId });
      if (action === "complete") await completeDeal({ dealId: dealId });
    } catch (e: any) {
      setError(e.message);
    }
  }

  async function handleRevision() {
    if (selectedRevisionReasons.length === 0 && !revisionNote.trim()) return;
    try {
      await requestRevisionMut({
        dealId: dealId,
        note: revisionNote.trim() || undefined,
        revisionReasons: selectedRevisionReasons.length > 0 ? selectedRevisionReasons : undefined,
      });
      setShowRevisionForm(false);
      setRevisionNote("");
      setSelectedRevisionReasons([]);
    } catch (e: any) {
      setError(e.message);
    }
  }

  function toggleRevisionReason(reason: string) {
    setSelectedRevisionReasons((prev) =>
      prev.includes(reason) ? prev.filter((r) => r !== reason) : [...prev, reason]
    );
  }

  async function handleRate() {
    try {
      await rateCreatorMut({
        dealId: dealId,
        contentQuality: rating.contentQuality,
        professionalism: rating.professionalism,
        wouldWorkAgain: rating.wouldWorkAgain,
        comment: rating.comment || undefined,
      });
      setShowRatingForm(false);
    } catch (e: any) {
      setError(e.message);
    }
  }

  async function handleOpenDispute() {
    if (!disputeForm.reason.trim() || !disputeForm.description.trim()) return;
    try {
      await createDispute({
        dealId: dealId,
        reason: disputeForm.reason.trim(),
        description: disputeForm.description.trim(),
      });
      setShowDisputeForm(false);
      setDisputeForm({ reason: "", description: "" });
    } catch (e: any) {
      setError(e.message);
    }
  }

  async function handleResolveDispute(resolution: string) {
    if (!dispute) return;
    try {
      await resolveDispute({
        disputeId: dispute._id,
        resolution,
        resolutionNote: `Resolved as ${resolution} by business`,
      });
    } catch (e: any) {
      setError(e.message);
    }
  }

  const isTerminal = ["completed", "declined", "cancelled", "no_show", "unfulfilled"].includes(deal.state);

  return (
    <div className="max-w-4xl">
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-800 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError("")} className="text-red-600 hover:text-red-800 font-medium text-xs">Dismiss</button>
        </div>
      )}

      <Link
        href="/dashboard/deals"
        className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-700 mb-4"
      >
        <ArrowLeft size={14} /> Back to deals
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-serif text-2xl text-neutral-800">
              {deal.creator?.user?.name ?? "Creator"}
            </h1>
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${stateInfo.color}`}>
              {stateInfo.label}
            </span>
          </div>
          <p className="text-neutral-500 mt-1">
            {deal.offer?.title} · ${deal.contractTerms.barterRetailValue} value
          </p>
        </div>

        {/* State-appropriate actions */}
        <div className="flex gap-2">
          {deal.state === "applied" && (
            <>
              <button onClick={() => handleAction("approve")} className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary-500 text-white rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors">
                <ThumbsUp size={14} /> Approve
              </button>
              <button onClick={() => handleAction("decline")} className="inline-flex items-center gap-1.5 px-4 py-2 border border-neutral-200 text-neutral-600 rounded-lg text-sm font-medium hover:bg-neutral-50 transition-colors">
                <ThumbsDown size={14} /> Decline
              </button>
            </>
          )}
          {deal.state === "checked_in" && (
            <button onClick={() => handleAction("confirm_service")} className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary-500 text-white rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors">
              <CheckCircle size={14} /> Confirm Service
            </button>
          )}
          {deal.state === "content_verified" && (
            <>
              <button onClick={() => handleAction("approve_content")} className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary-500 text-white rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors">
                <ThumbsUp size={14} /> Approve Content
              </button>
              {(deal.revisionCount ?? 0) < 1 ? (
                <button onClick={() => setShowRevisionForm(!showRevisionForm)} className="inline-flex items-center gap-1.5 px-4 py-2 border border-neutral-200 text-neutral-600 rounded-lg text-sm font-medium hover:bg-neutral-50 transition-colors">
                  <RotateCcw size={14} /> Request Revision
                </button>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-4 py-2 border border-neutral-100 text-neutral-400 rounded-lg text-sm font-medium cursor-not-allowed">
                  <RotateCcw size={14} /> Revision used
                </span>
              )}
              <button onClick={() => setShowDisputeForm(!showDisputeForm)} className="inline-flex items-center gap-1.5 px-4 py-2 border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors">
                <AlertTriangle size={14} /> Dispute
              </button>
            </>
          )}
          {deal.state === "business_reviewed" && (
            <button onClick={() => handleAction("complete")} className="inline-flex items-center gap-1.5 px-4 py-2 bg-secondary-500 text-white rounded-lg text-sm font-medium hover:bg-secondary-600 transition-colors">
              <CheckCircle size={14} /> Complete Deal
            </button>
          )}
          {deal.state === "completed" && !deal.businessRating && (
            <button onClick={() => setShowRatingForm(true)} className="inline-flex items-center gap-1.5 px-4 py-2 bg-accent-400 text-white rounded-lg text-sm font-medium hover:bg-accent-500 transition-colors">
              <Star size={14} /> Rate Creator
            </button>
          )}
        </div>
      </div>

      {/* Revision form */}
      {showRevisionForm && (
        <div className="bg-warning/5 border border-warning/20 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-neutral-700">Request revision</p>
            <span className="text-xs text-neutral-400">
              {(deal.revisionCount ?? 0) < 1 ? "1 revision remaining" : "No revisions remaining"}
            </span>
          </div>
          <p className="text-xs text-neutral-500 mb-2">Select the reason(s) for revision:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
            {Object.entries(REVISION_REASON_LABELS).map(([value, label]) => ({ value, label })).map((reason) => (
              <label
                key={reason.value}
                className={`flex items-center gap-2 px-3 py-2 rounded-md border text-sm cursor-pointer transition-colors ${
                  selectedRevisionReasons.includes(reason.value)
                    ? "border-warning bg-warning/10 text-neutral-800"
                    : "border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedRevisionReasons.includes(reason.value)}
                  onChange={() => toggleRevisionReason(reason.value)}
                  className="accent-warning"
                />
                {reason.label}
              </label>
            ))}
          </div>
          <textarea value={revisionNote} onChange={(e) => setRevisionNote(e.target.value)} rows={2} placeholder="Additional notes (optional)..." className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm mb-2" />
          <div className="flex gap-2">
            <button
              onClick={handleRevision}
              disabled={selectedRevisionReasons.length === 0 && !revisionNote.trim()}
              className="px-3 py-1.5 bg-warning text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send revision request
            </button>
            <button onClick={() => { setShowRevisionForm(false); setSelectedRevisionReasons([]); }} className="px-3 py-1.5 text-sm text-neutral-500">Cancel</button>
          </div>
        </div>
      )}

      {/* Rating form */}
      {showRatingForm && (
        <div className="bg-accent-50 border border-accent-200 rounded-lg p-4 mb-6">
          <p className="text-sm font-medium text-neutral-700 mb-3">Rate this creator</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
            <div>
              <label className="text-xs text-neutral-500">Content quality (1-5)</label>
              <input type="number" min={1} max={5} value={rating.contentQuality} onChange={(e) => setRating({ ...rating, contentQuality: parseInt(e.target.value) || 5 })} className="w-full border border-neutral-200 rounded-md px-2 py-1.5 text-sm mt-1" />
            </div>
            <div>
              <label className="text-xs text-neutral-500">Professionalism (1-5)</label>
              <input type="number" min={1} max={5} value={rating.professionalism} onChange={(e) => setRating({ ...rating, professionalism: parseInt(e.target.value) || 5 })} className="w-full border border-neutral-200 rounded-md px-2 py-1.5 text-sm mt-1" />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-neutral-700 mb-3">
            <input type="checkbox" checked={rating.wouldWorkAgain} onChange={(e) => setRating({ ...rating, wouldWorkAgain: e.target.checked })} /> Would work again
          </label>
          <textarea value={rating.comment} onChange={(e) => setRating({ ...rating, comment: e.target.value })} rows={2} placeholder="Optional comment..." className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm mb-2" />
          <div className="flex gap-2">
            <button onClick={handleRate} className="px-3 py-1.5 bg-accent-400 text-white rounded-lg text-sm font-medium">Submit rating</button>
            <button onClick={() => setShowRatingForm(false)} className="px-3 py-1.5 text-sm text-neutral-500">Cancel</button>
          </div>
        </div>
      )}

      {/* Dispute form */}
      {showDisputeForm && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <ShieldAlert size={16} className="text-red-600" />
            <p className="text-sm font-medium text-red-800">Open a dispute</p>
          </div>
          <input
            type="text"
            value={disputeForm.reason}
            onChange={(e) => setDisputeForm({ ...disputeForm, reason: e.target.value })}
            placeholder="Reason (e.g., Content doesn't meet requirements)"
            className="w-full border border-red-200 rounded-lg px-3 py-2 text-sm mb-2"
          />
          <textarea
            value={disputeForm.description}
            onChange={(e) => setDisputeForm({ ...disputeForm, description: e.target.value })}
            rows={3}
            placeholder="Describe the issue in detail..."
            className="w-full border border-red-200 rounded-lg px-3 py-2 text-sm mb-2"
          />
          <div className="flex gap-2">
            <button onClick={handleOpenDispute} className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700">
              Open Dispute
            </button>
            <button onClick={() => setShowDisputeForm(false)} className="px-3 py-1.5 text-sm text-neutral-500">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Dispute info card */}
      {dispute && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-5 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <ShieldAlert size={18} className="text-red-600" />
            <h3 className="font-semibold text-red-800">
              Dispute — {dispute.status === "resolved" ? "Resolved" : "Open"}
            </h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-red-600">Opened by</span>
              <span className="text-red-800">{dispute.initiatorName} ({dispute.initiatorRole})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-red-600">Reason</span>
              <span className="text-red-800">{dispute.reason}</span>
            </div>
            <p className="text-red-700 bg-white/50 rounded-md p-2">{dispute.description}</p>
            {dispute.resolution && (
              <div className="flex justify-between pt-2 border-t border-red-200">
                <span className="text-red-600">Resolution</span>
                <span className="text-red-800 capitalize">{dispute.resolution}</span>
              </div>
            )}
            {dispute.resolutionNote && (
              <p className="text-red-700 text-xs">{dispute.resolutionNote}</p>
            )}
          </div>
          {deal.state === "disputed" && (dispute.status === "open" || dispute.status === "under_review") && (
            <div className="flex gap-2 mt-4 pt-3 border-t border-red-200">
              <button
                onClick={() => handleResolveDispute("completed")}
                className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
              >
                Resolve as Completed
              </button>
              <button
                onClick={() => handleResolveDispute("unfulfilled")}
                className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
              >
                Mark Unfulfilled
              </button>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column — deal info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Creator info */}
          <div className="bg-white border border-neutral-100 rounded-lg p-5 shadow-sm">
            <h2 className="font-serif text-lg text-neutral-800 mb-3">Creator</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-500">Name</span>
                <span className="text-neutral-800">{deal.creator?.user?.name ?? "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Trust tier</span>
                <span className="text-neutral-800 capitalize">{deal.creator?.trustTier ?? "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Fulfillment rate</span>
                <span className="text-neutral-800">{deal.creator?.fulfillmentRate != null ? `${Math.round(deal.creator.fulfillmentRate * 100)}%` : "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Completed deals</span>
                <span className="text-neutral-800">{deal.creator?.totalCompletedDeals ?? 0}</span>
              </div>
              {deal.creator?.instagramHandle && (
                <div className="flex justify-between">
                  <span className="text-neutral-500">Instagram</span>
                  <span className="text-neutral-800">@{deal.creator.instagramHandle}</span>
                </div>
              )}
            </div>
          </div>

          {/* Contract terms */}
          <div className="bg-white border border-neutral-100 rounded-lg p-5 shadow-sm">
            <h2 className="font-serif text-lg text-neutral-800 mb-3">Contract</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-500">Value</span>
                <span className="text-neutral-800 font-medium">${deal.contractTerms.barterRetailValue}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Tier</span>
                <span className="text-neutral-800">{deal.contractTerms.contentTier}</span>
              </div>
              <div>
                <span className="text-neutral-500">Deliverables</span>
                <div className="mt-1 space-y-1">
                  {deal.contractTerms.deliverables.map((d, i) => (
                    <div key={i} className="bg-neutral-50 rounded-md px-2.5 py-1.5 text-xs text-neutral-700">
                      {d.quantity}x {d.platform} {d.type}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Content window</span>
                <span className="text-neutral-800">{deal.contractTerms.contentWindowHours}h</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Scheduled</span>
                <span className="text-neutral-800">{new Date(deal.scheduledDate).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Payment summary */}
          <div className="bg-white border border-neutral-100 rounded-lg p-5 shadow-sm">
            <h2 className="font-serif text-lg text-neutral-800 mb-3 flex items-center gap-2">
              <Wallet size={16} strokeWidth={1.5} className="text-green-600" />
              Payment
              <span className="text-[10px] font-medium bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full ml-auto">
                DEMO MODE
              </span>
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-500">Barter value</span>
                <span className="text-neutral-800 font-medium">${deal.contractTerms.barterRetailValue}</span>
              </div>
              {(deal.contractTerms.cashAmount ?? 0) > 0 && (
                <div className="flex justify-between">
                  <span className="text-neutral-500">Cash amount</span>
                  <span className="text-neutral-800 font-medium">${deal.contractTerms.cashAmount}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-neutral-500">Creator deposit</span>
                <div className="flex items-center gap-2">
                  <span className="text-neutral-800">
                    {deal.commitmentDeposit.required ? `$${deal.commitmentDeposit.amount}` : "None"}
                  </span>
                  {deal.commitmentDeposit.required && (
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                      deal.commitmentDeposit.status === "held" ? "bg-amber-100 text-amber-700" :
                      deal.commitmentDeposit.status === "released" ? "bg-green-100 text-green-700" :
                      deal.commitmentDeposit.status === "forfeited" ? "bg-red-100 text-red-700" :
                      "bg-neutral-100 text-neutral-500"
                    }`}>
                      {deal.commitmentDeposit.status}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-500">Platform fee</span>
                <div className="flex items-center gap-2">
                  <span className="text-neutral-800">
                    {deal.platformFee.amount > 0 ? `$${deal.platformFee.amount}` : "TBD"}
                  </span>
                  {deal.platformFee.status !== "pending" && (
                    <span className="text-[10px] font-medium bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">
                      {deal.platformFee.status}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Content URLs (if submitted) */}
          {deal.contentUrls && deal.contentUrls.length > 0 && (
            <div className="bg-white border border-neutral-100 rounded-lg p-5 shadow-sm">
              <h2 className="font-serif text-lg text-neutral-800 mb-3">Submitted Content</h2>
              <div className="space-y-2">
                {deal.contentUrls.map((url: string, i: number) => (
                  <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary-500 hover:text-primary-600">
                    <ExternalLink size={14} /> {url}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Attribution code */}
          {attributionCode && (
            <div className="bg-white border border-neutral-100 rounded-lg p-5 shadow-sm">
              <h2 className="font-serif text-lg text-neutral-800 mb-3 flex items-center gap-2">
                <Ticket size={16} strokeWidth={1.5} className="text-primary-500" />
                Attribution Code
              </h2>
              <div className="flex items-center gap-3 bg-primary-50 rounded-lg px-4 py-3 mb-3">
                <code className="text-lg font-bold text-primary-600 tracking-wide">
                  {attributionCode.code}
                </code>
                <button
                  onClick={() => navigator.clipboard.writeText(attributionCode.code)}
                  className="p-1.5 text-primary-400 hover:text-primary-600 transition-colors"
                  title="Copy code"
                >
                  <Copy size={14} />
                </button>
              </div>
              <div className="flex items-center gap-4 text-xs text-neutral-500">
                <span>{attributionCode.redemptions} redemptions</span>
                {attributionCode.estimatedRevenue !== undefined && attributionCode.estimatedRevenue > 0 && (
                  <span>${attributionCode.estimatedRevenue.toLocaleString()} est. revenue</span>
                )}
                <span className={attributionCode.isActive ? "text-success" : "text-neutral-400"}>
                  {attributionCode.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          )}

          {/* Creator note */}
          {deal.creatorNote && (
            <div className="bg-white border border-neutral-100 rounded-lg p-5 shadow-sm">
              <h2 className="font-serif text-lg text-neutral-800 mb-2">Creator's Note</h2>
              <p className="text-sm text-neutral-600">{deal.creatorNote}</p>
            </div>
          )}
        </div>

        {/* Right column — chat */}
        <div className="bg-white border border-neutral-100 rounded-lg shadow-sm flex flex-col h-[500px]">
          <div className="p-4 border-b border-neutral-100">
            <h2 className="font-serif text-lg text-neutral-800 flex items-center gap-2">
              <MessageSquare size={16} /> Chat
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages?.map((msg) => (
              <div key={msg._id} className={`flex ${msg.senderRole === "business" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] px-3 py-2 rounded-lg text-sm ${msg.senderRole === "business" ? "bg-primary-50 text-neutral-800" : "bg-neutral-50 text-neutral-800"}`}>
                  {msg.isSystemMessage && <p className="text-xs text-neutral-400 mb-1">System</p>}
                  <p>{msg.content}</p>
                  <p className="text-[10px] text-neutral-400 mt-1">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            ))}
            {(!messages || messages.length === 0) && (
              <p className="text-center text-sm text-neutral-400 py-8">No messages yet</p>
            )}
          </div>
          {!isTerminal && (
            <form onSubmit={handleSendMessage} className="p-3 border-t border-neutral-100 flex gap-2">
              <input type="text" value={msgInput} onChange={(e) => setMsgInput(e.target.value)} placeholder="Type a message..." className="flex-1 border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" />
              <button type="submit" className="p-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">
                <Send size={16} />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
