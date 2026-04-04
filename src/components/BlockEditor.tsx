"use client";

import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import ReactCrop, { type Crop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { supabase } from "@/lib/supabaseClient";
import AmazonProductCard from "@/components/AmazonProductCard";
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
      align?: "left" | "center" | "right";
      objectPosition?: string;
      alt: string;
      caption: string;
    }
  | {
      id: string;
      type: "amazonProduct";
      heading: string;
      description: string;
      html: string;
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
  const cropImgRef = useRef<HTMLImageElement>(null);
  const [resizing, setResizing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [cropping, setCropping] = useState(false);
  const [crop, setCrop] = useState<Crop>({ unit: "%", x: 10, y: 10, width: 80, height: 80 });
  const widthPercent = block.widthPercent || 100;
  const align = block.align || "left";

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

  const applyCrop = async () => {
    const img = cropImgRef.current;
    if (!img || !crop.width || !crop.height) return;
    setUploading(true);

    try {
      const canvas = document.createElement("canvas");
      const scaleX = img.naturalWidth / img.width;
      const scaleY = img.naturalHeight / img.height;

      const pixelX = (crop.unit === "%" ? (crop.x / 100) * img.width : crop.x) * scaleX;
      const pixelY = (crop.unit === "%" ? (crop.y / 100) * img.height : crop.y) * scaleY;
      const pixelW = (crop.unit === "%" ? (crop.width / 100) * img.width : crop.width) * scaleX;
      const pixelH = (crop.unit === "%" ? (crop.height / 100) * img.height : crop.height) * scaleY;

      canvas.width = pixelW;
      canvas.height = pixelH;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(img, pixelX, pixelY, pixelW, pixelH, 0, 0, pixelW, pixelH);

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Canvas toBlob failed"))), "image/jpeg", 0.92);
      });

      const file = new File([blob], `cropped-${Date.now()}.jpg`, { type: "image/jpeg" });
      const url = await uploadImageToSupabase(file, "cropped");

      setBlocks((prev) =>
        prev.map((b) =>
          b.id === block.id ? { ...b, src: url } : b
        )
      );
      setCropping(false);
    } catch (err: any) {
      alert(err.message || "Failed to crop image");
    } finally {
      setUploading(false);
    }
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

  // Crop mode
  if (cropping) {
    return (
      <div className="space-y-3">
        <div className="border-2 border-teal-400 rounded-xl p-2 bg-gray-50">
          <ReactCrop crop={crop} onChange={(c) => setCrop(c)}>
            <img
              ref={cropImgRef}
              src={block.src}
              alt=""
              className="max-w-full"
              crossOrigin="anonymous"
            />
          </ReactCrop>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={applyCrop}
            disabled={uploading}
            className="px-3 py-1.5 rounded text-xs font-semibold bg-teal-500 text-white hover:bg-teal-600 disabled:opacity-50"
          >
            {uploading ? "Cropping..." : "✓ Apply Crop"}
          </button>
          <button
            type="button"
            onClick={() => setCropping(false)}
            className="px-3 py-1.5 rounded text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // Normal view with resize + controls
  const alignClass =
    align === "center" ? "mx-auto" : align === "right" ? "ml-auto" : "";

  return (
    <div className="space-y-3">
      <div ref={containerRef} className="relative">
        <div
          style={{ width: `${widthPercent}%` }}
          className={`relative group transition-[width] duration-75 ${alignClass}`}
        >
          <img
            src={block.src}
            alt={block.alt || ""}
            className={`w-full h-auto rounded-xl ${resizing ? "select-none pointer-events-none" : ""}`}
            draggable={false}
          />

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
            onClick={() => {
              setCrop({ unit: "%", x: 10, y: 10, width: 80, height: 80 });
              setCropping(true);
            }}
            className="px-2.5 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200"
          >
            ✂ Crop
          </button>

          {/* Alignment buttons */}
          {(["left", "center", "right"] as const).map((a) => (
            <button
              key={a}
              type="button"
              onClick={() =>
                setBlocks((prev) =>
                  prev.map((b) =>
                    b.id === block.id ? { ...b, align: a } : b
                  )
                )
              }
              className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                align === a
                  ? "bg-teal-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {a === "left" ? "◀" : a === "center" ? "◆" : "▶"}
            </button>
          ))}

          <button
            type="button"
            onClick={() =>
              setBlocks((prev) =>
                prev.map((b) =>
                  b.id === block.id
                    ? { ...b, widthPercent: 100, align: "left" }
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
            {widthPercent}% wide · {align}
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

  const handleQuillChange = (html: string) =>
    setBlocks((prev) =>
      prev.map((b) => (b.id === block.id ? { ...b, content: html } : b))
    );

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
        <QuillEditor value={block.content} onChange={handleQuillChange} />
      )}

      {block.type === "image" && (
        <ResizableImageBlock block={block} setBlocks={setBlocks} />
      )}

      {block.type === "amazonProduct" && (
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Section heading"
            value={block.heading}
            className="w-full rounded border px-3 py-2 text-sm"
            onChange={(e) =>
              setBlocks((prev) =>
                prev.map((b) =>
                  b.id === block.id ? { ...b, heading: e.target.value } : b
                )
              )
            }
          />
          <textarea
            placeholder="Short description for why this product matters"
            value={block.description}
            rows={3}
            className="w-full rounded border px-3 py-2 text-sm"
            onChange={(e) =>
              setBlocks((prev) =>
                prev.map((b) =>
                  b.id === block.id
                    ? { ...b, description: e.target.value }
                    : b
                )
              )
            }
          />
          <textarea
            placeholder="Paste Amazon embed HTML"
            value={block.html}
            rows={8}
            className="w-full rounded border px-3 py-2 font-mono text-xs"
            onChange={(e) =>
              setBlocks((prev) =>
                prev.map((b) =>
                  b.id === block.id ? { ...b, html: e.target.value } : b
                )
              )
            }
          />
          {block.html.trim() !== "" && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="mb-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                Preview
              </p>
              <AmazonProductCard html={block.html} />
            </div>
          )}
        </div>
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

  const addAmazonProductBlock = () => {
    setBlocks((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        type: "amazonProduct",
        heading: "",
        description: "",
        html: "",
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
      <div className="flex flex-wrap gap-3">
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

        <button
          type="button"
          onClick={addAmazonProductBlock}
          className="bg-teal-600 text-white px-3 py-2 rounded"
        >
          + Product Section
        </button>
      </div>

      <p className="text-sm text-gray-500">
        Use <span className="font-medium text-teal-700">+ Product Section</span> to insert an Amazon card with a heading and short explanation inside the article.
      </p>

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
