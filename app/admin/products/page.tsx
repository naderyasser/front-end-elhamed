"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatStoreImage } from "@/lib/store-utils";
import { SkeletonCard } from "@/components/ui/skeleton-card";

interface Product {
  id: number; name: string; price: number; discount: number; stock: number;
  category_name: string; image: string; created_at: string; views: number; sales: number;
}

export default function AdminProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const PER_PAGE = 20;

  const fetchProducts = (p: number) => {
    setLoading(true);
    fetch(`/api/flask/admin/api/products?page=${p}&per_page=${PER_PAGE}`, {
      credentials: 'include',
    })
      .then(r => r.json())
      .then((data) => {
        setProducts(data.products || []);
        setTotalPages(data.pages || 1);
        setTotal(data.total || 0);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchProducts(page); }, [page]);

  async function handleDelete(id: number) {
    if (!confirm("هل أنت متأكد من حذف هذا المنتج؟")) return;
    try {
      const res = await fetch(`/api/flask/admin/products/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        fetchProducts(page);
      } else {
        alert("فشل حذف المنتج");
      }
    } catch {
      alert("حدث خطأ أثناء حذف المنتج");
    }
  }

  function handleOpenAddProductModal() {
    // Dispatch custom event to open the shared Add Product modal from the layout
    window.dispatchEvent(new CustomEvent('open-add-product-modal'));
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="admin-page-title"><i className="bx bx-box" /> المنتجات <span style={{ fontSize: "0.75em", color: "#999", fontWeight: 400 }}>({total})</span></h1>
        <button onClick={handleOpenAddProductModal} className="btn-cta-alha">
          <i className="bx bx-plus" /> إضافة منتج
        </button>
      </div>

      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
          {products.map(p => (
            <div key={p.id} className="admin-card">
              {p.image && (
                <div style={{ height: 180, borderRadius: "12px 12px 0 0", overflow: "hidden" }}>
                  <img
                    src={formatStoreImage(p.image)}
                    alt={p.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    onError={(e) => {
                      e.currentTarget.src = '/static/images/placeholder-product.svg';
                    }}
                  />
                </div>
              )}
              <div style={{ padding: 16 }}>
                <h3 style={{ fontSize: "1rem", fontWeight: 600, margin: "0 0 8px" }}>{p.name}</h3>
                <div style={{ fontSize: "0.85rem", color: "#666", marginBottom: 12 }}>
                  <span>{p.category_name}</span> · <span>{p.price} ريال</span>
                </div>
                <div style={{ display: "flex", gap: 8, fontSize: "0.8rem", color: "#999", marginBottom: 12 }}>
                  <span><i className="bx bx-show" /> {p.views}</span>
                  <span><i className="bx bx-shopping-bag" /> {p.sales}</span>
                  <span><i className="bx bx-package" /> {p.stock}</span>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <Link href={`/admin/products/${p.id}/edit`} className="btn-outline-alha" style={{ flex: 1, textAlign: "center" }}>
                    <i className="bx bx-edit" /> تعديل
                  </Link>
                  <button onClick={() => handleDelete(p.id)} className="btn-outline-alha" style={{ flex: 1, textAlign: "center" }}>
                    <i className="bx bx-trash" /> حذف
                  </button>
                </div>
              </div>
            </div>
          ))}
          {products.length === 0 && (
            <div className="admin-card text-center" style={{ padding: 40, color: "#aaa", gridColumn: "1 / -1" }}>
              <i className="bx bx-box" style={{ fontSize: 48, display: "block", marginBottom: 12 }} />
              لا يوجد منتجات بعد
            </div>
          )}
        </div>
      )}

      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8, marginTop: 32 }}>
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="btn-outline-alha"
            style={{ opacity: page === 1 ? 0.4 : 1 }}
          >
            <i className="bx bx-chevron-right" />
          </button>
          <span style={{ fontSize: "0.9rem", color: "#666" }}>
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="btn-outline-alha"
            style={{ opacity: page === totalPages ? 0.4 : 1 }}
          >
            <i className="bx bx-chevron-left" />
          </button>
        </div>
      )}

    </div>
  );
}