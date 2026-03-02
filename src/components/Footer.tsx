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

      <div className="border-t py-6 flex flex-col items-center gap-3">
        <a
          href="https://www.reddit.com/user/Mamie-GigWorldToday/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Reddit"
          className="group relative"
        >
          {/* Tooltip */}
          <span className="absolute -top-9 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gray-900 text-white text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 pointer-events-none">
            Reddit
          </span>

          {/* Animated glow ring */}
          <span className="absolute inset-0 rounded-full bg-gradient-to-tr from-orange-400 via-red-500 to-orange-400 opacity-0 group-hover:opacity-100 blur-md transition-opacity duration-500 scale-125" />
          
          {/* Icon container */}
          <span className="relative flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-lg group-hover:shadow-orange-400/50 group-hover:scale-110 transition-all duration-300">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-6 h-6 group-hover:rotate-[15deg] transition-transform duration-300"
            >
              <path d="M14.238 15.348c.085.084.085.221 0 .306-.465.462-1.194.687-2.231.687l-.008-.002-.008.002c-1.036 0-1.766-.225-2.231-.687-.085-.085-.085-.222 0-.306.084-.085.22-.085.306 0 .388.386 1.029.579 1.925.579l.008.002.008-.002c.896 0 1.537-.193 1.925-.579.086-.085.222-.085.306 0zM9.05 12.835c0-.552.448-1 1-1s1 .448 1 1-.448 1-1 1-1-.448-1-1zm4.95-1c.552 0 1 .448 1 1s-.448 1-1 1-1-.448-1-1 .448-1 1-1zM24 12c0 6.627-5.373 12-12 12S0 18.627 0 12 5.373 0 12 0s12 5.373 12 12zm-4.862 0c0-.69-.56-1.25-1.25-1.25-.349 0-.66.142-.886.369-.96-.684-2.275-1.127-3.738-1.186l.64-3.012 2.092.446c.01.553.462 1 1.016 1 .563 0 1.02-.457 1.02-1.02s-.457-1.02-1.02-1.02c-.396 0-.736.228-.903.558l-2.338-.498 a.266.266 0 0 0-.316.2l-.714 3.36c-1.494.044-2.838.488-3.815 1.178a1.246 1.246 0 0 0-.88-.363c-.69 0-1.25.56-1.25 1.25 0 .492.287.914.7 1.115a2.476 2.476 0 0 0-.025.357c0 1.814 2.113 3.29 4.715 3.29 2.603 0 4.716-1.476 4.716-3.29 0-.118-.009-.234-.024-.349.405-.2.688-.622.688-1.11z" />
            </svg>
          </span>
        </a>

        <p className="text-xs text-gray-400 tracking-wide">
          Join the conversation
        </p>

        <span className="text-xs text-gray-500">
          © {new Date().getFullYear()} GigWorldToday. All rights reserved.
        </span>
      </div>
    </footer>
  );
}
