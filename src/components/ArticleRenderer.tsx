import { Block } from "@/components/BlockEditor";
import AmazonProductCard from "@/components/AmazonProductCard";

interface Props {
  contentJson: Block[] | null;
}

export default function ArticleRenderer({ contentJson }: Props) {
  if (!contentJson || contentJson.length === 0) {
    return null;
  }

  return (
    <div className="space-y-8">
      {contentJson.map((block) => {
        if (block.type === "text") {
          if (!block.content || block.content.trim() === "") return null;
          return (
            <div
              key={block.id}
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: block.content }}
            />
          );
        }
        if (block.type === "image") {
          return <ImageBlock key={block.id} block={block} />;
        }
        if (block.type === "amazonProduct") {
          if (!block.html || block.html.trim() === "") return null;
          return (
            <section
              key={block.id}
              className="my-12 rounded-2xl border border-slate-200 bg-slate-50/70 p-5 sm:p-6"
            >
              {block.heading.trim() !== "" && (
                <h2 className="mb-3 text-2xl font-semibold tracking-tight text-slate-900">
                  {block.heading}
                </h2>
              )}
              {block.description.trim() !== "" && (
                <p className="mb-6 text-base leading-8 text-slate-700">
                  {block.description}
                </p>
              )}
              <AmazonProductCard html={block.html} />
            </section>
          );
        }
        return null;
      })}
    </div>
  );
}

function ImageBlock({ block }: { block: Extract<Block, { type: "image" }> }) {
  if (!block.src) return null;

  const widthPercent = (block as any).widthPercent || 100;

  const baseImage = (
    <img
      src={block.src}
      alt={block.alt || ""}
      className="w-full rounded-xl"
    />
  );

  if (widthPercent < 100) {
    return (
      <div style={{ width: `${widthPercent}%` }}>
        {baseImage}
        {block.caption && (
          <p className="text-sm text-gray-500 mt-2">{block.caption}</p>
        )}
      </div>
    );
  }

  switch (block.layout) {
    case "full":
      return (
        <div className="w-full">
          {baseImage}
          {block.caption && (
            <p className="text-sm text-gray-500 mt-2 text-center">
              {block.caption}
            </p>
          )}
        </div>
      );
    case "center":
      return (
        <div className="flex flex-col items-center">
          <div className="max-w-2xl w-full">{baseImage}</div>
          {block.caption && (
            <p className="text-sm text-gray-500 mt-2 text-center">
              {block.caption}
            </p>
          )}
        </div>
      );
    case "left":
      return (
        <div className="md:flex md:gap-6">
          <div className="md:w-1/2">{baseImage}</div>
          {block.caption && (
            <div className="md:w-1/2 flex items-center">
              <p className="text-sm text-gray-500">{block.caption}</p>
            </div>
          )}
        </div>
      );
    case "right":
      return (
        <div className="md:flex md:gap-6 md:flex-row-reverse">
          <div className="md:w-1/2">{baseImage}</div>
          {block.caption && (
            <div className="md:w-1/2 flex items-center">
              <p className="text-sm text-gray-500">{block.caption}</p>
            </div>
          )}
        </div>
      );
    default:
      return null;
  }
}
