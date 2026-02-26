"use client";

import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import { supabase } from "@/lib/supabaseClient";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const QuillEditor = dynamic(() => import("./QuillEditor"), { ssr: false });

export type Block =
  | {
      id: string;
      type: "text";
      content: string;
    }
  | {
      id: string;
      type: "image";
      src: string;
      layout: "full" | "left" | "right" | "center";
      widthPercent?: number;
      objectPosition?: string;
      alt: string;
      caption: string;
    };

interface Props {
  blocks: Block[];
  setBlocks: React.Dispatch<React.SetStateAction<Block[]>>;
}

async function uploadImageToSupabase(file: File, prefix: string): Promise<string> {
  const fileExt = file.name.split(".").pop();
  const fileName = `${prefix}-${Date.now()}.${fileExt}`;

  const { error } = await supabase.storage
    .from("article-images")
    .upload(fileName, file);

  if (error) throw error;

  const { data } = supabase.storage
    .from("article-images")
    .getPublicUrl(fileName);

  return data.publicUrl;
}

function ResizableImageBlock({
  block,
  setBlocks,
}: {
  block: Extract<Block, { type: "image" }>;
  setBlocks: React.Dispatch<React.SetStateAction<Block[]>>;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [resizing, setResizing] = useState(false);
  const [repositioning, setRepositioning] = useState(false);
  const [showReposition, setShowReposition] = useState(false);
  const [uploading, setUploading] = useState(false);
  const widthPercent = block.widthPercent || 100;
  const objectPosition = block.objectPosition || "center center";

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    try {
      const url = await uploadImageToSupabase(file, "block");
      setBlocks((prev) =>
        prev.map((b) =>
          b.id === block.id ? { ...b, src: url } : b
        )
      );
    } catch (err: any) {
      alert(err.message || "Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleResizeDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setResizing(true);
    const startX = e.clientX;
    const containerWidth = containerRef.current?.parentElement?.offsetWidth || 600;
    const startPercent = widthPercent;

    const handleMouseMove = (ev: MouseEvent) => {
      const delta = ev.clientX - startX;
      const deltaPercent = (delta / containerWidth) * 100;
      const newPercent = Math.max(20, Math.min(100, startPercent + deltaPercent));
      const snapped = Math.round(newPercent / 5) * 5;
      setBlocks((prev) =>
        prev.map((b) =>
          b.id === block.id ? { ...b, widthPercent: snapped } : b
        )
      );
    };

    const handleMouseUp = () => {
      setResizing(false);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const handleRepositionDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setRepositioning(true);

    const imgEl = e.currentTarget as HTMLElement;
    const rect = imgEl.getBoundingClientRect();
    const startX = e.clientX;
    const startY = e.clientY;

    const parts = objectPosition.split(" ");
    const startPosX = parseFloat(parts[0]) || 50;
    const startPosY = parseFloat(parts[1]) || 50;

    const handleMouseMove = (ev: MouseEvent) => {
      const deltaX = ev.clientX - startX;
      const deltaY = ev.clientY - startY;

      const pctX = Math.max(0, Math.min(100, startPosX - (deltaX / rect.width) * 100));
      const pctY = Math.max(0, Math.min(100, startPosY - (deltaY / rect.height) * 100));

      const rounded = `${Math.round(pctX)}% ${Math.round(pctY)}%`;

      setBlocks((prev) =>
        prev.map((b) =>
          b.id === block.id ? { ...b, objectPosition: rounded } : b
        )
      );
    };

    const handleMouseUp = () => {
      setRepositioning(false);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  // No image yet — show upload UI
  if (!block.src) {
    return (
      <div className="space-y-3">
        <label
          className={`flex flex-col items-center justify-center w-full h-36 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
            uploading
              ? "border-gray-300 bg-gray-50"
              : "border-gray-300 hover:border-teal-400 hover:bg-teal-50/30"
          }`}
        >
          <div className="text-center">
            {uploading ? (
              <p className="text-sm text-gray-500">Uploading...</p>
            ) : (
              <>
                <p className="text-sm text-gray-500">Click to upload image</p>
                <p className="text-xs text-gray-400 mt-1">or paste a URL below</p>
              </>
            )}
          </div>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={uploading}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileUpload(file);
            }}
          />
        </label>
        <input
          type="text"
          placeholder="Or paste image URL here"
          className="w-full border rounded px-3 py-2 text-sm"
          onChange={(e) => {
            const url = e.target.value.trim();
            if (url) {
              setBlocks((prev) =>
                prev.map((b) =>
                  b.id === block.id ? { ...b, src: url } : b
                )
              );
            }
          }}
        />
      </div>
    );
  }

  // Image exists — show preview with controls
  return (
    <div className="space-y-3">
      <div ref={containerRef} className="relative">
        <div
          style={{ width: `${widthPercent}%` }}
          className="relative group transition-[width] duration-75"
        >
          {showReposition ? (
            <div
              className="relative overflow-hidden rounded-xl"
              style={{ height: 300 }}
            >
              <img
                src={block.src}
                alt={block.alt || ""}
                className={`w-full h-full object-cover ${repositioning ? "cursor-grabbing" : "cursor-grab"}`}
                style={{ objectPosition }}
                draggable={false}
                onMouseDown={handleRepositionDown}
              />
              {repositioning && (
                <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                  Position: {objectPosition}
                </div>
              )}
            </div>
          ) : (
            <img
              src={block.src}
              alt={block.alt || ""}
              className={`w-full h-auto rounded-xl ${resizing ? "select-none pointer-events-none" : ""}`}
              draggable={false}
            />
          )}

          {/* Resize handle */}
          <div
            onMouseDown={handleResizeDown}
            className="absolute top-0 right-[-6px] w-3 h-full cursor-ew-resize flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <div className="w-1 h-12 bg-teal-500 rounded-full shadow" />
          </div>

          {resizing && (
            <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
              {widthPercent}%
            </div>
          )}
        </div>

        {/* Controls bar */}
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <button
            type="button"
            onClick={() => setShowReposition(!showReposition)}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
              showReposition
                ? "bg-teal-500 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {showReposition ? "✓ Done Positioning" : "↔ Reposition"}
          </button>
          <button
            type="button"
            onClick={() =>
              setBlocks((prev) =>
                prev.map((b) =>
                  b.id === block.id
                    ? { ...b, objectPosition: "center center", widthPercent: 100 }
                    : b
                )
              )
            }
            className="px-2.5 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200"
          >
            Reset
          </button>
          <label className="px-2.5 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 cursor-pointer">
            {uploading ? "Uploading..." : "Replace"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={uploading}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file);
              }}
            />
          </label>
          <span className="text-[11px] text-gray-400 ml-auto">
            {widthPercent}% wide
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <input
          type="text"
          placeholder="Alt text"
          value={block.alt || ""}
          className="border rounded px-2 py-1.5 text-sm"
          onChange={(e) =>
            setBlocks((prev) =>
              prev.map((b) =>
                b.id === block.id ? { ...b, alt: e.target.value } : b
              )
            )
          }
        />
        <input
          type="text"
          placeholder="Caption (optional)"
          value={block.caption || ""}
          className="border rounded px-2 py-1.5 text-sm"
          onChange={(e) =>
            setBlocks((prev) =>
              prev.map((b) =>
                b.id === block.id ? { ...b, caption: e.target.value } : b
              )
            )
          }
        />
      </div>
    </div>
  );
}

function SortableBlock({
  block,
  setBlocks,
  deleteBlock,
}: {
  block: Block;
  setBlocks: React.Dispatch<React.SetStateAction<Block[]>>;
  deleteBlock: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="border p-4 rounded bg-white space-y-3"
    >
      <div className="flex items-center justify-between">
        <div
          ref={setActivatorNodeRef}
          {...attributes}
          {...listeners}
          className="cursor-grab text-xs text-gray-400 select-none px-2 py-1 bg-gray-50 rounded hover:bg-gray-100"
        >
          ⠿ Drag
        </div>
        <button
          type="button"
          onClick={() => deleteBlock(block.id)}
          className="text-red-500 hover:text-red-700 text-xs font-medium"
        >
          ✕ Delete
        </button>
      </div>

      {block.type === "text" && (
        <QuillEditor
          value={block.content}
          onChange={(html: string) =>
            setBlocks((prev) =>
              prev.map((b) =>
                b.id === block.id ? { ...b, content: html } : b
              )
            )
          }
        />
      )}

      {block.type === "image" && (
        <ResizableImageBlock block={block} setBlocks={setBlocks} />
      )}
    </div>
  );
}

export default function BlockEditor({ blocks, setBlocks }: Props) {
  const addTextBlock = () => {
    setBlocks((prev) => [
      ...prev,
      { id: crypto.randomUUID(), type: "text", content: "" },
    ]);
  };

  const addImageBlock = () => {
    setBlocks((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        type: "image",
        src: "",
        layout: "full",
        alt: "",
        caption: "",
      },
    ]);
  };

  const deleteBlock = (id: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setBlocks((prev) => {
      const oldIndex = prev.findIndex((b) => b.id === active.id);
      const newIndex = prev.findIndex((b) => b.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return prev;

      const updated = [...prev];
      const [moved] = updated.splice(oldIndex, 1);
      updated.splice(newIndex, 0, moved);
      return updated;
    });
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();

    const files = e.dataTransfer.files;

    if (files && files.length > 0) {
      const file = files[0];
      if (!file.type.startsWith("image/")) return;

      try {
        const url = await uploadImageToSupabase(file, "block");
        setBlocks((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            type: "image",
            src: url,
            layout: "full",
            alt: "",
            caption: "",
          },
        ]);
      } catch (err: any) {
        alert(err.message || "Failed to upload dropped image");
      }
    } else {
      const imageUrl =
        e.dataTransfer.getData("text/uri-list") ||
        e.dataTransfer.getData("text/plain");

      if (imageUrl && imageUrl.startsWith("http")) {
        setBlocks((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            type: "image",
            src: imageUrl,
            layout: "full",
            alt: "",
            caption: "",
          },
        ]);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <button
          type="button"
          onClick={addTextBlock}
          className="bg-gray-700 text-white px-3 py-2 rounded"
        >
          + Text Block
        </button>

        <button
          type="button"
          onClick={addImageBlock}
          className="bg-gray-700 text-white px-3 py-2 rounded"
        >
          + Image Block
        </button>
      </div>

      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext
          items={blocks.map((b) => b.id)}
          strategy={verticalListSortingStrategy}
        >
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="space-y-4 border-2 border-dashed border-gray-300 p-4 rounded-lg"
          >
            {blocks.length === 0 && (
              <p className="text-center text-sm text-gray-400 py-8">
                Click + Text Block or + Image Block to start, or drag an image here
              </p>
            )}
            {blocks.map((block) => (
              <SortableBlock
                key={block.id}
                block={block}
                setBlocks={setBlocks}
                deleteBlock={deleteBlock}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}