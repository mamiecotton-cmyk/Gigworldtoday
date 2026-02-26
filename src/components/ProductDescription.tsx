"use client";

import { useState } from "react";

type Props = {
  text: string;
  charLimit?: number;
};

export default function ProductDescription({ text, charLimit = 360 }: Props) {
  const [expanded, setExpanded] = useState(false);

  if (!text) return null;

  const needsTruncate = text.length > charLimit;
  const truncated = needsTruncate ? text.slice(0, charLimit).replace(/\s+\S*$/, "") + "…" : text;

  return (
    <div>
      <p className="text-sm leading-relaxed text-gray-700 md:text-base">
        {expanded ? text : truncated}
      </p>

      {needsTruncate && (
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="mt-3 inline-flex items-center text-sm font-semibold text-teal-600 hover:text-teal-500"
        >
          {expanded ? "Show less" : "Read more"}
        </button>
      )}
    </div>
  );
}
