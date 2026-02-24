import { QuillDeltaToHtmlConverter } from "quill-delta-to-html";
import Image from "next/image";

type ArticleBlock =
  | { type: "richText"; delta: any }
  | {
      type: "image";
      src: string;
      alt: string;
      caption?: string;
      layout: "full" | "left" | "right" | "center" | "inline";
      width?: "small" | "medium" | "full";
    };

function deltaToHtml(delta: any) {
  const ops = delta?.ops ?? [];
  const converter = new QuillDeltaToHtmlConverter(ops, {});
  return converter.convert();
}

export default function ArticleRenderer({
  contentJson,
  legacyHtml,
}: {
  contentJson?: ArticleBlock[] | null;
  legacyHtml?: string | null;
}) {
  if (contentJson && contentJson.length > 0) {
    return (
      <article className="prose max-w-none">
        {contentJson.map((block, i) => {
          if (block.type === "richText") {
            const html = deltaToHtml(block.delta);
            return <div key={i} dangerouslySetInnerHTML={{ __html: html }} />;
          }

          if (block.type === "image") {
            const float =
              block.layout === "left"
                ? "float-left mr-4 mb-4"
                : block.layout === "right"
                ? "float-right ml-4 mb-4"
                : "";

            const width =
              block.width === "small"
                ? "w-1/3"
                : block.width === "medium"
                ? "w-2/3"
                : "w-full";

            const center = block.layout === "center" ? "mx-auto text-center" : "";

            return (
              <figure key={i} className={`${float} ${center} ${width}`}>
                <Image
                  src={block.src}
                  alt={block.alt || ""}
                  width={1400}
                  height={900}
                  className="rounded-lg"
                />
                {block.caption ? (
                  <figcaption className="text-sm text-gray-500 mt-2">{block.caption}</figcaption>
                ) : null}
              </figure>
            );
          }

          return null;
        })}
        <div className="clear-both" />
      </article>
    );
  }

  if (legacyHtml) {
    return <article className="prose max-w-none" dangerouslySetInnerHTML={{ __html: legacyHtml }} />;
  }

  return null;
}
