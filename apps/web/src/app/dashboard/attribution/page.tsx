"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import {
  BarChart3,
  Ticket,
  DollarSign,
  Users,
  TrendingUp,
  Hash,
  QrCode,
  Plus,
  X,
} from "lucide-react";
import LoadingState from "@/components/ui/LoadingState";

export default function AttributionPage() {
  const codes = useQuery(api.attribution.getByBusiness);
  const summary = useQuery(api.attribution.businessAttributionSummary);
  const recordEvent = useMutation(api.attribution.recordEvent);

  const [filter, setFilter] = useState<"all" | "active" | "expired">("all");
  const [reportingCodeId, setReportingCodeId] = useState<string | null>(null);
  const [revenueAmount, setRevenueAmount] = useState("");
  const [redemptionCount, setRedemptionCount] = useState("");
  const [revenueSource, setRevenueSource] = useState("");
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportError, setReportError] = useState("");

  if (codes === undefined || summary === undefined) {
    return <LoadingState />;
  }

  const filteredCodes = (codes ?? []).filter((code) => {
    if (filter === "active") return code.isActive;
    if (filter === "expired") return !code.isActive;
    return true;
  });

  const toggleReportingCode = (codeId: string) => {
    if (reportingCodeId === codeId) {
      setReportingCodeId(null);
    } else {
      setReportingCodeId(codeId);
      // Reset form values when switching codes
      setRevenueAmount("");
      setRedemptionCount("");
      setRevenueSource("");
      setReportError("");
    }
  };

  const handleReportRevenue = async (codeId: string) => {
    const redemptions = parseInt(redemptionCount) || 0;
    const revenue = parseFloat(revenueAmount) || 0;

    if (redemptions === 0 && revenue === 0) {
      setReportError("Enter at least one redemption count or revenue amount.");
      return;
    }

    setReportSubmitting(true);
    setReportError("");

    try {
      if (redemptions > 0) {
        // Record all redemptions (one event per redemption for audit trail)
        for (let i = 0; i < redemptions; i++) {
          await recordEvent({
            codeId: codeId as Id<"attributionCodes">,
            eventType: "code_redeemed",
          });
        }
      }

      if (revenue > 0) {
        await recordEvent({
          codeId: codeId as Id<"attributionCodes">,
          eventType: "revenue_reported",
          revenue,
          source: revenueSource || undefined,
        });
      }

      setReportingCodeId(null);
      setRevenueAmount("");
      setRedemptionCount("");
      setRevenueSource("");
    } catch (err: any) {
      setReportError(err.message ?? "Failed to submit report");
    } finally {
      setReportSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl text-neutral-800">Attribution & ROI</h1>
          <p className="text-neutral-500 mt-1">
            Track promo code performance and measure creator-driven revenue.
          </p>
        </div>
      </div>

      {/* Summary stats */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <StatCard
            icon={<Hash size={18} strokeWidth={1.5} className="text-secondary-500" />}
            label="Total codes"
            value={summary.totalCodes}
          />
          <StatCard
            icon={<Ticket size={18} strokeWidth={1.5} className="text-primary-500" />}
            label="Active"
            value={summary.activeCodes}
          />
          <StatCard
            icon={<Users size={18} strokeWidth={1.5} className="text-accent-600" />}
            label="Redemptions"
            value={summary.totalRedemptions}
          />
          <StatCard
            icon={<DollarSign size={18} strokeWidth={1.5} className="text-success" />}
            label="Est. revenue"
            value={`$${summary.totalEstimatedRevenue.toLocaleString()}`}
          />
          <StatCard
            icon={<TrendingUp size={18} strokeWidth={1.5} className="text-blue-500" />}
            label="CPA"
            value={summary.cpa > 0 ? `$${summary.cpa.toFixed(2)}` : "--"}
          />
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-2 mb-6">
        {(["all", "active", "expired"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === f
                ? "bg-primary-50 text-primary-500 border border-primary-200"
                : "bg-white text-neutral-600 border border-neutral-100 hover:border-neutral-200"
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Codes table */}
      <div className="bg-white border border-neutral-100 rounded-lg shadow-sm overflow-hidden">
        {filteredCodes.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm text-neutral-400">
              No attribution codes yet. Codes are generated when deals are approved.
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-neutral-400 border-b border-neutral-100 bg-neutral-50">
                <th className="text-left py-3 px-4 font-medium">Code</th>
                <th className="text-left py-3 px-4 font-medium">Creator</th>
                <th className="text-left py-3 px-4 font-medium">Offer</th>
                <th className="text-right py-3 px-2 font-medium">Redemptions</th>
                <th className="text-right py-3 px-2 font-medium">Revenue</th>
                <th className="text-center py-3 px-2 font-medium">Status</th>
                <th className="text-center py-3 px-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCodes.map((code) => (
                <tr key={code._id} className="border-b border-neutral-50 hover:bg-neutral-50/50">
                  <td className="py-3 px-4">
                    <code className="bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded text-xs font-mono">
                      {code.code}
                    </code>
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-neutral-800">{code.creatorName}</p>
                    {code.creatorHandle && (
                      <p className="text-xs text-neutral-400">@{code.creatorHandle}</p>
                    )}
                  </td>
                  <td className="py-3 px-4 text-neutral-600">{code.offerTitle}</td>
                  <td className="text-right py-3 px-2 text-neutral-700 font-medium">
                    {code.redemptions}
                  </td>
                  <td className="text-right py-3 px-2 text-neutral-700 font-medium">
                    ${(code.estimatedRevenue ?? 0).toLocaleString()}
                  </td>
                  <td className="text-center py-3 px-2">
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded ${
                        code.isActive
                          ? "bg-green-50 text-green-600"
                          : "bg-neutral-100 text-neutral-500"
                      }`}
                    >
                      {code.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="text-center py-3 px-4">
                    <button
                      onClick={() => toggleReportingCode(code._id)}
                      className="text-xs text-primary-500 hover:text-primary-600 font-medium"
                    >
                      {reportingCodeId === code._id ? "Cancel" : "Report"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Revenue reporting form */}
      {reportingCodeId && (
        <div className="mt-4 bg-white border border-primary-100 rounded-lg p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-neutral-800">Report Revenue</h3>
            <button
              onClick={() => setReportingCodeId(null)}
              className="text-neutral-400 hover:text-neutral-600"
            >
              <X size={18} />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">
                Redemptions
              </label>
              <input
                type="number"
                value={redemptionCount}
                onChange={(e) => setRedemptionCount(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm outline-none focus:border-primary-500"
                placeholder="0"
                min="0"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">
                Revenue amount ($)
              </label>
              <input
                type="number"
                value={revenueAmount}
                onChange={(e) => setRevenueAmount(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm outline-none focus:border-primary-500"
                placeholder="0.00"
                step="0.01"
                min="0"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">
                Source
              </label>
              <input
                type="text"
                value={revenueSource}
                onChange={(e) => setRevenueSource(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm outline-none focus:border-primary-500"
                placeholder="e.g. POS, manual"
              />
            </div>
          </div>
          {reportError && (
            <p className="mt-2 text-sm text-red-500">{reportError}</p>
          )}
          <button
            onClick={() => handleReportRevenue(reportingCodeId)}
            disabled={reportSubmitting}
            className="mt-4 bg-primary-500 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-primary-600 disabled:opacity-50 transition-colors"
          >
            {reportSubmitting ? "Submitting..." : "Submit report"}
          </button>
        </div>
      )}

      {/* Per-creator breakdown */}
      {summary && summary.perCreator.length > 0 && (
        <div className="mt-8 bg-white border border-neutral-100 rounded-lg shadow-sm p-5">
          <h2 className="font-serif text-lg text-neutral-800 mb-4">Per-creator breakdown</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-neutral-400 border-b border-neutral-100">
                  <th className="text-left py-2 pr-4 font-medium">Creator</th>
                  <th className="text-right py-2 px-2 font-medium">Deals</th>
                  <th className="text-right py-2 px-2 font-medium">Redemptions</th>
                  <th className="text-right py-2 px-2 font-medium">Revenue</th>
                  <th className="text-right py-2 pl-2 font-medium">CPA</th>
                </tr>
              </thead>
              <tbody>
                {summary.perCreator.map((row) => {
                  const cpa = row.redemptions > 0
                    ? row.estimatedRevenue / row.redemptions
                    : 0;
                  return (
                    <tr key={row.creatorId} className="border-b border-neutral-50">
                      <td className="py-2 pr-4">
                        <p className="text-neutral-800">{row.creatorName}</p>
                        {row.creatorHandle && (
                          <p className="text-xs text-neutral-400">@{row.creatorHandle}</p>
                        )}
                      </td>
                      <td className="text-right py-2 px-2 text-neutral-600">{row.deals}</td>
                      <td className="text-right py-2 px-2 text-neutral-600">{row.redemptions}</td>
                      <td className="text-right py-2 px-2 text-neutral-700 font-medium">
                        ${row.estimatedRevenue.toLocaleString()}
                      </td>
                      <td className="text-right py-2 pl-2 text-neutral-600">
                        {cpa > 0 ? `$${cpa.toFixed(2)}` : "--"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <div className="bg-white border border-neutral-100 rounded-lg p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <p className="text-xs font-medium text-neutral-500">{label}</p>
      </div>
      <p className="text-2xl font-bold text-neutral-800">{value}</p>
    </div>
  );
}
