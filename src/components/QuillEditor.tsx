"use client";

import { useEffect, useRef, useCallback } from "react";

interface QuillEditorProps {
  value: string;
  onChange: (html: string) => void;
}

export default function QuillEditor({ value, onChange }: QuillEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<any>(null);
  const handlerRef = useRef<any>(null);
  const onChangeRef = useRef(onChange);
  const isInternalChange = useRef(false);

  // Keep onChange ref current without re-initializing Quill
  // Update via effect to avoid assigning during render
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (!containerRef.current || quillRef.current) return;

    let cancelled = false;

    const initQuill = async () => {
      let Quill: any;
      try {
        Quill = (await import("quill")).default;
      } catch (err) {
        // Fail gracefully if the library can't be loaded
        // eslint-disable-next-line no-console
        console.error("Failed to load Quill editor", err);
        return;
      }

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

      // Listen for changes via a stable handler so we can detach on cleanup
      handlerRef.current = () => {
        if (!isInternalChange.current) {
          const html = q.root.innerHTML;
          onChangeRef.current(html === "<p><br></p>" ? "" : html);
        }
      };
      q.on("text-change", handlerRef.current);

      quillRef.current = q;
    };

    initQuill();

    return () => {
      cancelled = true;
      // Detach event handler and clear instance
      if (quillRef.current && handlerRef.current) {
        try {
          quillRef.current.off("text-change", handlerRef.current);
        } catch (err) {
          // ignore if off isn't supported
        }
        handlerRef.current = null;
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
