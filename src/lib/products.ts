export type ProductRecord = {
  id: string;
  name: string;
  slug: string;
  short_description: string;
  long_description: string;
  price: string;
  image: string;
  images: string[];
  featured: boolean;
  external_link: string;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: {
    short: string;
    long: string;
  };
  price: string;
  image: string;
  images?: string[];
  featured: boolean;
  externalLink: string;
};

export const products: Product[] = [
  {
    id: "gwt-driver-kit",
    name: "Gig Driver Starter Kit",
    slug: "gig-driver-starter-kit",
    description: {
      short: "Essential safety and efficiency gear for first-time gig drivers.",
      long: "The Gig Driver Starter Kit bundles the daily essentials every new driver needs: insulated delivery tote, reflective safety vest, and weather-ready phone mount. Built to keep your workflow smooth from the first order to the last drop-off, this kit helps you protect your ratings while staying organized during busy shifts.",
    },
    price: "$79",
      image: "/city-background.jpg",
      images: ["/city-background.jpg"],
    featured: true,
    externalLink: "https://example.com/products/gig-driver-starter-kit",
  },
  {
    id: "gwt-thermal-pro",
    name: "Thermal Pro Delivery Bag",
    slug: "thermal-pro-delivery-bag",
    description: {
      short: "High-capacity thermal bag designed to keep food hot and secure.",
      long: "Designed for stacked orders and long routes, the Thermal Pro Delivery Bag features reinforced zippers, insulated walls, and a leak-resistant base. The lightweight frame and padded shoulder strap make it comfortable for apartment runs, while the wide top opening speeds up pickup and handoff.",
    },
    price: "$54",
    image: "/city-background.jpg",
    images: ["/city-background.jpg"],
    featured: true,
    externalLink: "https://example.com/products/thermal-pro-delivery-bag",
  },
  {
    id: "gwt-dash-cam-lite",
    name: "DashCam Lite",
    slug: "dashcam-lite",
    description: {
      short: "Compact recording setup for safer, documented rides and deliveries.",
      long: "DashCam Lite offers continuous 1080p recording with loop storage and simple windshield mounting. Whether you run rideshare late nights or high-volume delivery days, this camera provides confidence and clear documentation for incidents, disputes, and insurance events.",
    },
    price: "$129",
    image: "/city-background.jpg",
    images: ["/city-background.jpg"],
    featured: true,
    externalLink: "https://example.com/products/dashcam-lite",
  },
  {
    id: "gwt-phone-mount-plus",
    name: "Phone Mount Plus",
    slug: "phone-mount-plus",
    description: {
      short: "Stable vent and dash mounting for map-heavy gig routes.",
      long: "Phone Mount Plus is engineered for frequent stops, sharp turns, and long city blocks. Its quick-lock clamp and 360° rotation let you keep navigation visible without blocking airflow or controls, reducing distractions while staying app-ready.",
    },
    price: "$24",
    image: "/city-background.jpg",
    images: ["/city-background.jpg"],
    featured: false,
    externalLink: "https://example.com/products/phone-mount-plus",
  },
  {
    id: "gwt-power-bank-max",
    name: "Power Bank Max",
    slug: "power-bank-max",
    description: {
      short: "Fast-charging battery backup for long shifts without downtime.",
      long: "Power Bank Max delivers all-day charging support for phones, hotspot devices, and lightweight accessories. With dual USB-C output and compact construction, it fits cleanly into your center console and keeps your apps active during peak earning windows.",
    },
    price: "$39",
    image: "/city-background.jpg",
    images: ["/city-background.jpg"],
    featured: false,
    externalLink: "https://example.com/products/power-bank-max",
  },
  {
    id: "gwt-seat-organizer",
    name: "Backseat Organizer Pro",
    slug: "backseat-organizer-pro",
    description: {
      short: "Keep receipts, sanitizers, chargers, and tools sorted in one place.",
      long: "Backseat Organizer Pro helps you maintain a professional in-car setup with dedicated compartments for delivery supplies and cleaning essentials. The rigid shell and secure straps prevent spills and shifting, so you can move quickly between orders without losing track of what you need.",
    },
    price: "$34",
    image: "/city-background.jpg",
    images: ["/city-background.jpg"],
    featured: false,
    externalLink: "https://example.com/products/backseat-organizer-pro",
  },
];

export const featuredProducts = products.filter((product) => product.featured);

export const getProductBySlug = (slug: string) =>
  products.find((product) => product.slug === slug);
