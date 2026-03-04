"use client";

import { useEffect, useState } from "react";
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

export default function OutboundClicksPage() {
  const [clicks, setClicks] = useState<ClickRow[]>([]);
  const [totalClicks, setTotalClicks] = useState(0);
  const [typeStats, setTypeStats] = useState<TypeStat[]>([]);
  const [pageStats, setPageStats] = useState<PageStat[]>([]);
  const [topLinks, setTopLinks] = useState<TopLink[]>([]);
  const [filterType, setFilterType] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [filterType]);

  const fetchData = async () => {
    setLoading(true);

    // Total count
    const { count } = await supabase
      .from("outbound_clicks")
      .select("id", { count: "exact", head: true });
    setTotalClicks(count || 0);

    // Recent clicks (with optional filter)
    let query = supabase
      .from("outbound_clicks")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (filterType !== "all") {
      query = query.eq("link_type", filterType);
    }

    const { data: recentClicks } = await query;
    setClicks(recentClicks || []);

    // All clicks for aggregation
    const { data: allClicks } = await supabase
      .from("outbound_clicks")
      .select("link_type, source_page, destination_url, label");

    if (allClicks) {
      // Clicks by type
      const typeMap = new Map<string, number>();
      allClicks.forEach((c) => {
        typeMap.set(c.link_type, (typeMap.get(c.link_type) || 0) + 1);
      });
      setTypeStats(
        Array.from(typeMap.entries())
          .map(([link_type, count]) => ({ link_type, count }))
          .sort((a, b) => b.count - a.count)
      );

      // Clicks by page
      const pageMap = new Map<string, number>();
      allClicks.forEach((c) => {
        const page = c.source_page || "unknown";
        pageMap.set(page, (pageMap.get(page) || 0) + 1);
      });
      setPageStats(
        Array.from(pageMap.entries())
          .map(([source_page, count]) => ({ source_page, count }))
          .sort((a, b) => b.count - a.count)
      );

      // Top clicked links
      const urlMap = new Map<string, { label: string | null; count: number }>();
      allClicks.forEach((c) => {
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

    setLoading(false);
  };

  const uniqueTypes = Array.from(new Set(clicks.map((c) => c.link_type)));

  const truncateUrl = (url: string, maxLen = 50) =>
    url.length > maxLen ? url.slice(0, maxLen) + "…" : url;

  return (
    <div className="max-w-6xl mx-auto px-6 py-16 space-y-10">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Outbound Click Analytics</h1>
        <Link
          href="/admin"
          className="text-sm text-gray-500 hover:text-black transition"
        >
          ← Back to Dashboard
        </Link>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading analytics…</p>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid md:grid-cols-4 gap-6">
            <div className="p-6 border rounded-lg">
              <p className="text-sm text-gray-500">Total Clicks</p>
              <p className="text-2xl font-bold">{totalClicks}</p>
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
              <p className="text-sm text-gray-500">Unique Links</p>
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

          {/* Recent Clicks Table */}
          <div className="border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Recent Clicks</h2>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="text-sm border rounded-lg px-3 py-1.5 text-gray-700"
              >
                <option value="all">All Types</option>
                <option value="book">Book</option>
                <option value="product">Product</option>
                <option value="platform">Platform</option>
                <option value="affiliate">Affiliate</option>
                {uniqueTypes
                  .filter(
                    (t) =>
                      !["book", "product", "platform", "affiliate"].includes(t)
                  )
                  .map((t) => (
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
          </div>
        </>
      )}
    </div>
  );
}
