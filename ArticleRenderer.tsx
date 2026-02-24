import { Block } from "./BlockEditor";

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
        return null;
      })}
    </div>
  );
}

function ImageBlock({ block }: { block: Extract<Block, { type: "image" }> }) {
  if (!block.src) return null;

  const baseImage = (
    <img
      src={block.src}
      alt={block.alt || ""}
      className="rounded-xl"
    />
  );

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
