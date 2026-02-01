import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Filter, Package } from "lucide-react";
import CategorySidebar from "@/components/CategorySidebar";
import ProductGrid from "@/components/ProductGrid";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function HomePage() {
  const { category } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = {};
        if (category) {
          params.category = decodeURIComponent(category);
        }
        
        const response = await axios.get(`${API}/products`, { params });
        setProducts(response.data);
      } catch (error) {
        console.error("Ürünler yüklenemedi:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category]);

  const decodedCategory = category ? decodeURIComponent(category) : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      {/* Hero Section */}
      <section className="hero-gradient text-white py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="max-w-2xl">
            <h1 
              className="text-4xl md:text-5xl lg:text-6xl font-bold font-outfit tracking-tight mb-4"
              data-testid="hero-title"
            >
              Teknolojinin Yeni Adresi
            </h1>
            <p 
              className="text-lg md:text-xl text-blue-100 leading-relaxed"
              data-testid="hero-subtitle"
            >
              En yeni bilgisayarlar, bileşenler ve aksesuarlar en uygun fiyatlarla. 
              Antalya'nın güvenilir teknoloji partneri.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-28">
              <CategorySidebar />
            </div>
          </aside>

          {/* Products Section */}
          <main className="flex-1 min-w-0">
            {/* Mobile filter button & Title */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 
                  className="text-2xl md:text-3xl font-bold text-slate-900 font-outfit"
                  data-testid="section-title"
                >
                  {decodedCategory || "Tüm Ürünler"}
                </h2>
                <p className="text-slate-500 mt-1" data-testid="product-count">
                  {loading ? "Yükleniyor..." : `${products.length} ürün bulundu`}
                </p>
              </div>

              {/* Mobile filter */}
              <Sheet open={mobileFilterOpen} onOpenChange={setMobileFilterOpen}>
                <SheetTrigger asChild className="lg:hidden">
                  <Button 
                    variant="outline" 
                    className="gap-2"
                    data-testid="mobile-filter-btn"
                  >
                    <Filter className="w-4 h-4" />
                    Filtrele
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 p-0">
                  <div className="p-4 bg-[#1a1a6c] text-white">
                    <h2 className="font-semibold font-outfit">Kategoriler</h2>
                  </div>
                  <div className="p-4">
                    <CategorySidebar onCategorySelect={() => setMobileFilterOpen(false)} />
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Info banner when no products */}
            {!loading && products.length === 0 && (
              <div 
                className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6"
                data-testid="info-banner"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Package className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-900 mb-1">n8n Entegrasyonu Bekleniyor</h3>
                    <p className="text-blue-700 text-sm">
                      Ürünler n8n workflow'u üzerinden senkronize edilecektir. 
                      Senkronizasyon tamamlandığında ürünler otomatik olarak burada görüntülenecektir.
                    </p>
                    <p className="text-blue-600 text-xs mt-2">
                      API Endpoint: <code className="bg-blue-100 px-2 py-0.5 rounded">POST /api/products/sync</code>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Product Grid */}
            <ProductGrid products={products} loading={loading} />
          </main>
        </div>
      </div>
    </div>
  );
}
