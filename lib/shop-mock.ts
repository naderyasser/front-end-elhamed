// ──────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────

export type ShopProduct = {
  id: number;
  name: string;
  category: string;
  brand: string;
  price: number;
  discount: number; // percentage 0–100
  inStock: boolean;
  rating: number; // 0–5
  reviews: number;
  image: string;
  description: string;
};

// ──────────────────────────────────────────────────────────────
// Categories & Brands
// ──────────────────────────────────────────────────────────────

export const shopCategories = [
  "العناية بالبشرة",
  "العناية بالشعر",
  "المكياج",
  "العطور",
  "العناية بالجسم",
  "منتجات الرجال",
  "منتجات الأطفال",
  "عروض وتخفيضات",
];

export const shopBrands = [
  "Alhamd",
  "Neutrogena",
  "L'Oreal",
  "Garnier",
  "Nivea",
  "Maybelline",
  "The Ordinary",
];

// ──────────────────────────────────────────────────────────────
// Products
// ──────────────────────────────────────────────────────────────

export const shopProducts: ShopProduct[] = [
  {
    id: 1,
    name: "سيروم الورد المركّز",
    category: "العناية بالبشرة",
    brand: "Alhamd",
    price: 450,
    discount: 15,
    inStock: true,
    rating: 4.8,
    reviews: 214,
    image: "/static/images/placeholder-product.svg",
    description: "سيروم مركّز بخلاصة الورد يمنح البشرة الإشراق والنضارة.",
  },
  {
    id: 2,
    name: "كريم الترطيب اليومي",
    category: "العناية بالبشرة",
    brand: "Neutrogena",
    price: 280,
    discount: 0,
    inStock: true,
    rating: 4.5,
    reviews: 138,
    image: "/static/images/placeholder-product.svg",
    description: "كريم ترطيب خفيف الملمس مناسب للاستخدام اليومي لجميع أنواع البشرة.",
  },
  {
    id: 3,
    name: "شامبو مقوّي بالكيراتين",
    category: "العناية بالشعر",
    brand: "L'Oreal",
    price: 320,
    discount: 10,
    inStock: true,
    rating: 4.6,
    reviews: 97,
    image: "/static/images/placeholder-product.svg",
    description: "شامبو معزز بالكيراتين يقوّي الشعر ويمنحه لمعاناً استثنائياً.",
  },
  {
    id: 4,
    name: "أحمر شفاه مات طويل الأمد",
    category: "المكياج",
    brand: "Maybelline",
    price: 180,
    discount: 20,
    inStock: true,
    rating: 4.4,
    reviews: 321,
    image: "/static/images/placeholder-product.svg",
    description: "أحمر شفاه بتركيبة مات تدوم طوال اليوم بدون جفاف.",
  },
  {
    id: 5,
    name: "عطر الأوركيد الفاخر",
    category: "العطور",
    brand: "Alhamd",
    price: 950,
    discount: 0,
    inStock: true,
    rating: 4.9,
    reviews: 88,
    image: "/static/images/placeholder-product.svg",
    description: "عطر فاخر بنفحات الأوركيد والمسك يدوم أكثر من 12 ساعة.",
  },
  {
    id: 6,
    name: "لوشن الجسم المرطب بالشيا",
    category: "العناية بالجسم",
    brand: "Nivea",
    price: 220,
    discount: 5,
    inStock: false,
    rating: 4.3,
    reviews: 175,
    image: "/static/images/placeholder-product.svg",
    description: "لوشن غني بزبدة الشيا يغذّي البشرة ويمنحها نعومة مستدامة.",
  },
  {
    id: 7,
    name: "واقي شمس SPF 50",
    category: "العناية بالبشرة",
    brand: "Garnier",
    price: 350,
    discount: 0,
    inStock: true,
    rating: 4.7,
    reviews: 260,
    image: "/static/images/placeholder-product.svg",
    description: "واقٍ شمسي خفيف بحماية عالية SPF50 يصلح للبشرة الدهنية.",
  },
  {
    id: 8,
    name: "سيروم فيتامين C",
    category: "العناية بالبشرة",
    brand: "The Ordinary",
    price: 390,
    discount: 10,
    inStock: true,
    rating: 4.6,
    reviews: 402,
    image: "/static/images/placeholder-product.svg",
    description: "سيروم فيتامين C بتركيز 10% لتوحيد لون البشرة وتفتيح البقع.",
  },
  {
    id: 9,
    name: "بلسم الشعر بزيت الأرغان",
    category: "العناية بالشعر",
    brand: "Alhamd",
    price: 270,
    discount: 0,
    inStock: true,
    rating: 4.5,
    reviews: 119,
    image: "/static/images/placeholder-product.svg",
    description: "بلسم مغذٍّ بزيت الأرغان المغربي الأصيل يرطّب الشعر ويلينه.",
  },
  {
    id: 10,
    name: "كريم الرجال المرطّب",
    category: "منتجات الرجال",
    brand: "Nivea",
    price: 190,
    discount: 0,
    inStock: true,
    rating: 4.2,
    reviews: 63,
    image: "/static/images/placeholder-product.svg",
    description: "كريم ترطيب مخصص للرجال يمتص بسرعة دون دهونة.",
  },
];

// ──────────────────────────────────────────────────────────────
// Utilities
// ──────────────────────────────────────────────────────────────

/** Returns the final price after applying a percentage discount. */
export function applyDiscount(price: number, discount: number): number {
  return Math.round(price * (1 - discount / 100));
}

/** Returns a product by its numeric id, or undefined if not found. */
export function getProductById(id: number): ShopProduct | undefined {
  return shopProducts.find((p) => p.id === id);
}

/** Returns true if the product name or description includes the search query (case-insensitive). */
export function productMatchesQuery(product: ShopProduct, query: string): boolean {
  if (!query) return true;
  const q = query.toLowerCase();
  return product.name.toLowerCase().includes(q) || product.description.toLowerCase().includes(q);
}
