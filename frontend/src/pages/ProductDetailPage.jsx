import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, Package, Tag, Barcode, Clock, Phone, Mail, MapPin, ShoppingCart, Plus, Minus, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// ── Cart helpers (same localStorage key as OrderPage) ─────────────────────────
function getCart() {
  try {
    const saved = localStorage.getItem("zenx_cart");
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem("zenx_cart", JSON.stringify(cart));
}

export default function ProductDetailPage() {
  const { model } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [qty, setQty] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`${API}/products/${encodeURIComponent(model)}`);
        setProduct(response.data);
      } catch (err) {
        console.error("Ürün yüklenemedi:", err);
        setError(err.response?.status === 404 ? "Ürün bulunamadı" : "Bir hata oluştu");
      } finally {
        setLoading(false);
      }
    };

    if (model) {
      fetchProduct();
    }
  }, [model]);

  // ── Add to cart ──────────────────────────────────────────────────────────────
  const handleAddToCart = () => {
    if (!product) return;

    const cart = getCart();
    const existing = cart.find((item) => item.model === product.model);

    if (existing) {
      existing.quantity += qty;
    } else {
      cart.push({
        model: product.model,
        name: product.name,
        price_try: product.price_try,
        image_url: product.image_url,
        stock_text: product.stock_text,
        quantity: qty,
      });
    }

    saveCart(cart);
    setAddedToCart(true);
    toast.success(`${product.name} sepete eklendi`, {
      action: {
        label: "Sepete Git",
        onClick: () => navigate("/siparis"),
      },
    });

    // Reset "added" indicator after 2s
    setTimeout(() => setAddedToCart(false), 2000);
  };

  // Format price in TRY
  const formatPrice = (value) => {
    if (!value) return null;
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      minimumFractionDigits: 0,
    }).format(value);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "Bilinmiyor";
    return new Date(dateString).toLocaleDateString("tr-TR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get stock styling
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

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 w-32 bg-slate-200 rounded mb-8" />
          <div className="grid md:grid-cols-2 gap-8">
            <div className="aspect-square bg-slate-200 rounded-xl" />
            <div className="space-y-4">
              <div className="h-10 bg-slate-200 rounded w-3/4" />
              <div className="h-6 bg-slate-200 rounded w-1/2" />
              <div className="h-8 bg-slate-200 rounded w-1/4" />
              <div className="h-12 bg-slate-200 rounded w-1/3" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center">
          <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-10 h-10 text-slate-400" />
          </div>
          <h1 className="text-2xl font-bold text-slate-700 mb-2 font-outfit">{error}</h1>
          <p className="text-slate-500 mb-6">Aradığınız ürün bulunamadı veya kaldırılmış olabilir.</p>
          <Link to="/">
            <Button className="bg-[#1a1a6c] hover:bg-[#2a2a8c]">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Ana Sayfaya Dön
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const stockStyle = getStockStyle(product.stock_text);
  const formattedPrice = formatPrice(product.price_try);
  const isOutOfStock =
    product.stock_text?.toLowerCase().includes("yok") ||
    product.stock_text?.toLowerCase().includes("tüken");

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back button */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-[#1a1a6c] mb-8 transition-colors"
          data-testid="back-link"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Ürünlere Dön</span>
        </Link>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Image */}
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden p-8">
            <div className="aspect-square relative">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-contain"
                  data-testid="product-detail-image"
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextElementSibling.style.display = "flex";
                  }}
                />
              ) : null}
              <div
                className={`${
                  product.image_url ? "hidden" : "flex"
                } absolute inset-0 items-center justify-center bg-slate-100 rounded-xl`}
              >
                <Package className="w-24 h-24 text-slate-300" />
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Category */}
            {product.category && (
              <Link to={`/kategori/${encodeURIComponent(product.category)}`}>
                <Badge
                  className="bg-[#1a1a6c] hover:bg-[#2a2a8c] text-white"
                  data-testid="product-detail-category"
                >
                  {product.category}
                </Badge>
              </Link>
            )}

            {/* Title */}
            <h1
              className="text-3xl md:text-4xl font-bold text-slate-900 font-outfit leading-tight"
              data-testid="product-detail-name"
            >
              {product.name}
            </h1>

            {/* Model & Barcode */}
            <div className="flex flex-wrap gap-4 text-sm text-slate-600">
              <div className="flex items-center gap-2" data-testid="product-detail-model">
                <Tag className="w-4 h-4" />
                <span>
                  Model: <strong>{product.model}</strong>
                </span>
              </div>
              {product.barcode && (
                <div className="flex items-center gap-2" data-testid="product-detail-barcode">
                  <Barcode className="w-4 h-4" />
                  <span>
                    Barkod: <strong>{product.barcode}</strong>
                  </span>
                </div>
              )}
            </div>

            {/* ── Stock + Add to Cart ─────────────────────────────────── */}
            <div className="flex flex-wrap items-center gap-3" data-testid="product-detail-stock">
              {/* Stock badge */}
              <span
                className={`inline-block text-sm font-medium px-4 py-2 rounded-full ${stockStyle.class}`}
              >
                {stockStyle.text}
              </span>

              {/* Qty controls */}
              <div className="flex items-center gap-1 border border-slate-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="w-9 h-9 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors"
                  aria-label="Azalt"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-10 text-center text-sm font-semibold text-slate-800">
                  {qty}
                </span>
                <button
                  onClick={() => setQty((q) => q + 1)}
                  className="w-9 h-9 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors"
                  aria-label="Artır"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Add to cart button */}
              <Button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`gap-2 font-semibold transition-all ${
                  addedToCart
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-orange-500 hover:bg-orange-600"
                } text-white disabled:opacity-50 disabled:cursor-not-allowed`}
                data-testid="add-to-cart-btn"
              >
                {addedToCart ? (
                  <>
                    <CheckCircle className="w-4 h-4" /> Eklendi!
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" /> Sepete Ekle
                  </>
                )}
              </Button>
            </div>

            {/* Price */}
            <div className="pt-4">
              {formattedPrice ? (
                <p
                  className="text-4xl font-bold text-[#1a1a6c]"
                  data-testid="product-detail-price"
                >
                  {formattedPrice}
                </p>
              ) : product.price_raw ? (
                <p className="text-2xl font-semibold text-slate-700" data-testid="product-detail-price">
                  {product.price_raw}
                </p>
              ) : (
                <p className="text-lg text-slate-500" data-testid="product-detail-price">
                  Fiyat için iletişime geçin
                </p>
              )}
            </div>

            {/* Go to cart shortcut */}
            <div>
              <button
                onClick={() => navigate("/siparis")}
                className="text-sm text-[#1a1a6c] hover:underline flex items-center gap-1"
              >
                <ShoppingCart className="w-3.5 h-3.5" /> Sepete git →
              </button>
            </div>

            <Separator />

            {/* Last updated */}
            {product.updated_at && (
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Clock className="w-3 h-3" />
                <span>Son güncelleme: {formatDate(product.updated_at)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Contact / description section below can remain as before */}
      </div>
    </div>
  );
}
