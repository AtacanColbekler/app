import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, Package, Tag, Barcode, Clock, Phone, Mail, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function ProductDetailPage() {
  const { model } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
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

  // Format price in TRY
  const formatPrice = (value) => {
    if (!value) return null;
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 2
    }).format(value);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "Bilinmiyor";
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
  const formattedPrice = formatPrice(product.price_value);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back button */}
        <Link to="/" className="inline-flex items-center gap-2 text-slate-600 hover:text-[#1a1a6c] mb-8 transition-colors" data-testid="back-link">
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
                    e.target.style.display = 'none';
                    e.target.nextElementSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div className={`${product.image_url ? 'hidden' : 'flex'} absolute inset-0 items-center justify-center bg-slate-100 rounded-xl`}>
                <Package className="w-24 h-24 text-slate-300" />
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Category */}
            {product.category && (
              <Link to={`/kategori/${encodeURIComponent(product.category)}`}>
                <Badge className="bg-[#1a1a6c] hover:bg-[#2a2a8c] text-white" data-testid="product-detail-category">
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
                <span>Model: <strong>{product.model}</strong></span>
              </div>
              {product.barcode && (
                <div className="flex items-center gap-2" data-testid="product-detail-barcode">
                  <Barcode className="w-4 h-4" />
                  <span>Barkod: <strong>{product.barcode}</strong></span>
                </div>
              )}
            </div>

            {/* Stock Status */}
            <div data-testid="product-detail-stock">
              <span className={`inline-block text-sm font-medium px-4 py-2 rounded-full ${stockStyle.class}`}>
                {stockStyle.text}
              </span>
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
                <p 
                  className="text-3xl font-semibold text-slate-700"
                  data-testid="product-detail-price-raw"
                >
                  {product.price_raw}
                </p>
              ) : (
                <p className="text-lg text-slate-400">Fiyat için iletişime geçin</p>
              )}
            </div>

            <Separator />

            {/* Contact Card */}
            <Card className="bg-slate-50 border-slate-200">
              <CardContent className="p-6">
                <h3 className="font-semibold text-slate-900 mb-4 font-outfit">Satın Almak İçin İletişime Geçin</h3>
                <div className="space-y-3">
                  <a 
                    href="tel:+905061395726" 
                    className="flex items-center gap-3 text-slate-700 hover:text-[#1a1a6c] transition-colors"
                    data-testid="contact-phone-1"
                  >
                    <div className="w-10 h-10 bg-[#1a1a6c] rounded-full flex items-center justify-center">
                      <Phone className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-medium">+90 506 139 57 26</span>
                  </a>
                  <a 
                    href="tel:+905411202626" 
                    className="flex items-center gap-3 text-slate-700 hover:text-[#1a1a6c] transition-colors"
                    data-testid="contact-phone-2"
                  >
                    <div className="w-10 h-10 bg-[#1a1a6c] rounded-full flex items-center justify-center">
                      <Phone className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-medium">+90 541 120 26 26</span>
                  </a>
                  <a 
                    href="mailto:destek@antalyabilgisayaralimsatim.com" 
                    className="flex items-center gap-3 text-slate-700 hover:text-[#1a1a6c] transition-colors"
                    data-testid="contact-email"
                  >
                    <div className="w-10 h-10 bg-[#1a1a6c] rounded-full flex items-center justify-center">
                      <Mail className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-medium text-sm">destek@antalyabilgisayaralimsatim.com</span>
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* Store Address */}
            <Card className="bg-white border-slate-200">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[#1a1a6c] mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-1">Mağaza Adresi</h4>
                    <p className="text-slate-600 text-sm">
                      Kışla Mahallesi Milli Egemenlik Caddesi No:8/C<br />
                      Muratpaşa / Antalya
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Last synced */}
            <div className="flex items-center gap-2 text-xs text-slate-400" data-testid="last-synced">
              <Clock className="w-3 h-3" />
              <span>Son güncelleme: {formatDate(product.last_synced)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
