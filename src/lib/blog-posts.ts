export type BlogPost = {
  title: string;
  slug: string;
  summary: string;
  date: string;
};

const fallbackBlogPosts: BlogPost[] = [
  {
    title: "How to Maximize Earnings During Peak Gig Hours",
    slug: "maximize-earnings-peak-hours",
    summary:
      "Learn practical scheduling strategies to align your availability with high-demand windows across multiple gig platforms.",
    date: "2026-01-14",
  },
  {
    title: "5 Tax Deductions Every Gig Worker Should Track",
    slug: "tax-deductions-for-gig-workers",
    summary:
      "A quick guide to common deductible expenses and simple record-keeping habits that can save you money at tax time.",
    date: "2025-12-03",
  },
  {
    title: "Choosing the Right Platforms for Your Goals",
    slug: "choosing-right-gig-platforms",
    summary:
      "Compare popular gig apps by flexibility, payout patterns, and market demand so you can build a sustainable routine.",
    date: "2025-10-21",
  },
  {
    title: "Weekly Planning Template for Part-Time Gig Workers",
    slug: "weekly-planning-template",
    summary:
      "Use this lightweight planning framework to balance side gigs with your primary job and avoid burnout.",
    date: "2025-09-02",
  },
];

function isValidBlogPost(post: unknown): post is BlogPost {
  if (!post || typeof post !== "object") return false;

  const candidate = post as BlogPost;
  return (
    typeof candidate.title === "string" &&
    typeof candidate.slug === "string" &&
    typeof candidate.summary === "string" &&
    typeof candidate.date === "string"
  );
}

function sortPostsByDateDescending(posts: BlogPost[]): BlogPost[] {
  return [...posts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

async function getRemoteBlogPosts(url: string): Promise<BlogPost[] | null> {
  try {
    const response = await fetch(url, {
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as unknown;
    if (!Array.isArray(payload)) {
      return null;
    }

    const validPosts = payload.filter(isValidBlogPost);
    return validPosts.length > 0 ? sortPostsByDateDescending(validPosts) : null;
  } catch {
    return null;
  }
}

/**
 * Live-friendly publishing option:
 * - Set BLOG_POSTS_URL to a hosted JSON file containing an array of blog posts.
 * - Each item must include: title, slug, summary, date (YYYY-MM-DD).
 * - If unreachable or invalid, fallback sample posts are used.
 */
export async function getBlogPosts(): Promise<BlogPost[]> {
  const externalUrl = process.env.BLOG_POSTS_URL;

  if (externalUrl) {
    const remotePosts = await getRemoteBlogPosts(externalUrl);
    if (remotePosts) {
      return remotePosts;
    }
  }

  return sortPostsByDateDescending(fallbackBlogPosts);
}
