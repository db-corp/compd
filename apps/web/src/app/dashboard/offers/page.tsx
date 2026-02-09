"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import Link from "next/link";
import { Plus, Tag, Pause, Play, Archive, MoreVertical } from "lucide-react";
import LoadingState from "@/components/ui/LoadingState";
import { useState } from "react";

const STATE_LABELS: Record<string, { label: string; color: string }> = {
  draft: { label: "Draft", color: "bg-neutral-200 text-neutral-600" },
  active: { label: "Active", color: "bg-secondary-100 text-secondary-700" },
  paused: { label: "Paused", color: "bg-accent-100 text-accent-600" },
  archived: { label: "Archived", color: "bg-neutral-100 text-neutral-400" },
};

const COMP_TYPE_LABELS: Record<string, string> = {
  barter: "Barter",
  cash: "Cash",
  hybrid: "Hybrid",
};

export default function OffersPage() {
  const offers = useQuery(api.offers.listByCurrentBusiness, {});
  const updateState = useMutation(api.offers.updateState);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [error, setError] = useState("");

  const filteredOffers =
    offers?.filter((o) => filter === "all" || o.state === filter) ?? [];

  const counts = {
    all: offers?.length ?? 0,
    active: offers?.filter((o) => o.state === "active").length ?? 0,
    draft: offers?.filter((o) => o.state === "draft").length ?? 0,
    paused: offers?.filter((o) => o.state === "paused").length ?? 0,
  };

  async function handleStateChange(offerId: string, newState: string) {
    try {
      await updateState({ id: offerId as Id<"offers">, state: newState });
    } catch (e: any) {
      setError(e.message);
    }
    setMenuOpen(null);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-3xl text-neutral-800">Offers</h1>
          <p className="text-neutral-500 mt-1">
            Create and manage your barter offers for local creators.
          </p>
        </div>
        <Link
          href="/dashboard/offers/new"
          className="inline-flex items-center gap-2 bg-primary-500 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors"
        >
          <Plus size={16} strokeWidth={1.5} />
          New offer
        </Link>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-800 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError("")} className="text-red-600 hover:text-red-800 font-medium text-xs">Dismiss</button>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-1 mb-6 border-b border-neutral-100">
        {(["all", "active", "draft", "paused"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              filter === tab
                ? "border-primary-500 text-primary-500"
                : "border-transparent text-neutral-400 hover:text-neutral-600"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}{" "}
            <span className="text-xs ml-1 text-neutral-400">
              {counts[tab]}
            </span>
          </button>
        ))}
      </div>

      {/* Offers list */}
      {!offers ? (
        <LoadingState />
      ) : filteredOffers.length === 0 ? (
        <div className="text-center py-16 bg-white border border-neutral-100 rounded-lg">
          <Tag size={40} strokeWidth={1.5} className="mx-auto text-neutral-300 mb-3" />
          <p className="text-neutral-500 mb-1">No offers yet</p>
          <p className="text-neutral-400 text-sm mb-4">
            Create your first offer to start attracting creators.
          </p>
          <Link
            href="/dashboard/offers/new"
            className="inline-flex items-center gap-2 bg-primary-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors"
          >
            <Plus size={16} strokeWidth={1.5} />
            Create offer
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOffers.map((offer) => {
            const stateInfo = STATE_LABELS[offer.state] ?? STATE_LABELS.draft;
            return (
              <div
                key={offer._id}
                className="bg-white border border-neutral-100 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <Link
                        href={`/dashboard/offers/${offer._id}`}
                        className="font-medium text-neutral-800 hover:text-primary-500 transition-colors truncate"
                      >
                        {offer.title}
                      </Link>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${stateInfo.color}`}
                      >
                        {stateInfo.label}
                      </span>
                    </div>
                    <p className="text-sm text-neutral-500 line-clamp-1 mb-2">
                      {offer.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-neutral-400">
                      <span>
                        {COMP_TYPE_LABELS[offer.compensationType] ?? offer.compensationType}
                        {" · "}${offer.barterRetailValue} value
                      </span>
                      <span>Tier {offer.contentTier}</span>
                      <span>
                        {offer.totalApplications} application
                        {offer.totalApplications !== 1 ? "s" : ""}
                      </span>
                      <span>
                        {offer.totalCompletedDeals} completed
                      </span>
                    </div>
                  </div>

                  {/* Actions menu */}
                  <div className="relative ml-4">
                    <button
                      onClick={() =>
                        setMenuOpen(menuOpen === offer._id ? null : offer._id)
                      }
                      className="p-1.5 rounded-md hover:bg-neutral-50 text-neutral-400"
                    >
                      <MoreVertical size={16} />
                    </button>
                    {menuOpen === offer._id && (
                      <div className="absolute right-0 top-8 bg-white border border-neutral-100 rounded-lg shadow-lg py-1 z-10 w-40">
                        {offer.state === "draft" && (
                          <button
                            onClick={() => handleStateChange(offer._id, "active")}
                            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                          >
                            <Play size={14} /> Publish
                          </button>
                        )}
                        {offer.state === "active" && (
                          <button
                            onClick={() => handleStateChange(offer._id, "paused")}
                            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                          >
                            <Pause size={14} /> Pause
                          </button>
                        )}
                        {offer.state === "paused" && (
                          <button
                            onClick={() => handleStateChange(offer._id, "active")}
                            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                          >
                            <Play size={14} /> Resume
                          </button>
                        )}
                        {offer.state !== "archived" && (
                          <button
                            onClick={() => handleStateChange(offer._id, "archived")}
                            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-error hover:bg-neutral-50"
                          >
                            <Archive size={14} /> Archive
                          </button>
                        )}
                        <Link
                          href={`/dashboard/offers/${offer._id}`}
                          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                          onClick={() => setMenuOpen(null)}
                        >
                          Edit
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
