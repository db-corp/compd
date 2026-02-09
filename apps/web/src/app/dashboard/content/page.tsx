"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { useState } from "react";
import {
  ImageIcon,
  ExternalLink,
  Download,
  Star,
  Filter,
  ArrowUpDown,
  Globe,
  Megaphone,
  Share2,
  Check,
} from "lucide-react";
import LoadingState from "@/components/ui/LoadingState";
import { CONTENT_CATEGORIES } from "@/lib/constants";

const CONTENT_CATEGORY_OPTIONS = [
  { value: "", label: "All types" },
  ...CONTENT_CATEGORIES,
];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "highest_rated", label: "Highest rated" },
  { value: "most_engagement", label: "Most engagement" },
];

export default function ContentPage() {
  const [categoryFilter, setCategoryFilter] = useState("");
  const [creatorFilter, setCreatorFilter] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "highest_rated" | "most_engagement">("newest");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const archives = useQuery(api.contentArchives.listByBusiness, {
    contentCategory: categoryFilter || undefined,
    creatorId: creatorFilter ? (creatorFilter as Id<"creators">) : undefined,
    sortBy,
  });
  const creators = useQuery(api.contentArchives.getCreatorsWithContent);
  const markDownloaded = useMutation(api.contentArchives.markDownloaded);

  function toggleSelection(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function selectAll() {
    if (!archives) return;
    if (selectedIds.size === archives.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(archives.map((a) => a._id)));
    }
  }

  async function handleDownload(id: Id<"contentArchives">, url: string) {
    window.open(url, "_blank");
    await markDownloaded({ id });
  }

  async function handleBulkDownload() {
    if (!archives) return;
    const selected = archives.filter((a) => selectedIds.has(a._id));
    for (const archive of selected) {
      // Use fetch + blob + anchor pattern to avoid popup blocking
      try {
        const response = await fetch(archive.originalUrl);
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = `content-${archive._id}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
      } catch {
        // Fallback: open in new tab (may be blocked for 2+)
        window.open(archive.originalUrl, "_blank");
      }
      await markDownloaded({ id: archive._id });
    }
  }

  // Usage rights summary
  const usageRightsSummary = archives
    ? {
        social: archives.filter((a) => a.usageRights?.canRepostSocial).length,
        website: archives.filter((a) => a.usageRights?.canUseWebsite).length,
        ads: archives.filter((a) => a.usageRights?.canUseAds).length,
        total: archives.length,
      }
    : null;

  if (archives === undefined) {
    return <LoadingState />;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-3xl text-neutral-800">Content Library</h1>
        <p className="text-neutral-500 mt-1">
          Browse all content created for your business by creators.
        </p>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex items-center gap-2">
          <Filter size={14} strokeWidth={1.5} className="text-neutral-400" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-sm border border-neutral-200 rounded-lg px-3 py-1.5 bg-white"
          >
            {CONTENT_CATEGORY_OPTIONS.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        <select
          value={creatorFilter}
          onChange={(e) => setCreatorFilter(e.target.value)}
          className="text-sm border border-neutral-200 rounded-lg px-3 py-1.5 bg-white"
        >
          <option value="">All creators</option>
          {creators?.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name} {c.handle ? `(${c.handle})` : ""}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-2 ml-auto">
          <ArrowUpDown size={14} strokeWidth={1.5} className="text-neutral-400" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="text-sm border border-neutral-200 rounded-lg px-3 py-1.5 bg-white"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Bulk actions */}
      {archives.length > 0 && (
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={selectAll}
            className="text-xs text-primary-500 hover:text-primary-600 font-medium"
          >
            {selectedIds.size === archives.length ? "Deselect all" : "Select all"}
          </button>
          {selectedIds.size > 0 && (
            <button
              onClick={handleBulkDownload}
              className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors"
            >
              <Download size={12} />
              Download selected ({selectedIds.size})
            </button>
          )}
        </div>
      )}

      {/* Content grid */}
      {archives.length === 0 ? (
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
          {archives.map((archive) => {
            const isSelected = selectedIds.has(archive._id);
            return (
              <div
                key={archive._id}
                className={`bg-white border rounded-lg p-4 shadow-sm transition-colors ${
                  isSelected ? "border-primary-300 ring-1 ring-primary-200" : "border-neutral-100"
                }`}
              >
                {/* Selection + header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleSelection(archive._id)}
                      className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                        isSelected
                          ? "bg-primary-500 border-primary-500 text-white"
                          : "border-neutral-300 hover:border-primary-400"
                      }`}
                    >
                      {isSelected && <Check size={12} />}
                    </button>
                    <div>
                      <p className="text-sm font-medium text-neutral-800">
                        {archive.creatorName}
                      </p>
                      {archive.creatorHandle && (
                        <p className="text-xs text-neutral-400">{archive.creatorHandle}</p>
                      )}
                    </div>
                  </div>

                  {/* Content category badge */}
                  {archive.contentCategory && (
                    <span className="text-[10px] font-medium bg-secondary-50 text-secondary-600 px-2 py-0.5 rounded-full">
                      {CONTENT_CATEGORIES.find((c) => c.value === archive.contentCategory)?.label ?? archive.contentCategory}
                    </span>
                  )}
                </div>

                {/* Content type + platform */}
                <div className="flex items-center gap-2 mb-3 text-xs text-neutral-500">
                  <span className="capitalize">{archive.platform}</span>
                  <span>·</span>
                  <span className="capitalize">{archive.contentType}</span>
                </div>

                {/* Content URL */}
                <a
                  href={archive.originalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-primary-500 hover:text-primary-600 bg-neutral-50 rounded-md px-3 py-2 mb-3"
                >
                  <ExternalLink size={12} />
                  <span className="truncate">{archive.originalUrl}</span>
                </a>

                {/* Stats row */}
                <div className="flex items-center gap-3 text-xs text-neutral-500 mb-3">
                  {archive.contentRating !== null && (
                    <span className="flex items-center gap-1">
                      <Star size={11} className="text-amber-500" />
                      {archive.contentRating}/5
                    </span>
                  )}
                  {archive.engagementRate !== undefined && archive.engagementRate > 0 && (
                    <span>{(archive.engagementRate * 100).toFixed(1)}% eng</span>
                  )}
                  {archive.impressions !== undefined && archive.impressions > 0 && (
                    <span>{archive.impressions.toLocaleString()} views</span>
                  )}
                </div>

                {/* Usage rights + download */}
                <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
                  <div className="flex items-center gap-2">
                    {archive.usageRights?.canRepostSocial && (
                      <span title="Can repost on social" className="text-secondary-500">
                        <Share2 size={13} />
                      </span>
                    )}
                    {archive.usageRights?.canUseWebsite && (
                      <span title="Can use on website" className="text-secondary-500">
                        <Globe size={13} />
                      </span>
                    )}
                    {archive.usageRights?.canUseAds && (
                      <span title="Can use in ads" className="text-secondary-500">
                        <Megaphone size={13} />
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleDownload(archive._id, archive.originalUrl)}
                    className="inline-flex items-center gap-1 text-xs text-primary-500 hover:text-primary-600 font-medium"
                  >
                    <Download size={12} />
                    {archive.businessDownloaded ? "Downloaded" : "Download"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Usage rights summary footer */}
      {usageRightsSummary && usageRightsSummary.total > 0 && (
        <div className="mt-6 bg-white border border-neutral-100 rounded-lg p-4 shadow-sm">
          <h3 className="text-sm font-medium text-neutral-700 mb-2">Usage Rights Summary</h3>
          <div className="flex items-center gap-6 text-xs text-neutral-500">
            <span className="flex items-center gap-1.5">
              <Share2 size={12} className="text-secondary-500" />
              {usageRightsSummary.social}/{usageRightsSummary.total} social repost
            </span>
            <span className="flex items-center gap-1.5">
              <Globe size={12} className="text-secondary-500" />
              {usageRightsSummary.website}/{usageRightsSummary.total} website use
            </span>
            <span className="flex items-center gap-1.5">
              <Megaphone size={12} className="text-secondary-500" />
              {usageRightsSummary.ads}/{usageRightsSummary.total} ad use
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
