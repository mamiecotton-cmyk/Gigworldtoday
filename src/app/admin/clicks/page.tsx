"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

type ClickRow = {
  id: string;
  destination_url: string;
  link_type: string;
  label: string | null;
  source_page: string | null;
  created_at: string;
};

type TypeStat = { link_type: string; count: number };
type PageStat = { source_page: string; count: number };
type TopLink = { destination_url: string; label: string | null; count: number };

const PAGE_SIZE = 25;

function getDateRange(range: string): string | null {
  const now = new Date();
  switch (range) {
    case "today":
      return new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    case "7d":
      return new Date(now.getTime() - 7 * 86400000).toISOString();
    case "30d":
      return new Date(now.getTime() - 30 * 86400000).toISOString();
    case "90d":
      return new Date(now.getTime() - 90 * 86400000).toISOString();
    default:
      return null;
  }
}

export default function OutboundClicksPage() {
  const [clicks, setClicks] = useState<ClickRow[]>([]);
  const [totalClicks, setTotalClicks] = useState(0);
  const [typeStats, setTypeStats] = useState<TypeStat[]>([]);
  const [pageStats, setPageStats] = useState<PageStat[]>([]);
  const [topLinks, setTopLinks] = useState<TopLink[]>([]);
  const [filterType, setFilterType] = useState("all");
  const [dateRange, setDateRange] = useState("30d");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    const after = getDateRange(dateRange);

    // Total count for date range
    let countQuery = supabase
      .from("outbound_clicks")
      .select("id", { count: "exact", head: true });
    if (after) countQuery = countQuery.gte("created_at", after);

    const { count } = await countQuery;
    setTotalClicks(count || 0);

    // Fetch limited set for aggregation (cap at 5000 for performance)
    let aggQuery = supabase
      .from("outbound_clicks")
      .select("link_type, source_page, destination_url, label")
      .order("created_at", { ascending: false })
      .limit(5000);
    if (after) aggQuery = aggQuery.gte("created_at", after);

    const { data: aggClicks } = await aggQuery;

    if (aggClicks) {
      // Clicks by type
      const typeMap = new Map<string, number>();
      aggClicks.forEach((c) => {
        typeMap.set(c.link_type, (typeMap.get(c.link_type) || 0) + 1);
      });
      setTypeStats(
        Array.from(typeMap.entries())
          .map(([link_type, count]) => ({ link_type, count }))
          .sort((a, b) => b.count - a.count)
      );

      // Clicks by page
      const pageMap = new Map<string, number>();
      aggClicks.forEach((c) => {
        const pg = c.source_page || "unknown";
        pageMap.set(pg, (pageMap.get(pg) || 0) + 1);
      });
      setPageStats(
        Array.from(pageMap.entries())
          .map(([source_page, count]) => ({ source_page, count }))
          .sort((a, b) => b.count - a.count)
      );

      // Top clicked links
      const urlMap = new Map<string, { label: string | null; count: number }>();
      aggClicks.forEach((c) => {
        const existing = urlMap.get(c.destination_url);
        if (existing) {
          existing.count++;
        } else {
          urlMap.set(c.destination_url, { label: c.label, count: 1 });
        }
      });
      setTopLinks(
        Array.from(urlMap.entries())
          .map(([destination_url, { label, count }]) => ({
            destination_url,
            label,
            count,
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10)
      );
    }
  }, [dateRange]);

  const fetchPage = useCallback(async (pageNum: number) => {
    const after = getDateRange(dateRange);
    const from = pageNum * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    let query = supabase
      .from("outbound_clicks")
      .select("*")
      .order("created_at", { ascending: false })
      .range(from, to);

    if (after) query = query.gte("created_at", after);
    if (filterType !== "all") query = query.eq("link_type", filterType);

    const { data } = await query;
    const rows = data || [];
    setClicks(rows);
    setHasMore(rows.length === PAGE_SIZE);
  }, [dateRange, filterType]);

  useEffect(() => {
    setLoading(true);
    setPage(0);
    Promise.all([fetchStats(), fetchPage(0)]).then(() => setLoading(false));
  }, [dateRange, fetchStats, fetchPage]);

  useEffect(() => {
    fetchPage(page);
  }, [page, filterType, fetchPage]);

  const uniqueTypes = Array.from(new Set(typeStats.map((t) => t.link_type)));

  const truncateUrl = (url: string, maxLen = 50) =>
    url.length > maxLen ? url.slice(0, maxLen) + "…" : url;

  const rangeLabel: Record<string, string> = {
    today: "Today",
    "7d": "Last 7 Days",
    "30d": "Last 30 Days",
    "90d": "Last 90 Days",
    all: "All Time",
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-16 space-y-10">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-3xl font-bold">Outbound Click Analytics</h1>
        <div className="flex items-center gap-3">
          {/* Date Range Selector */}
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            {["today", "7d", "30d", "90d", "all"].map((r) => (
              <button
                key={r}
                onClick={() => setDateRange(r)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  dateRange === r
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {rangeLabel[r]}
              </button>
            ))}
          </div>
          <Link
            href="/admin"
            className="text-sm text-gray-500 hover:text-black transition"
          >
            ← Dashboard
          </Link>
        </div>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading analytics…</p>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid md:grid-cols-4 gap-6">
            <div className="p-6 border rounded-lg">
              <p className="text-sm text-gray-500">Total Clicks</p>
              <p className="text-2xl font-bold">{totalClicks.toLocaleString()}</p>
              <p className="text-xs text-gray-400 mt-1">{rangeLabel[dateRange]}</p>
            </div>
            <div className="p-6 border rounded-lg">
              <p className="text-sm text-gray-500">Link Types</p>
              <p className="text-2xl font-bold">{typeStats.length}</p>
            </div>
            <div className="p-6 border rounded-lg">
              <p className="text-sm text-gray-500">Source Pages</p>
              <p className="text-2xl font-bold">{pageStats.length}</p>
            </div>
            <div className="p-6 border rounded-lg">
              <p className="text-sm text-gray-500">Top Links Tracked</p>
              <p className="text-2xl font-bold">{topLinks.length}</p>
            </div>
          </div>

          {/* Breakdowns */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Clicks by Type */}
            <div className="border rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Clicks by Type</h2>
              {typeStats.length === 0 ? (
                <p className="text-gray-400 text-sm">No data yet</p>
              ) : (
                <div className="space-y-3">
                  {typeStats.map((t) => (
                    <div key={t.link_type} className="flex items-center justify-between">
                      <span className="text-sm font-medium capitalize">{t.link_type}</span>
                      <div className="flex items-center gap-3">
                        <div className="w-32 bg-gray-100 rounded-full h-2.5">
                          <div
                            className="bg-teal-500 h-2.5 rounded-full"
                            style={{
                              width: `${Math.round((t.count / totalClicks) * 100)}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 w-12 text-right">{t.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Clicks by Page */}
            <div className="border rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Clicks by Page</h2>
              {pageStats.length === 0 ? (
                <p className="text-gray-400 text-sm">No data yet</p>
              ) : (
                <div className="space-y-3">
                  {pageStats.map((p) => (
                    <div key={p.source_page} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{p.source_page}</span>
                      <div className="flex items-center gap-3">
                        <div className="w-32 bg-gray-100 rounded-full h-2.5">
                          <div
                            className="bg-orange-500 h-2.5 rounded-full"
                            style={{
                              width: `${Math.round((p.count / totalClicks) * 100)}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 w-12 text-right">{p.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Top Clicked Links */}
          <div className="border rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Top Clicked Links</h2>
            {topLinks.length === 0 ? (
              <p className="text-gray-400 text-sm">No data yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b">
                      <th className="pb-2 font-medium">#</th>
                      <th className="pb-2 font-medium">Label</th>
                      <th className="pb-2 font-medium">URL</th>
                      <th className="pb-2 font-medium text-right">Clicks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topLinks.map((link, i) => (
                      <tr key={link.destination_url} className="border-b last:border-0">
                        <td className="py-2 text-gray-400">{i + 1}</td>
                        <td className="py-2 font-medium">{link.label || "—"}</td>
                        <td className="py-2 text-gray-500">
                          <a
                            href={link.destination_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-teal-600 transition"
                          >
                            {truncateUrl(link.destination_url)}
                          </a>
                        </td>
                        <td className="py-2 text-right font-semibold">{link.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Recent Clicks Table — Paginated */}
          <div className="border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Recent Clicks</h2>
              <select
                value={filterType}
                onChange={(e) => {
                  setFilterType(e.target.value);
                  setPage(0);
                }}
                className="text-sm border rounded-lg px-3 py-1.5 text-gray-700"
              >
                <option value="all">All Types</option>
                {uniqueTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {clicks.length === 0 ? (
              <p className="text-gray-400 text-sm">No clicks recorded yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b">
                      <th className="pb-2 font-medium">Time</th>
                      <th className="pb-2 font-medium">Type</th>
                      <th className="pb-2 font-medium">Label</th>
                      <th className="pb-2 font-medium">Source</th>
                      <th className="pb-2 font-medium">Destination</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clicks.map((click) => (
                      <tr key={click.id} className="border-b last:border-0">
                        <td className="py-2 text-gray-500 whitespace-nowrap">
                          {new Date(click.created_at).toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="py-2">
                          <span className="inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-teal-50 text-teal-700 capitalize">
                            {click.link_type}
                          </span>
                        </td>
                        <td className="py-2 font-medium">{click.label || "—"}</td>
                        <td className="py-2 text-gray-500">{click.source_page || "—"}</td>
                        <td className="py-2 text-gray-500">
                          <a
                            href={click.destination_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-teal-600 transition"
                          >
                            {truncateUrl(click.destination_url, 40)}
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <p className="text-xs text-gray-400">
                Page {page + 1} · Showing {clicks.length} result{clicks.length !== 1 ? "s" : ""}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="px-3 py-1.5 text-xs font-medium border rounded-lg disabled:opacity-30 hover:bg-gray-50 transition"
                >
                  ← Previous
                </button>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!hasMore}
                  className="px-3 py-1.5 text-xs font-medium border rounded-lg disabled:opacity-30 hover:bg-gray-50 transition"
                >
                  Next →
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}