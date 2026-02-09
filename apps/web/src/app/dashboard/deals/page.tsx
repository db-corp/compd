"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import Link from "next/link";
import { useState } from "react";
import {
  Handshake,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
} from "lucide-react";
import LoadingState from "@/components/ui/LoadingState";

const STATE_CONFIG: Record<
  string,
  { label: string; color: string; group: string }
> = {
  applied: { label: "Applied", color: "bg-accent-100 text-accent-600", group: "pending" },
  approved: { label: "Approved", color: "bg-secondary-100 text-secondary-700", group: "active" },
  checked_in: { label: "Checked In", color: "bg-secondary-100 text-secondary-700", group: "active" },
  content_pending: { label: "Awaiting Content", color: "bg-accent-100 text-accent-600", group: "active" },
  content_submitted: { label: "Content Submitted", color: "bg-info/10 text-info", group: "active" },
  content_verified: { label: "Content Verified", color: "bg-info/10 text-info", group: "review" },
  revision_requested: { label: "Revision Requested", color: "bg-warning/10 text-warning", group: "review" },
  business_reviewed: { label: "Reviewed", color: "bg-secondary-100 text-secondary-700", group: "review" },
  completed: { label: "Completed", color: "bg-success/10 text-success", group: "done" },
  declined: { label: "Declined", color: "bg-neutral-100 text-neutral-400", group: "done" },
  cancelled: { label: "Cancelled", color: "bg-neutral-100 text-neutral-400", group: "done" },
  no_show: { label: "No Show", color: "bg-error/10 text-error", group: "done" },
  expired: { label: "Expired", color: "bg-error/10 text-error", group: "done" },
  unfulfilled: { label: "Unfulfilled", color: "bg-error/10 text-error", group: "done" },
  disputed: { label: "Disputed", color: "bg-error/10 text-error", group: "review" },
};

const TABS = [
  { key: "all", label: "All" },
  { key: "pending", label: "Applications" },
  { key: "active", label: "Active" },
  { key: "review", label: "Review" },
  { key: "done", label: "Completed" },
];

export default function DealsPage() {
  const deals = useQuery(api.deals.listByBusiness, {});
  const approveDeal = useMutation(api.deals.approve);
  const declineDeal = useMutation(api.deals.decline);
  const confirmServiceMut = useMutation(api.deals.confirmService);
  const approveContentMut = useMutation(api.deals.approveContent);
  const completeDeal = useMutation(api.deals.complete);
  const [tab, setTab] = useState("all");
  const [error, setError] = useState("");

  const filtered = deals?.filter((d) => {
    if (tab === "all") return true;
    const config = STATE_CONFIG[d.state];
    return config?.group === tab;
  }) ?? [];

  const counts: Record<string, number> = { all: deals?.length ?? 0 };
  for (const d of deals ?? []) {
    const group = STATE_CONFIG[d.state]?.group ?? "done";
    counts[group] = (counts[group] ?? 0) + 1;
  }

  async function handleAction(dealId: string, action: string) {
    const typedDealId = dealId as Id<"deals">;
    try {
      if (action === "approve") await approveDeal({ dealId: typedDealId });
      if (action === "decline") await declineDeal({ dealId: typedDealId });
      if (action === "confirm_service") await confirmServiceMut({ dealId: typedDealId });
      if (action === "approve_content") await approveContentMut({ dealId: typedDealId });
      if (action === "complete") await completeDeal({ dealId: typedDealId });
    } catch (e: any) {
      setError(e.message);
    }
  }

  function getActions(deal: any): { label: string; action: string; variant: string; icon: any }[] {
    switch (deal.state) {
      case "applied":
        return [
          { label: "Approve", action: "approve", variant: "primary", icon: ThumbsUp },
          { label: "Decline", action: "decline", variant: "danger", icon: ThumbsDown },
        ];
      case "checked_in":
        return [
          { label: "Confirm Service", action: "confirm_service", variant: "primary", icon: CheckCircle },
        ];
      case "content_verified":
        return [
          { label: "Approve Content", action: "approve_content", variant: "primary", icon: ThumbsUp },
        ];
      case "business_reviewed":
        return [
          { label: "Complete Deal", action: "complete", variant: "primary", icon: CheckCircle },
        ];
      default:
        return [];
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-3xl text-neutral-800">Deals</h1>
        <p className="text-neutral-500 mt-1">
          Track and manage your barter deals with creators.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-neutral-100">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              tab === t.key
                ? "border-primary-500 text-primary-500"
                : "border-transparent text-neutral-400 hover:text-neutral-600"
            }`}
          >
            {t.label}
            {counts[t.key] != null && (
              <span className="text-xs ml-1 text-neutral-400">
                {counts[t.key]}
              </span>
            )}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-800 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError("")} className="text-red-600 hover:text-red-800 font-medium text-xs">Dismiss</button>
        </div>
      )}

      {/* Deal list */}
      {!deals ? (
        <LoadingState />
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white border border-neutral-100 rounded-lg">
          <Handshake size={40} strokeWidth={1.5} className="mx-auto text-neutral-300 mb-3" />
          <p className="text-neutral-500 mb-1">No deals yet</p>
          <p className="text-neutral-400 text-sm">
            Deals will appear here when creators apply to your offers.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((deal) => {
            const stateConfig = STATE_CONFIG[deal.state] ?? STATE_CONFIG.applied;
            const actions = getActions(deal);
            return (
              <div
                key={deal._id}
                className="bg-white border border-neutral-100 rounded-lg p-5 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <Link
                        href={`/dashboard/deals/${deal._id}`}
                        className="font-medium text-neutral-800 hover:text-primary-500 transition-colors"
                      >
                        {deal.creator?.user?.name ?? "Creator"}
                      </Link>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${stateConfig.color}`}
                      >
                        {stateConfig.label}
                      </span>
                      {deal.creator?.trustTier && (
                        <span className="text-xs text-neutral-400 capitalize">
                          {deal.creator.trustTier}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-neutral-500 mb-2">
                      {deal.offer?.title ?? "Offer"} · $
                      {deal.contractTerms.barterRetailValue} value
                    </p>
                    <div className="flex items-center gap-4 text-xs text-neutral-400">
                      {deal.creator?.instagramHandle && (
                        <span>@{deal.creator.instagramHandle}</span>
                      )}
                      <span>
                        Scheduled:{" "}
                        {new Date(deal.scheduledDate).toLocaleDateString()}
                      </span>
                      {deal.creatorNote && (
                        <span className="flex items-center gap-1">
                          <MessageSquare size={10} /> Has note
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  {actions.length > 0 && (
                    <div className="flex gap-2 ml-4">
                      {actions.map((a) => {
                        const Icon = a.icon;
                        return (
                          <button
                            key={a.action}
                            onClick={() => handleAction(deal._id, a.action)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                              a.variant === "primary"
                                ? "bg-primary-500 text-white hover:bg-primary-600"
                                : a.variant === "danger"
                                  ? "border border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                            }`}
                          >
                            <Icon size={12} /> {a.label}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
