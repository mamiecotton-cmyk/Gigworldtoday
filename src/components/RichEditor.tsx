"use client";

import { useEffect, useRef } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";

interface Props {
  value: string;
  onChange: (html: string, delta: any) => void;
}

export default function RichEditor({ value, onChange }: Props) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const quillRef = useRef<Quill | null>(null);

  useEffect(() => {
    if (!editorRef.current || quillRef.current) return;

    const quill = new Quill(editorRef.current, {
      theme: "snow",
      modules: {
        toolbar: [
          [{ header: [1, 2, false] }],
          ["bold", "italic", "underline"],
          ["link", "image"],
          ["clean"],
        ],
      },
    });

    quill.on("text-change", () => {
      onChange(quill.root.innerHTML, quill.getContents());
    });

    quillRef.current = quill;
  }, []);

  useEffect(() => {
    if (quillRef.current && value !== quillRef.current.root.innerHTML) {
      quillRef.current.root.innerHTML = value;
    }
  }, [value]);

  return <div ref={editorRef} />;
}
