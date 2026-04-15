import { flaskServerJson } from "@/lib/flask-server";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { CategoriesStrip } from "@/components/home/CategoriesStrip";
import { FlashDeals } from "@/components/home/FlashDeals";
import { PromoBanner } from "@/components/home/PromoBanner";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { WhyShopWithUs } from "@/components/home/WhyShopWithUs";
import { TabbedProducts } from "@/components/home/TabbedProducts";
import { NewsletterBanner } from "@/components/home/NewsletterBanner";
import { TrustBar } from "@/components/home/TrustBar";

type ApiProduct = {
    id: number;
    name: string;
    image: string;
    price: number;
    discount: number;
    final_price: number;
    brand: string;
    category: string;
    stock: number;
};
type ProductsResponse = { products: ApiProduct[] };
type CategoryNode = {
    id: number;
    name: string;
    icon: string | null;
    image: string | null;
    children?: CategoryNode[];
};
type CategoryTreeResponse = { tree: CategoryNode[] };
type BannerSlide = {
    id: number;
    image_url: string;
    title: string;
    subtitle: string;
    description: string;
    link_url: string;
};
type BannersResponse = { banners: BannerSlide[] };
type FlashDeal = {
    id: number;
    product_id: number;
    name: string;
    image: string;
    deal_price: number;
    original_price: number;
    discount_percent: number;
    percent_claimed: number;
    stock_total: number;
    stock_sold: number;
    ends_at: string | null;
};
type FlashDealsResponse = { deals: FlashDeal[] };
type WhyShopItemData = { id: number; title: string; description: string; icon: string };
type WhyShopResponse = { items: WhyShopItemData[] };
type TrustBadgeData = { id: number; name: string; image_url: string };
type TrustBadgesResponse = { badges: TrustBadgeData[] };
type PromoBannerData = {
    id: number;
    title: string;
    subtitle: string;
    image_url: string;
    cta_text: string;
    cta_link: string;
    background_color: string | null;
    position: string;
};
type PromoBannersResponse = { banners: PromoBannerData[] };
type NewsletterConfigData = { title: string; subtitle: string; button_text: string; background_image: string | null };
type NewsletterConfigResponse = { config: NewsletterConfigData | null };

function flattenCategories(tree: CategoryNode[]): CategoryNode[] {
    const result: CategoryNode[] = [];
    const visit = (node: CategoryNode) => {
        result.push(node);
        (node.children || []).forEach(visit);
    };
    tree.forEach(visit);
    return result;
}

export default async function ShopHomePage() {
    const [
        productsData,
        categoryTree,
        bannersData,
        flashDealsData,
        whyShopData,
        trustBadgesData,
        promoBannersData,
        newsletterData,
    ] = await Promise.all([
        flaskServerJson<ProductsResponse>("/api/shop/products?per_page=12&sort=default", { next: { revalidate: 60 } } as RequestInit),
        flaskServerJson<CategoryTreeResponse>("/api/categories/tree", { next: { revalidate: 300 } } as RequestInit),
        flaskServerJson<BannersResponse>("/api/frontend/banners", { next: { revalidate: 120 } } as RequestInit),
        flaskServerJson<FlashDealsResponse>("/api/frontend/flash-deals", { next: { revalidate: 30 } } as RequestInit),
        flaskServerJson<WhyShopResponse>("/api/frontend/why-shop", { next: { revalidate: 600 } } as RequestInit),
        flaskServerJson<TrustBadgesResponse>("/api/frontend/trust-badges", { next: { revalidate: 600 } } as RequestInit),
        flaskServerJson<PromoBannersResponse>("/api/frontend/promo-banners", { next: { revalidate: 300 } } as RequestInit),
        flaskServerJson<NewsletterConfigResponse>("/api/frontend/newsletter-config", { next: { revalidate: 600 } } as RequestInit),
    ]);

    const allProducts = productsData?.products || [];
    const categories = flattenCategories(categoryTree?.tree || []).slice(0, 12);
    const banners = bannersData?.banners || [];
    const flashDeals = flashDealsData?.deals || [];
    const whyShopItems = whyShopData?.items || [];
    const trustBadges = trustBadgesData?.badges || [];
    const promoBanners = promoBannersData?.banners || [];
    const newsletterConfig = newsletterData?.config || null;

    const midPageBanner = promoBanners.find((b) => b.position === "mid_page") || promoBanners[0] || null;

    return (
        <main className="hp-main" dir="rtl">
            {/* 1. Hero Carousel */}
            <section className="hp-hero-section">
                <div className="container-fluid px-3 px-lg-4">
                    <HeroCarousel banners={banners} />
                </div>
            </section>

            {/* 2. Categories Strip */}
            <CategoriesStrip categories={categories} />

            {/* 3. Flash Deals */}
            {flashDeals.length > 0 && <FlashDeals deals={flashDeals} />}

            {/* 4. Mid-page Promo Banner */}
            {midPageBanner && <PromoBanner banner={midPageBanner} />}

            {/* 5. Featured Products */}
            <FeaturedProducts products={allProducts.slice(0, 8)} />

            {/* 6. Why Shop With Us */}
            <WhyShopWithUs items={whyShopItems} />

            {/* 7. Tabbed Products */}
            {allProducts.length > 0 && <TabbedProducts products={allProducts} />}

            {/* 8. Newsletter */}
            <NewsletterBanner config={newsletterConfig} />

            {/* 9. Trust Bar */}
            <TrustBar badges={trustBadges} />
        </main>
    );
}
