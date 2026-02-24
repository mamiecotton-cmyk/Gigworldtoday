"use client";

import { useEffect, useRef } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";

type Props = {
  value: any; // Quill Delta
  onChange: (delta: any) => void;
};

export default function QuillEditor({ value, onChange }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const quillRef = useRef<Quill | null>(null);
  const lastValueRef = useRef<any>(value);

  useEffect(() => {
    if (!containerRef.current) return;
    if (quillRef.current) return;

    const quill = new Quill(containerRef.current, {
      theme: "snow",
      modules: {
        toolbar: [
          [{ header: [2, 3, false] }],
          ["bold", "italic", "underline"],
          [{ list: "ordered" }, { list: "bullet" }],
          ["link"],
          ["clean"],
        ],
      },
    });

    quillRef.current = quill;

    if (value) quill.setContents(value);

    quill.on("text-change", () => {
      const next = quill.getContents();
      lastValueRef.current = next;
      onChange(next);
    });
  }, []);

  useEffect(() => {
    const quill = quillRef.current;
    if (!quill) return;

    const incoming = value;
    const last = lastValueRef.current;

    const same =
      JSON.stringify(incoming?.ops ?? []) === JSON.stringify(last?.ops ?? []);

    if (!same && incoming) {
      quill.setContents(incoming);
      lastValueRef.current = incoming;
    }
  }, [value]);

  return <div ref={containerRef} />;
}
