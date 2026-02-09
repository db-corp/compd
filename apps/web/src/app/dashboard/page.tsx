"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import Link from "next/link";
import {
  Tag,
  Handshake,
  Clock,
  CheckCircle,
  FileText,
  DollarSign,
  Star,
  ArrowRight,
  AlertCircle,
  BarChart3,
  Users,
  Ticket,
} from "lucide-react";
import LoadingState from "@/components/ui/LoadingState";

const STATE_LABELS: Record<string, { label: string; color: string }> = {
  applied: { label: "Applied", color: "text-accent-600" },
  approved: { label: "Approved", color: "text-secondary-500" },
  checked_in: { label: "Checked In", color: "text-secondary-500" },
  content_pending: { label: "Awaiting Content", color: "text-accent-600" },
  content_submitted: { label: "Submitted", color: "text-info" },
  content_verified: { label: "Needs Review", color: "text-primary-500" },
  revision_requested: { label: "Revision", color: "text-primary-500" },
  business_reviewed: { label: "Reviewed", color: "text-secondary-500" },
  completed: { label: "Completed", color: "text-success" },
  declined: { label: "Declined", color: "text-neutral-400" },
  cancelled: { label: "Cancelled", color: "text-neutral-400" },
  no_show: { label: "No Show", color: "text-red-600" },
  expired: { label: "Expired", color: "text-red-600" },
  unfulfilled: { label: "Unfulfilled", color: "text-red-600" },
};

export default function DashboardOverview() {
  const data = useQuery(api.analytics.businessDashboard);
  const attribution = useQuery(api.attribution.businessAttributionSummary);

  if (!data) {
    return <LoadingState />;
  }

  const { business, offers, deals, totalBarterValue, recentDeals } = data;

  return (
    <div>
      <h1 className="font-serif text-3xl text-neutral-800 mb-2">
        Welcome back, {business.name}
      </h1>
      <p className="text-neutral-500 mb-8">
        Here's what's happening with your offers and deals.
      </p>

      {/* Action alerts */}
      {(deals.pending > 0 || deals.contentToReview > 0) && (
        <div className="mb-8 space-y-3">
          {deals.pending > 0 && (
            <Link
              href="/dashboard/deals"
              className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 hover:bg-amber-100 transition-colors"
            >
              <AlertCircle size={18} strokeWidth={1.5} className="text-amber-600" />
              <span className="text-sm font-medium text-amber-800">
                {deals.pending} new application{deals.pending !== 1 ? "s" : ""} waiting for review
              </span>
              <ArrowRight size={16} strokeWidth={1.5} className="text-amber-600 ml-auto" />
            </Link>
          )}
          {deals.contentToReview > 0 && (
            <Link
              href="/dashboard/deals"
              className="flex items-center gap-3 bg-primary-50 border border-primary-200 rounded-lg px-4 py-3 hover:bg-primary-100 transition-colors"
            >
              <FileText size={18} strokeWidth={1.5} className="text-primary-500" />
              <span className="text-sm font-medium text-primary-700">
                {deals.contentToReview} content submission{deals.contentToReview !== 1 ? "s" : ""} ready for review
              </span>
              <ArrowRight size={16} strokeWidth={1.5} className="text-primary-500 ml-auto" />
            </Link>
          )}
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={<Tag size={18} strokeWidth={1.5} className="text-secondary-500" />}
          label="Active offers"
          value={offers.active}
          sublabel={`${offers.draft} draft`}
          href="/dashboard/offers"
        />
        <StatCard
          icon={<Clock size={18} strokeWidth={1.5} className="text-accent-600" />}
          label="Pending apps"
          value={deals.pending}
          href="/dashboard/deals"
        />
        <StatCard
          icon={<Handshake size={18} strokeWidth={1.5} className="text-secondary-500" />}
          label="Active deals"
          value={deals.active}
          href="/dashboard/deals"
        />
        <StatCard
          icon={<CheckCircle size={18} strokeWidth={1.5} className="text-success" />}
          label="Completed"
          value={deals.completed}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatCard
          icon={<DollarSign size={18} strokeWidth={1.5} className="text-success" />}
          label="Total barter value"
          value={`$${totalBarterValue.toLocaleString()}`}
        />
        <StatCard
          icon={<Star size={18} strokeWidth={1.5} className="text-amber-500" />}
          label="Avg creator rating"
          value={business.averageCreatorRating > 0 ? business.averageCreatorRating.toFixed(1) : "--"}
        />
        <StatCard
          icon={<CheckCircle size={18} strokeWidth={1.5} className="text-secondary-500" />}
          label="Offer accuracy"
          value={`${Math.round(business.offerAccuracyRate * 100)}%`}
        />
      </div>

      {/* Attribution & ROI */}
      {attribution && (
        <div className="bg-white border border-neutral-100 rounded-lg shadow-sm p-5 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={18} strokeWidth={1.5} className="text-primary-500" />
            <h2 className="font-serif text-lg text-neutral-800">Attribution & ROI</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-neutral-50 rounded-lg p-3">
              <p className="text-xs text-neutral-500 mb-1">Active codes</p>
              <p className="text-xl font-bold text-neutral-800">{attribution.activeCodes}</p>
            </div>
            <div className="bg-neutral-50 rounded-lg p-3">
              <p className="text-xs text-neutral-500 mb-1">Redemptions</p>
              <p className="text-xl font-bold text-neutral-800">{attribution.totalRedemptions}</p>
            </div>
            <div className="bg-neutral-50 rounded-lg p-3">
              <p className="text-xs text-neutral-500 mb-1">Est. revenue</p>
              <p className="text-xl font-bold text-neutral-800">
                ${attribution.totalEstimatedRevenue.toLocaleString()}
              </p>
            </div>
            <div className="bg-neutral-50 rounded-lg p-3">
              <p className="text-xs text-neutral-500 mb-1">CPA</p>
              <p className="text-xl font-bold text-neutral-800">
                {attribution.cpa > 0 ? `$${attribution.cpa.toFixed(2)}` : "--"}
              </p>
            </div>
          </div>

          {attribution.perCreator.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-neutral-600 mb-2">Per-creator breakdown</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-neutral-400 border-b border-neutral-100">
                      <th className="text-left py-2 pr-4 font-medium">Creator</th>
                      <th className="text-right py-2 px-2 font-medium">Deals</th>
                      <th className="text-right py-2 px-2 font-medium">Redemptions</th>
                      <th className="text-right py-2 pl-2 font-medium">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attribution.perCreator.map((row) => (
                      <tr key={row.creatorId} className="border-b border-neutral-50">
                        <td className="py-2 pr-4">
                          <p className="text-neutral-800">{row.creatorName}</p>
                          {row.creatorHandle && (
                            <p className="text-xs text-neutral-400">{row.creatorHandle}</p>
                          )}
                        </td>
                        <td className="text-right py-2 px-2 text-neutral-600">{row.deals}</td>
                        <td className="text-right py-2 px-2 text-neutral-600">{row.redemptions}</td>
                        <td className="text-right py-2 pl-2 text-neutral-700 font-medium">
                          ${row.estimatedRevenue.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recent deals */}
      <div className="bg-white border border-neutral-100 rounded-lg shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
          <h2 className="font-serif text-lg text-neutral-800">Recent activity</h2>
          <Link href="/dashboard/deals" className="text-sm text-primary-500 hover:text-primary-600 font-medium flex items-center gap-1">
            View all <ArrowRight size={14} strokeWidth={1.5} />
          </Link>
        </div>
        {recentDeals.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm text-neutral-400">No deals yet. Create an offer to get started!</p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-50">
            {recentDeals.map((deal) => {
              const stateInfo = STATE_LABELS[deal.state] ?? { label: deal.state, color: "text-neutral-500" };
              return (
                <Link
                  key={deal._id}
                  href={`/dashboard/deals/${deal._id}`}
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-neutral-50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-800 truncate">
                      {deal.creatorName}
                    </p>
                    <p className="text-xs text-neutral-500 truncate">
                      {deal.offerTitle}
                    </p>
                  </div>
                  <span className={`text-xs font-medium ${stateInfo.color}`}>
                    {stateInfo.label}
                  </span>
                  {deal.barterValue > 0 && (
                    <span className="text-xs font-semibold text-neutral-700">
                      ${deal.barterValue}
                    </span>
                  )}
                  <ArrowRight size={14} strokeWidth={1.5} className="text-neutral-300" />
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  sublabel,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sublabel?: string;
  href?: string;
}) {
  const content = (
    <div className="bg-white border border-neutral-100 rounded-lg p-4 shadow-sm hover:shadow transition-shadow">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <p className="text-xs font-medium text-neutral-500">{label}</p>
      </div>
      <p className="text-2xl font-bold text-neutral-800">{value}</p>
      {sublabel && (
        <p className="text-xs text-neutral-400 mt-0.5">{sublabel}</p>
      )}
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }
  return content;
}
