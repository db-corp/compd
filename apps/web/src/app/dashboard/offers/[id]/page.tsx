"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Play, Pause, Archive } from "lucide-react";
import LoadingState from "@/components/ui/LoadingState";

const STATE_LABELS: Record<string, { label: string; color: string }> = {
  draft: { label: "Draft", color: "bg-neutral-200 text-neutral-600" },
  active: { label: "Active", color: "bg-secondary-100 text-secondary-700" },
  paused: { label: "Paused", color: "bg-accent-100 text-accent-600" },
  archived: { label: "Archived", color: "bg-neutral-100 text-neutral-400" },
};

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function OfferDetailPage() {
  const params = useParams();
  const router = useRouter();
  const offerId = params.id as string as Id<"offers">;
  const offer = useQuery(api.offers.getById, { id: offerId });
  const updateState = useMutation(api.offers.updateState);
  const [error, setError] = useState("");

  if (offer === undefined) {
    return <LoadingState />;
  }

  if (!offer) {
    return (
      <div className="text-center py-16">
        <p className="text-neutral-500">Offer not found</p>
        <Link
          href="/dashboard/offers"
          className="text-primary-500 text-sm mt-2 inline-block"
        >
          Back to offers
        </Link>
      </div>
    );
  }

  const stateInfo = STATE_LABELS[offer.state] ?? STATE_LABELS.draft;

  async function handleStateChange(newState: string) {
    try {
      await updateState({ id: offerId, state: newState });
    } catch (e: any) {
      setError(e.message);
    }
  }

  return (
    <div className="max-w-3xl">
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-800 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError("")} className="text-red-600 hover:text-red-800 font-medium text-xs">Dismiss</button>
        </div>
      )}

      <Link
        href="/dashboard/offers"
        className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-700 mb-4"
      >
        <ArrowLeft size={14} /> Back to offers
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-serif text-3xl text-neutral-800">
              {offer.title}
            </h1>
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${stateInfo.color}`}
            >
              {stateInfo.label}
            </span>
          </div>
          <p className="text-neutral-500 mt-1">{offer.description}</p>
        </div>
        <div className="flex gap-2">
          {offer.state === "draft" && (
            <button
              onClick={() => handleStateChange("active")}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-secondary-500 text-white rounded-lg text-sm font-medium hover:bg-secondary-600 transition-colors"
            >
              <Play size={14} /> Publish
            </button>
          )}
          {offer.state === "active" && (
            <button
              onClick={() => handleStateChange("paused")}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-accent-400 text-white rounded-lg text-sm font-medium hover:bg-accent-500 transition-colors"
            >
              <Pause size={14} /> Pause
            </button>
          )}
          {offer.state === "paused" && (
            <button
              onClick={() => handleStateChange("active")}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-secondary-500 text-white rounded-lg text-sm font-medium hover:bg-secondary-600 transition-colors"
            >
              <Play size={14} /> Resume
            </button>
          )}
          {offer.state !== "archived" && (
            <button
              onClick={() => handleStateChange("archived")}
              className="inline-flex items-center gap-1.5 px-4 py-2 border border-neutral-200 text-neutral-600 rounded-lg text-sm font-medium hover:bg-neutral-50 transition-colors"
            >
              <Archive size={14} /> Archive
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Compensation */}
        <div className="bg-white border border-neutral-100 rounded-lg p-5 shadow-sm">
          <h2 className="font-serif text-lg text-neutral-800 mb-3">
            Compensation
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-neutral-500">Type</span>
              <span className="text-neutral-800 capitalize">
                {offer.compensationType}
              </span>
            </div>
            {offer.barterDescription && (
              <div className="flex justify-between">
                <span className="text-neutral-500">What you offer</span>
                <span className="text-neutral-800">
                  {offer.barterDescription}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-neutral-500">Retail value</span>
              <span className="text-neutral-800 font-medium">
                ${offer.barterRetailValue}
              </span>
            </div>
            {offer.cashAmount && (
              <div className="flex justify-between">
                <span className="text-neutral-500">Cash amount</span>
                <span className="text-neutral-800">${offer.cashAmount}</span>
              </div>
            )}
            {offer.exclusions && (
              <div className="flex justify-between">
                <span className="text-neutral-500">Exclusions</span>
                <span className="text-neutral-800">{offer.exclusions}</span>
              </div>
            )}
            {offer.partySize && (
              <div className="flex justify-between">
                <span className="text-neutral-500">Party size</span>
                <span className="text-neutral-800">{offer.partySize}</span>
              </div>
            )}
          </div>
        </div>

        {/* Content requirements */}
        <div className="bg-white border border-neutral-100 rounded-lg p-5 shadow-sm">
          <h2 className="font-serif text-lg text-neutral-800 mb-3">
            Content requirements
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-neutral-500">Tier</span>
              <span className="text-neutral-800">{offer.contentTier}</span>
            </div>
            <div>
              <span className="text-neutral-500">Deliverables</span>
              <div className="mt-1 space-y-1">
                {offer.deliverables.map((d, i) => (
                  <div
                    key={i}
                    className="bg-neutral-50 rounded-md px-2.5 py-1.5 text-xs text-neutral-700"
                  >
                    {d.quantity}x {d.platform} {d.type}
                    {d.minDurationSeconds
                      ? ` (${d.minDurationSeconds}s min)`
                      : ""}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Content window</span>
              <span className="text-neutral-800">
                {offer.contentWindowHours}h
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Must stay up</span>
              <span className="text-neutral-800">
                {offer.persistenceDays} days
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Usage rights</span>
              <span className="text-neutral-800 capitalize">
                {offer.usageRights.replace(/_/g, " ")}
              </span>
            </div>
          </div>
        </div>

        {/* Availability */}
        <div className="bg-white border border-neutral-100 rounded-lg p-5 shadow-sm">
          <h2 className="font-serif text-lg text-neutral-800 mb-3">
            Availability
          </h2>
          <div className="space-y-3">
            {offer.availabilityWindows.map((w, i) => (
              <div key={i} className="text-sm">
                <div className="flex gap-1 mb-1">
                  {w.dayOfWeek.map((d) => (
                    <span
                      key={d}
                      className="bg-primary-50 text-primary-600 text-xs px-1.5 py-0.5 rounded"
                    >
                      {DAYS[d]}
                    </span>
                  ))}
                </div>
                <p className="text-neutral-600">
                  {w.startTime} – {w.endTime}
                </p>
              </div>
            ))}
            <div className="flex justify-between text-sm pt-2 border-t border-neutral-100">
              <span className="text-neutral-500">Max per week</span>
              <span className="text-neutral-800">
                {offer.maxRedemptionsPerWeek}
              </span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-white border border-neutral-100 rounded-lg p-5 shadow-sm">
          <h2 className="font-serif text-lg text-neutral-800 mb-3">Stats</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-neutral-500">Applications</span>
              <span className="text-neutral-800 font-medium">
                {offer.totalApplications}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Completed deals</span>
              <span className="text-neutral-800 font-medium">
                {offer.totalCompletedDeals}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Avg content rating</span>
              <span className="text-neutral-800 font-medium">
                {offer.averageContentRating > 0
                  ? offer.averageContentRating.toFixed(1)
                  : "—"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">This week</span>
              <span className="text-neutral-800">
                {offer.currentWeekRedemptions} / {offer.maxRedemptionsPerWeek}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
