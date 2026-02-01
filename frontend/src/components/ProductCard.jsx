import { Link } from "react-router-dom";
import { Package, Tag } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ProductCard({ product }) {
  const { name, model, image_url, stock_text, price_value, price_raw, category } = product;

  // Determine stock status styling
  const getStockStyle = (stockText) => {
    if (!stockText) return { class: "bg-slate-100 text-slate-600", text: "Bilgi Yok" };
    
    const lowerText = stockText.toLowerCase();
    if (lowerText.includes("stok") && lowerText.includes("var")) {
      return { class: "bg-emerald-100 text-emerald-700", text: stockText };
    }
    if (lowerText.includes("stok") && (lowerText.includes("yok") || lowerText.includes("tüken"))) {
      return { class: "bg-red-100 text-red-700", text: stockText };
    }
    if (lowerText.includes("sınırlı") || lowerText.includes("az")) {
      return { class: "bg-amber-100 text-amber-700", text: stockText };
    }
    return { class: "bg-blue-100 text-blue-700", text: stockText };
  };

  const stockStyle = getStockStyle(stock_text);

  // Format price
  const formatPrice = (value) => {
    if (!value) return null;
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 2
    }).format(value);
  };

  const formattedPrice = formatPrice(price_value);

  return (
    <Link 
      to={`/urun/${encodeURIComponent(model)}`}
      data-testid={`product-card-${model}`}
    >
      <Card className="product-card group h-full bg-white rounded-xl border border-slate-100 overflow-hidden hover:shadow-2xl hover:shadow-blue-900/10 transition-all duration-300">
        {/* Image */}
        <div className="relative aspect-square bg-slate-50 overflow-hidden">
          {image_url ? (
            <img
              src={image_url}
              alt={name}
              className="product-image w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextElementSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div 
            className={`${image_url ? 'hidden' : 'flex'} absolute inset-0 items-center justify-center bg-slate-100`}
          >
            <Package className="w-16 h-16 text-slate-300" />
          </div>
          
          {/* Category badge */}
          {category && (
            <Badge 
              className="absolute top-3 left-3 bg-[#1a1a6c]/90 text-white text-xs"
              data-testid="product-category-badge"
            >
              {category}
            </Badge>
          )}
        </div>

        <CardContent className="p-4 space-y-3">
          {/* Product name */}
          <h3 
            className="font-semibold text-slate-900 line-clamp-2 min-h-[48px] group-hover:text-[#1a1a6c] transition-colors"
            title={name}
            data-testid="product-name"
          >
            {name}
          </h3>

          {/* Model */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Tag className="w-3 h-3" />
            <span data-testid="product-model">Model: {model}</span>
          </div>

          {/* Stock status */}
          <div data-testid="product-stock">
            <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full ${stockStyle.class}`}>
              {stockStyle.text}
            </span>
          </div>

          {/* Price */}
          <div className="pt-2 border-t border-slate-100">
            {formattedPrice ? (
              <p 
                className="text-xl font-bold text-[#1a1a6c]"
                data-testid="product-price"
              >
                {formattedPrice}
              </p>
            ) : price_raw ? (
              <p 
                className="text-lg font-semibold text-slate-700"
                data-testid="product-price-raw"
              >
                {price_raw}
              </p>
            ) : (
              <p className="text-sm text-slate-400">Fiyat bilgisi yok</p>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
