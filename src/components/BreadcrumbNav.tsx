"use client";
import Link from "next/link";

export default function BreadcrumbNav({ platformName }: { platformName: string }) {
  return (
    <nav className="mb-6 text-sm">
      <Link href="/" className="text-primary-600 hover:underline">Home</Link>
      <span className="mx-2 text-gray-400">/</span>
      <Link href="/platforms" className="text-primary-600 hover:underline">Platforms</Link>
      <span className="mx-2 text-gray-400">/</span>
      <span className="text-gray-600">{platformName}</span>
    </nav>
  );
}
