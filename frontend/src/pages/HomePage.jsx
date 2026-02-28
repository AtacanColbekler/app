import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Filter, Package, ArrowUpDown, CheckCircle } from "lucide-react";
import CategorySidebar from "@/components/CategorySidebar";
import ProductGrid from "@/components/ProductGrid";
import BannerSlider from "@/components/BannerSlider";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function HomePage() {
  const { category } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState("name");
  const [inStockOnly, setInStockOnly] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = { sort: sortOrder, in_stock: inStockOnly };
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
  }, [category, sortOrder, inStockOnly]);

  const decodedCategory = category ? decodeURIComponent(category) : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      {/* Banner Slider */}
      <BannerSlider />
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden w-64 flex-shrink-0">
            <div className="sticky top-28">
              <CategorySidebar />
            </div>
          </aside>

          {/* Products Section */}
          <main className="flex-1 min-w-0">
            {/* Mobile filter button & Title */}
            <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
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

              <div className="flex items-center gap-2 flex-wrap">
                {/* In stock filter */}
                <Button
                  variant={inStockOnly ? "default" : "outline"}
                  className={`gap-2 ${inStockOnly ? "bg-emerald-600 hover:bg-emerald-700" : ""}`}
                  onClick={() => setInStockOnly(!inStockOnly)}
                  data-testid="in-stock-btn"
                >
                  <CheckCircle className="w-4 h-4" />
                  {inStockOnly ? "Stokta Olanlar" : "Sadece Stokta"}
                </Button>

                {/* Sort button */}
                <Button
                  variant={sortOrder === "price_asc" ? "default" : "outline"}
                  className={`gap-2 ${sortOrder === "price_asc" ? "bg-[#1a1a6c] hover:bg-[#2a2a8c]" : ""}`}
                  onClick={() => setSortOrder(sortOrder === "price_asc" ? "name" : "price_asc")}
                  data-testid="sort-price-btn"
                >
                  <ArrowUpDown className="w-4 h-4" />
                  {sortOrder === "price_asc" ? "Fiyat: Düşükten Yükseğe" : "Fiyata Göre Sırala"}
                </Button>

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
