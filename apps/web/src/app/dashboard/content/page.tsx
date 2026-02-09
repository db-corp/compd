"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { ImageIcon, ExternalLink } from "lucide-react";

export default function ContentPage() {
  const deals = useQuery(api.deals.listByBusiness, {});

  // Filter to deals that have content submitted
  const dealsWithContent = deals?.filter(
    (d) => d.contentUrls && d.contentUrls.length > 0
  ) ?? [];

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-3xl text-neutral-800">
          Content Library
        </h1>
        <p className="text-neutral-500 mt-1">
          Browse all content created for your business by creators.
        </p>
      </div>

      {!deals ? (
        <div className="flex items-center justify-center h-48">
          <p className="text-neutral-400">Loading...</p>
        </div>
      ) : dealsWithContent.length === 0 ? (
        <div className="text-center py-16 bg-white border border-neutral-100 rounded-lg">
          <ImageIcon
            size={40}
            strokeWidth={1.5}
            className="mx-auto text-neutral-300 mb-3"
          />
          <p className="text-neutral-500 mb-1">No content yet</p>
          <p className="text-neutral-400 text-sm">
            Content from completed deals will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {dealsWithContent.map((deal) => (
            <div
              key={deal._id}
              className="bg-white border border-neutral-100 rounded-lg p-4 shadow-sm"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-medium text-neutral-800">
                    {deal.creator?.user?.name ?? "Creator"}
                  </p>
                  <p className="text-xs text-neutral-400">
                    {deal.offer?.title}
                  </p>
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    deal.state === "completed"
                      ? "bg-success/10 text-success"
                      : "bg-info/10 text-info"
                  }`}
                >
                  {deal.state === "completed" ? "Completed" : "In progress"}
                </span>
              </div>

              <div className="space-y-2">
                {deal.contentUrls?.map((url: string, i: number) => (
                  <a
                    key={i}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-primary-500 hover:text-primary-600 bg-neutral-50 rounded-md px-3 py-2"
                  >
                    <ExternalLink size={12} />
                    <span className="truncate">{url}</span>
                  </a>
                ))}
              </div>

              <div className="flex items-center gap-3 mt-3 pt-3 border-t border-neutral-100 text-xs text-neutral-400">
                <span>
                  {deal.contractTerms.deliverables
                    .map((d: any) => `${d.quantity}x ${d.type}`)
                    .join(", ")}
                </span>
                {deal.businessRating && (
                  <span>
                    Rated {deal.businessRating.contentQuality}/5
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
