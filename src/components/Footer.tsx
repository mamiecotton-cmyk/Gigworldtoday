import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t mt-20">
      <div className="max-w-6xl mx-auto px-6 py-10 grid md:grid-cols-3 gap-8 text-sm text-gray-600">
        
        <div>
          <h3 className="font-semibold text-black mb-3">
            GigWorldToday
          </h3>
          <p>
            Structured insight and community-powered ratings
            for independent gig workers.
          </p>
        </div>

        <div>
          <h4 className="font-semibold text-black mb-3">
            Explore
          </h4>
          <ul className="space-y-2">
            <li>
              <Link href="/compare" className="hover:underline">
                Compare Platforms
              </Link>
            </li>
            <li>
              <Link href="/blog" className="hover:underline">
                Blog
              </Link>
            </li>
            <li>
              <Link href="/gig-worker-faq-2026" className="hover:underline">
                Gig Worker FAQ
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:underline">
                About
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-black mb-3">
            Legal
          </h4>
          <ul className="space-y-2">
            <li>
              <Link href="/privacy" className="hover:underline">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:underline">
                Terms of Service
              </Link>
            </li>
          </ul>
        </div>

      </div>

      <div className="border-t py-6 flex flex-col items-center gap-4">
        {/* Social icons — visible on all screens */}
        <div className="flex items-center gap-3">
          <a
            href="https://www.facebook.com/profile.php?id=61585011383587&sk=followers"
            target="_blank"
            rel="noopener noreferrer"
            className="w-9 h-9 rounded-full bg-[#1877F2] text-white flex items-center justify-center hover:scale-110 transition"
            aria-label="Facebook"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M9.198 21.5h4v-8.01h3.604l.396-3.98h-4V7.5a1 1 0 011-1h3v-4h-3a5 5 0 00-5 5v2.01h-2l-.396 3.98h2.396v8.01z"/></svg>
          </a>

          <a
            href="https://www.instagram.com/gigworldtoday/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 text-white flex items-center justify-center hover:scale-110 transition"
            aria-label="Instagram"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
          </a>

          <a
            href="https://www.tiktok.com/@gigworldtoday"
            target="_blank"
            rel="noopener noreferrer"
            className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center hover:scale-110 transition"
            aria-label="TikTok"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 0010.86 4.46V13a8.28 8.28 0 005.58 2.15v-3.44a4.85 4.85 0 01-2.65-.78V6.69h2.65z"/></svg>
          </a>

          <a
            href="https://www.reddit.com/user/Mamie-GigWorldToday/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-500 to-red-500 text-white flex items-center justify-center hover:scale-110 transition"
            aria-label="Reddit"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M14.238 15.348c.085.084.085.221 0 .306-.465.462-1.194.687-2.231.687l-.008-.002-.008.002c-1.036 0-1.766-.225-2.231-.687-.085-.085-.085-.222 0-.306.084-.085.22-.085.306 0 .388.386 1.029.579 1.925.579l.008.002.008-.002c.896 0 1.537-.193 1.925-.579.086-.085.222-.085.306 0zM9.05 12.835c0-.552.448-1 1-1s1 .448 1 1-.448 1-1 1-1-.448-1-1zm4.95-1c.552 0 1 .448 1 1s-.448 1-1 1-1-.448-1-1 .448-1 1-1zM24 12c0 6.627-5.373 12-12 12S0 18.627 0 12 5.373 0 12 0s12 5.373 12 12zm-4.862 0c0-.69-.56-1.25-1.25-1.25-.349 0-.66.142-.886.369-.96-.684-2.275-1.127-3.738-1.186l.64-3.012 2.092.446c.01.553.462 1 1.016 1 .563 0 1.02-.457 1.02-1.02s-.457-1.02-1.02-1.02c-.396 0-.736.228-.903.558l-2.338-.498a.266.266 0 00-.316.2l-.714 3.36c-1.494.044-2.838.488-3.815 1.178a1.246 1.246 0 00-.88-.363c-.69 0-1.25.56-1.25 1.25 0 .492.287.914.7 1.115a2.476 2.476 0 00-.025.357c0 1.814 2.113 3.29 4.715 3.29 2.603 0 4.716-1.476 4.716-3.29 0-.118-.009-.234-.024-.349.405-.2.688-.622.688-1.11z"/></svg>
          </a>
        </div>
        <span className="text-xs text-gray-500">
          © {new Date().getFullYear()} GigWorldToday. All rights reserved.
        </span>
      </div>

      <div className="border-t py-4 px-6 text-center text-xs text-gray-400 max-w-3xl mx-auto">
        GigWorldToday is a participant in the Amazon Services LLC Associates Program, an affiliate advertising
        program designed to provide a means for sites to earn advertising fees by advertising and linking to
        Amazon.com.
      </div>
    </footer>
  );
}
