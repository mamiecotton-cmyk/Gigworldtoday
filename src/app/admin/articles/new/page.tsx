"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";


export default function NewArticle() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [published, setPublished] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [bodyImageFile, setBodyImageFile] = useState<File | null>(null);
  const [bodyImageUrl, setBodyImageUrl] = useState<string | null>(null);
  const [bodyImageUploading, setBodyImageUploading] = useState(false);

  const handleBodyImageUpload = async () => {
    if (!bodyImageFile) return;

    const maxSize = 2 * 1024 * 1024;
    if (bodyImageFile.size > maxSize) {
      alert("Image must be under 2MB");
      return;
    }

    setBodyImageUploading(true);

    const fileExt = bodyImageFile.name.split(".").pop();
    const fileName = `body-${Date.now()}.${fileExt}`;

    const { error } = await supabase.storage
      .from("article-images")
      .upload(fileName, bodyImageFile);

    if (error) {
      alert("Upload failed");
      setBodyImageUploading(false);
      return;
    }

    const { data } = supabase.storage
      .from("article-images")
      .getPublicUrl(fileName);

    setContent((prev) =>
      prev + `\n\n<img src="${data.publicUrl}" alt="Article image" />\n\n`
    );

    setBodyImageUploading(false);
  };

  const uploadBodyImage = async () => {
    if (!bodyImageFile) return;

    const maxSize = 2 * 1024 * 1024;
    if (bodyImageFile.size > maxSize) {
      alert("Image must be under 2MB");
      return;
    }

    const fileExt = bodyImageFile.name.split(".").pop();
    const fileName = `body-${Date.now()}.${fileExt}`;

    const { error } = await supabase.storage
      .from("article-images")
      .upload(fileName, bodyImageFile);

    if (error) {
      alert("Upload failed");
      return;
    }

    const { data } = supabase.storage
      .from("article-images")
      .getPublicUrl(fileName);

    setBodyImageUrl(data.publicUrl);
  };

  const handleSubmit = async () => {
    let imageUrl = null;

    if (imageFile) {
      setUploading(true);

      const fileExt = imageFile.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;


            // Handle image upload and article creation logic here
            // Remove the misplaced import and component definition
      
            setUploading(false);
          }
        };
      
        return (
          <div>
            <h1>Create New Article</h1>
            {/* Add your form fields and handlers here */}
          </div>
        );
      }

