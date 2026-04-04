"use client";

type AmazonProductCardProps = {
  html: string;
};

function sanitizeAmazonHtml(html: string) {
  return html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/\son\w+="[^"]*"/gi, "")
    .replace(/\son\w+='[^']*'/gi, "")
    .replace(/\s(href|src)=("|')javascript:[\s\S]*?\2/gi, "");
}

export default function AmazonProductCard({
  html,
}: AmazonProductCardProps) {
  const safeHtml = sanitizeAmazonHtml(html);

  return (
    <div className="mx-auto w-full max-w-sm rounded-xl bg-white p-4 shadow-md sm:max-w-md sm:p-5 md:max-w-lg md:p-6">
      <div
        className="prose prose-sm max-w-none break-words sm:prose-base"
        dangerouslySetInnerHTML={{ __html: safeHtml }}
      />
    </div>
  );
}
