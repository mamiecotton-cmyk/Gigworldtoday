
"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import QuillEditor from "@/components/QuillEditor";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import SortableBlock from "@/components/SortableBlock";

const uid = () =>
  (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`);


type BaseBlock = { id: string };

type ArticleBlock =
  | (BaseBlock & { type: "richText"; delta: any })
  | (BaseBlock & {
      type: "image";
      src: string;
      alt: string;
      caption?: string;
      layout: "full" | "left" | "right" | "center" | "inline";
      width?: "small" | "medium" | "full";
    });

type ArticleFormProps = {
  initialContent?: ArticleBlock[];
  articleId?: string;
  initialTitle?: string;
  initialSlug?: string;
  initialExcerpt?: string;
};

export default function ArticleForm({
  initialContent = [],
  articleId: initialArticleId,
  initialTitle = "",
  initialSlug = "",
  initialExcerpt = ""
}: ArticleFormProps) {
  // ...existing code...

  const moveBlockUp = (index: number) => {
    if (index === 0) return;
    setBlocks((prev: ArticleBlock[]) => {
      const copy = [...prev];
      [copy[index - 1], copy[index]] = [copy[index], copy[index - 1]];
      return copy;
    });
  };

  const moveBlockDown = (index: number) => {
    if (index === blocks.length - 1) return;
    setBlocks((prev: ArticleBlock[]) => {
      const copy = [...prev];
      [copy[index + 1], copy[index]] = [copy[index], copy[index + 1]];
      return copy;
    });
  };
  const [title, setTitle] = useState(initialTitle);
  const [slug, setSlug] = useState(initialSlug);
  const [excerpt, setExcerpt] = useState(initialExcerpt);
  const [featuredImage, setFeaturedImage] = useState<string>("");
  const [articleId, setArticleId] = useState<string | null>(initialArticleId ?? null);
  const [blocks, setBlocks] = useState<ArticleBlock[]>(
    initialContent.length
      ? initialContent
      : [
          { id: uid(), type: "richText", delta: { ops: [] } },
        ]
  );
  const [busy, setBusy] = useState(false);

  const createDraftIfNeeded = async () => {
    if (articleId) return articleId;
    const { data, error } = await supabase
      .from("articles")
      .insert({
        title: title.trim(),
        slug: slug.trim(),
        excerpt,
        featured_image: featuredImage || null,
        published: false,
        content_version: 2,
        content_json: [], // temp
      })
      .select("id")
      .single();
    if (error) throw error;
    setArticleId(data.id);
    return data.id as string;
  };

  const uploadToStorage = async (id: string, file: File) => {
    const ext = file.name.split(".").pop() || "png";
    const filename = `${Date.now()}-${Math.random().toString(16).slice(2)}.${ext}`;
    const path = `articles/${id}/${filename}`;

    const { error } = await supabase.storage
      .from("article-images")
      .upload(path, file, { cacheControl: "3600", upsert: false });

    if (error) throw error;

    const { data } = supabase.storage.from("article-images").getPublicUrl(path);
    return data.publicUrl;
  };

  const addText = () =>
    setBlocks((p) => [
      ...p,
      { id: uid(), type: "richText", delta: { ops: [] } },
    ]);

  const addImage = () =>
    setBlocks((p) => [
      ...p,
      {
        id: uid(),
        type: "image",
        src: "",
        alt: "",
        caption: "",
        layout: "full",
        width: "full",
      },
    ]);
  // DnD sensors and onDragEnd
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    if (active.id === over.id) return;

    setBlocks((items) => {
      const oldIndex = items.findIndex((b) => b.id === active.id);
      const newIndex = items.findIndex((b) => b.id === over.id);
      return arrayMove(items, oldIndex, newIndex);
    });
  };

  const updateBlock = (index: number, next: ArticleBlock) => {
    setBlocks((prev) => {
      const copy = [...prev];
      copy[index] = next;
      return copy;
    });
  };

  const handleBodyImageUpload = async (index: number, file: File) => {
    setBusy(true);
    try {
      if (!title.trim() || !slug.trim()) {
        alert("Set title + slug before uploading images (so we can create the draft).");
        return;
      }

      const id = await createDraftIfNeeded();
      const url = await uploadToStorage(id, file);

      const block = blocks[index];
      if (block.type !== "image") return;

      updateBlock(index, { ...block, src: url });
    } catch (e: any) {
      console.error(e);
      alert(e?.message ?? "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  const handleFeaturedUpload = async (file: File) => {
    setBusy(true);
    try {
      if (!title.trim() || !slug.trim()) {
        alert("Set title + slug before uploading featured image.");
        return;
      }

      const id = await createDraftIfNeeded();
      const url = await uploadToStorage(id, file);

      setFeaturedImage(url);

      await supabase.from("articles").update({ featured_image: url }).eq("id", id);
    } catch (e: any) {
      console.error(e);
      alert(e?.message ?? "Featured upload failed");
    } finally {
      setBusy(false);
    }
  };

  const save = async () => {
    setBusy(true);
    try {
      if (!title.trim() || !slug.trim()) {
        alert("Title and slug are required.");
        return;
      }

      const id = await createDraftIfNeeded();

      const { error } = await supabase
        .from("articles")
        .update({
          title: title.trim(),
          slug: slug.trim(),
          excerpt,
          featured_image: featuredImage || null,
          content_json: blocks,
          content_version: 2,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;

      alert("Saved!");
    } catch (e: any) {
      console.error(e);
      alert(e?.message ?? "Save failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-3">
        <input className="border p-2" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" />
        <input className="border p-2" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="Slug" />
        <textarea className="border p-2" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} placeholder="Excerpt" />
      </div>

      <div className="border rounded p-4 space-y-2">
        <div className="text-sm font-semibold">Featured / Header Image</div>
        <input type="file" accept="image/*" onChange={(e) => e.target.files && handleFeaturedUpload(e.target.files[0])} />
        {featuredImage ? <div className="text-xs text-green-700 break-all">{featuredImage}</div> : null}
      </div>

      <div className="flex gap-2">
        <button className="border px-3 py-2" type="button" onClick={addText}>
          + Text
        </button>
        <button className="border px-3 py-2" type="button" onClick={addImage}>
          + Image Block
        </button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        <SortableContext
          items={blocks.map((b) => b.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-6">
            {blocks.map((block, i) => (
              <SortableBlock key={block.id} id={block.id}>
                {block.type === "richText" ? (
                  <div className="border rounded p-2">
                    <QuillEditor
                      value={block.delta}
                      onChange={(delta) =>
                        setBlocks((prev) => {
                          const copy = [...prev];
                          copy[i] = { ...block, delta };
                          return copy;
                        })
                      }
                    />
                  </div>
                ) : (
                  <div className="border rounded p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-semibold">Image Block</div>
                      <button
                        type="button"
                        className="border px-2 py-1 text-sm"
                        onClick={() =>
                          setBlocks((prev) => prev.filter((b) => b.id !== block.id))
                        }
                      >
                        Delete
                      </button>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        e.target.files && handleBodyImageUpload(i, e.target.files[0])
                      }
                    />
                    <input
                      className="border p-2 w-full"
                      placeholder="Alt text"
                      value={block.alt}
                      onChange={(e) =>
                        setBlocks((prev) => {
                          const copy = [...prev];
                          copy[i] = { ...block, alt: e.target.value };
                          return copy;
                        })
                      }
                    />
                    <input
                      className="border p-2 w-full"
                      placeholder="Caption (optional)"
                      value={block.caption || ""}
                      onChange={(e) =>
                        setBlocks((prev) => {
                          const copy = [...prev];
                          copy[i] = { ...block, caption: e.target.value };
                          return copy;
                        })
                      }
                    />
                    <div className="flex gap-3">
                      <label className="text-sm">
                        Layout
                        <select
                          className="border ml-2 p-1"
                          value={block.layout}
                          onChange={(e) =>
                            setBlocks((prev) => {
                              const copy = [...prev];
                              copy[i] = { ...block, layout: e.target.value as any };
                              return copy;
                            })
                          }
                        >
                          <option value="full">Full width</option>
                          <option value="left">Left wrap</option>
                          <option value="right">Right wrap</option>
                          <option value="center">Centered</option>
                          <option value="inline">Inline</option>
                        </select>
                      </label>
                      <label className="text-sm">
                        Width
                        <select
                          className="border ml-2 p-1"
                          value={block.width || "full"}
                          onChange={(e) =>
                            setBlocks((prev) => {
                              const copy = [...prev];
                              copy[i] = { ...block, width: e.target.value as any };
                              return copy;
                            })
                          }
                        >
                          <option value="small">Small</option>
                          <option value="medium">Medium</option>
                          <option value="full">Full</option>
                        </select>
                      </label>
                    </div>
                    {block.src ? (
                      <div className="text-xs text-green-700 break-all">{block.src}</div>
                    ) : null}
                  </div>
                )}
              </SortableBlock>
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <button className="border px-4 py-2" type="button" disabled={busy} onClick={save}>
        {busy ? "Working..." : "Save"}
      </button>
    </div>
  );
}