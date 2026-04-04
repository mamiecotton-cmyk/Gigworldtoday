import type { Metadata } from "next";
import AmazonProductCard from "@/components/AmazonProductCard";

export const metadata: Metadata = {
  title: "7 Must-Have Tools Every Gig Worker Needs to Maximize Earnings (2026)",
  description:
    "A simple editorial guide to the essential tools gig workers can use to stay organized, protect their car, and increase earnings.",
};

const products = [
  {
    name: "Phone Mount",
    description:
      "A stable mount keeps navigation visible without forcing you to constantly glance down or fumble for your phone between stops. That translates into safer driving, faster pickups, and less mental fatigue on long shifts.",
    html: `
      <a
        href="https://www.amazon.com/s?k=car+phone+mount+for+drivers"
        target="_blank"
        rel="noopener noreferrer sponsored"
        class="block"
      >
        <div style="display:flex;gap:1rem;align-items:center;flex-wrap:wrap;">
          <div style="width:84px;height:84px;border-radius:0.75rem;background:#f1f5f9;display:flex;align-items:center;justify-content:center;font-size:2rem;">📱</div>
          <div style="flex:1;min-width:200px;">
            <p style="margin:0 0 0.35rem;font-size:0.75rem;letter-spacing:0.08em;text-transform:uppercase;color:#0f766e;">Amazon Tool</p>
            <h3 style="margin:0 0 0.45rem;font-size:1.1rem;color:#0f172a;">Dashboard Phone Mount</h3>
            <p style="margin:0;color:#475569;line-height:1.6;">A reliable mount helps you keep maps, orders, and ride requests visible at a glance.</p>
          </div>
        </div>
      </a>
    `,
  },
  {
    name: "Portable Power Bank",
    description:
      "Gig work falls apart fast when your phone dies. A dependable power bank protects your navigation, delivery apps, and customer communication when you're away from a charger for hours at a time.",
    html: `
      <a
        href="https://www.amazon.com/s?k=portable+power+bank+fast+charging"
        target="_blank"
        rel="noopener noreferrer sponsored"
        class="block"
      >
        <div style="display:flex;gap:1rem;align-items:center;flex-wrap:wrap;">
          <div style="width:84px;height:84px;border-radius:0.75rem;background:#fef3c7;display:flex;align-items:center;justify-content:center;font-size:2rem;">🔋</div>
          <div style="flex:1;min-width:200px;">
            <p style="margin:0 0 0.35rem;font-size:0.75rem;letter-spacing:0.08em;text-transform:uppercase;color:#0f766e;">Amazon Tool</p>
            <h3 style="margin:0 0 0.45rem;font-size:1.1rem;color:#0f172a;">Fast-Charge Power Bank</h3>
            <p style="margin:0;color:#475569;line-height:1.6;">Backup battery power is one of the simplest ways to avoid missed orders and lost time.</p>
          </div>
        </div>
      </a>
    `,
  },
  {
    name: "Insulated Delivery Bag",
    description:
      "For food delivery, temperature control matters. A quality insulated bag helps protect the customer experience, supports better ratings, and reduces the odds of complaints on high-value orders.",
    html: `
      <a
        href="https://www.amazon.com/s?k=insulated+delivery+bag"
        target="_blank"
        rel="noopener noreferrer sponsored"
        class="block"
      >
        <div style="display:flex;gap:1rem;align-items:center;flex-wrap:wrap;">
          <div style="width:84px;height:84px;border-radius:0.75rem;background:#dcfce7;display:flex;align-items:center;justify-content:center;font-size:2rem;">🥡</div>
          <div style="flex:1;min-width:200px;">
            <p style="margin:0 0 0.35rem;font-size:0.75rem;letter-spacing:0.08em;text-transform:uppercase;color:#0f766e;">Amazon Tool</p>
            <h3 style="margin:0 0 0.45rem;font-size:1.1rem;color:#0f172a;">Insulated Delivery Bag</h3>
            <p style="margin:0;color:#475569;line-height:1.6;">A must-have for couriers who want cleaner handoffs and better order quality.</p>
          </div>
        </div>
      </a>
    `,
  },
  {
    name: "Seat Organizer",
    description:
      "Loose chargers, receipts, snacks, and cleaning supplies can make your car feel chaotic. A simple organizer cuts down clutter so you can find what you need quickly and keep the cabin looking professional.",
    html: `
      <a
        href="https://www.amazon.com/s?k=car+seat+organizer"
        target="_blank"
        rel="noopener noreferrer sponsored"
        class="block"
      >
        <div style="display:flex;gap:1rem;align-items:center;flex-wrap:wrap;">
          <div style="width:84px;height:84px;border-radius:0.75rem;background:#e0f2fe;display:flex;align-items:center;justify-content:center;font-size:2rem;">🗂️</div>
          <div style="flex:1;min-width:200px;">
            <p style="margin:0 0 0.35rem;font-size:0.75rem;letter-spacing:0.08em;text-transform:uppercase;color:#0f766e;">Amazon Tool</p>
            <h3 style="margin:0 0 0.45rem;font-size:1.1rem;color:#0f172a;">Car Seat Organizer</h3>
            <p style="margin:0;color:#475569;line-height:1.6;">Better organization saves seconds all shift long and helps your workspace stay under control.</p>
          </div>
        </div>
      </a>
    `,
  },
  {
    name: "Dash Cam",
    description:
      "A dash cam adds an extra layer of protection when you're spending hours on the road. It can help document incidents, reduce stress after close calls, and give drivers more confidence while working.",
    html: `
      <a
        href="https://www.amazon.com/s?k=dash+cam+for+car"
        target="_blank"
        rel="noopener noreferrer sponsored"
        class="block"
      >
        <div style="display:flex;gap:1rem;align-items:center;flex-wrap:wrap;">
          <div style="width:84px;height:84px;border-radius:0.75rem;background:#ede9fe;display:flex;align-items:center;justify-content:center;font-size:2rem;">📷</div>
          <div style="flex:1;min-width:200px;">
            <p style="margin:0 0 0.35rem;font-size:0.75rem;letter-spacing:0.08em;text-transform:uppercase;color:#0f766e;">Amazon Tool</p>
            <h3 style="margin:0 0 0.45rem;font-size:1.1rem;color:#0f172a;">Compact Dash Cam</h3>
            <p style="margin:0;color:#475569;line-height:1.6;">A practical safeguard for drivers who treat gig work like a real business.</p>
          </div>
        </div>
      </a>
    `,
  },
  {
    name: "Car Cleaning Kit",
    description:
      "Cleanliness affects rider comfort, tips, and your own energy level. Keeping wipes, microfiber towels, and basic interior cleaners nearby makes it easier to reset the car between trips without losing momentum.",
    html: `
      <a
        href="https://www.amazon.com/s?k=car+cleaning+kit+interior"
        target="_blank"
        rel="noopener noreferrer sponsored"
        class="block"
      >
        <div style="display:flex;gap:1rem;align-items:center;flex-wrap:wrap;">
          <div style="width:84px;height:84px;border-radius:0.75rem;background:#fee2e2;display:flex;align-items:center;justify-content:center;font-size:2rem;">🧼</div>
          <div style="flex:1;min-width:200px;">
            <p style="margin:0 0 0.35rem;font-size:0.75rem;letter-spacing:0.08em;text-transform:uppercase;color:#0f766e;">Amazon Tool</p>
            <h3 style="margin:0 0 0.45rem;font-size:1.1rem;color:#0f172a;">Car Cleaning Kit</h3>
            <p style="margin:0;color:#475569;line-height:1.6;">Small maintenance habits can make a big difference in ratings and customer perception.</p>
          </div>
        </div>
      </a>
    `,
  },
];

export default function ToolsForGigWorkersPage() {
  return (
    <div className="min-h-screen py-12 sm:py-16">
      <main className="mx-auto max-w-4xl px-6">
        <article className="rounded-3xl border border-white/50 bg-white/90 p-6 shadow-2xl sm:p-10">
          <header className="mb-12 border-b border-slate-200 pb-10">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-teal-700">
              Gig Worker Essentials
            </p>
            <h1 className="max-w-3xl text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">
              7 Must-Have Tools Every Gig Worker Needs to Maximize Earnings (2026)
            </h1>
          </header>

          <section className="mb-12">
            <h2 className="mb-4 text-2xl font-semibold text-slate-900">
              Hook Intro
            </h2>
            <p className="text-base leading-8 text-slate-700">
              Most gig workers focus on the app, the schedule, and the orders in front of them. The higher earners
              usually think one level deeper. They build systems around the work. The right tools reduce friction,
              protect your time, and help you operate more consistently across long shifts.
            </p>
          </section>

          <section className="mb-14">
            <h2 className="mb-4 text-2xl font-semibold text-slate-900">
              Credibility Statement
            </h2>
            <p className="text-base leading-8 text-slate-700">
              This guide is built for real-world gig work, not theory. It focuses on practical gear that helps drivers
              stay organized, protect their vehicle, and keep earnings from leaking away through avoidable mistakes and
              downtime.
            </p>
          </section>

          <div className="space-y-14">
            {products.map((product, index) => (
              <section key={product.name} className="scroll-mt-24">
                <h2 className="mb-4 text-2xl font-semibold text-slate-900">
                  {index + 1}. {product.name}
                </h2>
                <p className="mb-6 text-base leading-8 text-slate-700">
                  {product.description}
                </p>
                <AmazonProductCard html={product.html} />
              </section>
            ))}
          </div>

          <section className="mt-16 border-t border-slate-200 pt-10">
            <h2 className="mb-4 text-2xl font-semibold text-slate-900">
              Closing Section
            </h2>
            <p className="text-base leading-8 text-slate-700">
              None of these tools are magic on their own. What they do well is remove small operational problems that
              chip away at your day. When your car is cleaner, your phone stays charged, your orders stay organized,
              and your workflow feels smoother, it becomes easier to earn with less stress.
            </p>
          </section>

          <section className="mt-12 rounded-2xl bg-slate-50 p-5 sm:p-6">
            <h2 className="mb-3 text-lg font-semibold text-slate-900">
              Affiliate Disclaimer
            </h2>
            <p className="text-sm leading-7 text-slate-600">
              Some links on this page may be affiliate links. If you buy through them, GigWorldToday may earn a small
              commission at no extra cost to you. That support helps keep the site running and allows us to keep
              publishing practical resources for gig workers.
            </p>
          </section>
        </article>
      </main>
    </div>
  );
}
