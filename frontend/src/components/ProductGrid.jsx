import ProductCard from "./ProductCard";
import { Package } from "lucide-react";

export default function ProductGrid({ products, loading }) {
  if (loading) {
    return (
      <div 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        data-testid="product-grid-loading"
      >
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-100 overflow-hidden">
            <div className="aspect-square bg-slate-100 skeleton" />
            <div className="p-4 space-y-3">
              <div className="h-12 bg-slate-100 rounded skeleton" />
              <div className="h-4 w-24 bg-slate-100 rounded skeleton" />
              <div className="h-6 w-20 bg-slate-100 rounded-full skeleton" />
              <div className="h-8 w-28 bg-slate-100 rounded skeleton" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div 
        className="flex flex-col items-center justify-center py-16 px-4 bg-slate-50 rounded-xl"
        data-testid="product-grid-empty"
      >
        <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mb-4">
          <Package className="w-10 h-10 text-slate-400" />
        </div>
        <h3 className="text-xl font-semibold text-slate-700 mb-2 font-outfit">Ürün Bulunamadı</h3>
        <p className="text-slate-500 text-center max-w-md">
          Bu kategoride henüz ürün bulunmuyor. Ürünler n8n üzerinden senkronize edildiğinde 
          burada görüntülenecektir.
        </p>
      </div>
    );
  }

  return (
    <div 
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      data-testid="product-grid"
    >
      {products.map((product) => (
        <ProductCard key={product.model} product={product} />
      ))}
    </div>
  );
}
