"use client";

import { useEffect, useRef, useCallback } from "react";

interface QuillEditorProps {
  value: string;
  onChange: (html: string) => void;
}

export default function QuillEditor({ value, onChange }: QuillEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<any>(null);
  const onChangeRef = useRef(onChange);
  const isInternalChange = useRef(false);

  // Keep onChange ref current without re-initializing Quill
  onChangeRef.current = onChange;

  useEffect(() => {
    if (!containerRef.current || quillRef.current) return;

    let cancelled = false;

    const initQuill = async () => {
      const Quill = (await import("quill")).default;

      if (cancelled || !containerRef.current) return;

      // Create editor div inside container
      const editorDiv = document.createElement("div");
      containerRef.current.appendChild(editorDiv);

      const q = new Quill(editorDiv, {
        theme: "snow",
        modules: {
          toolbar: [
            [{ header: [1, 2, 3, false] }],
            ["bold", "italic", "underline", "strike"],
            [{ list: "ordered" }, { list: "bullet" }],
            ["blockquote", "link"],
            ["clean"],
          ],
        },
        placeholder: "Write your content here...",
      });

      // Set initial value
      if (value) {
        isInternalChange.current = true;
        q.root.innerHTML = value;
        isInternalChange.current = false;
      }

      // Listen for changes
      q.on("text-change", () => {
        if (!isInternalChange.current) {
          const html = q.root.innerHTML;
          onChangeRef.current(html === "<p><br></p>" ? "" : html);
        }
      });

      quillRef.current = q;
    };

    initQuill();

    return () => {
      cancelled = true;
      if (quillRef.current) {
        quillRef.current = null;
      }
      // Clean up editor DOM
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, []); // Only run once on mount

  // Sync external value changes (e.g. on reload)
  useEffect(() => {
    if (!quillRef.current) return;
    const currentHtml = quillRef.current.root.innerHTML;
    const normalizedCurrent = currentHtml === "<p><br></p>" ? "" : currentHtml;
    if (value !== normalizedCurrent) {
      isInternalChange.current = true;
      quillRef.current.root.innerHTML = value || "";
      isInternalChange.current = false;
    }
  }, [value]);

  return (
    <>
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/quill@2/dist/quill.snow.css"
      />
      <div ref={containerRef} className="quill-wrapper" />
      <style jsx global>{`
        .quill-wrapper .ql-container {
          min-height: 120px;
          font-size: 15px;
          border-bottom-left-radius: 8px;
          border-bottom-right-radius: 8px;
        }
        .quill-wrapper .ql-toolbar {
          border-top-left-radius: 8px;
          border-top-right-radius: 8px;
          background: #f9fafb;
        }
        .quill-wrapper .ql-editor {
          min-height: 120px;
        }
      `}</style>
    </>
  );
}
