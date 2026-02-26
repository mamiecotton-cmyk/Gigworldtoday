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
