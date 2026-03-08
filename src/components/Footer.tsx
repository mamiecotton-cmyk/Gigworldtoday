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
        <span className="text-xs text-gray-500">
          © {new Date().getFullYear()} GigWorldToday. All rights reserved.
        </span>
      </div>
    </footer>
  );
}
