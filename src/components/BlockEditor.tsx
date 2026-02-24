"use client";

import dynamic from "next/dynamic";
import { supabase } from "@/lib/supabaseClient";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Dynamic import to avoid SSR issues with Quill
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
      alt: string;
      caption: string;
    };

interface Props {
  blocks: Block[];
  setBlocks: React.Dispatch<React.SetStateAction<Block[]>>;
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
      {/* Drag Handle */}
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
          onChange={(html) =>
            setBlocks((prev) =>
              prev.map((b) =>
                b.id === block.id ? { ...b, content: html } : b
              )
            )
          }
        />
      )}

      {block.type === "image" && block.src && (
        <img
          src={block.src}
          alt={block.alt || ""}
          className="w-full h-auto rounded-xl"
        />
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

  // FIX: Use prev callback to avoid stale state
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

      const fileExt = file.name.split(".").pop();
      const fileName = `block-${Date.now()}.${fileExt}`;

      const { error } = await supabase.storage
        .from("article-images")
        .upload(fileName, file);

      if (error) return;

      const { data } = supabase.storage
        .from("article-images")
        .getPublicUrl(fileName);

      setBlocks((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          type: "image",
          src: data.publicUrl,
          layout: "full",
          alt: "",
          caption: "",
        },
      ]);
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
