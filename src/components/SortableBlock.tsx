"use client";

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export default function SortableBlock({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative">
      <button
        type="button"
        className="absolute -left-10 top-3 border rounded px-2 py-1 text-sm cursor-grab active:cursor-grabbing"
        aria-label="Drag block"
        {...attributes}
        {...listeners}
      >
        ⠿
      </button>

      {children}
    </div>
  );
}