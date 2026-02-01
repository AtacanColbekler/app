import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductGrid from "@/components/ProductGrid";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function SearchResultsPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const searchProducts = async () => {
      if (!query.trim()) {
        setProducts([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const response = await axios.get(`${API}/products/search`, {
          params: { q: query }
        });
        setProducts(response.data);
      } catch (error) {
        console.error("Arama hatası:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    searchProducts();
  }, [query]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back button */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-slate-600 hover:text-[#1a1a6c] mb-8 transition-colors"
          data-testid="search-back-link"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Ana Sayfaya Dön</span>
        </Link>

        {/* Search header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-[#1a1a6c] rounded-full flex items-center justify-center">
              <Search className="w-5 h-5 text-white" />
            </div>
            <h1 
              className="text-2xl md:text-3xl font-bold text-slate-900 font-outfit"
              data-testid="search-title"
            >
              Arama Sonuçları
            </h1>
          </div>
          {query && (
            <p className="text-slate-600" data-testid="search-query-display">
              "<span className="font-medium text-[#1a1a6c]">{query}</span>" için {loading ? "aranıyor..." : `${products.length} sonuç bulundu`}
            </p>
          )}
        </div>

        {/* No query message */}
        {!query && (
          <div className="text-center py-16 bg-slate-50 rounded-xl">
            <Search className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-700 mb-2 font-outfit">Arama Yapın</h2>
            <p className="text-slate-500 mb-6">Ürün aramak için yukarıdaki arama kutusunu kullanın.</p>
            <Link to="/">
              <Button className="bg-[#1a1a6c] hover:bg-[#2a2a8c]">
                Tüm Ürünleri Görüntüle
              </Button>
            </Link>
          </div>
        )}

        {/* Results */}
        {query && (
          <>
            {!loading && products.length === 0 && (
              <div className="text-center py-16 bg-slate-50 rounded-xl" data-testid="no-results">
                <Search className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-slate-700 mb-2 font-outfit">Sonuç Bulunamadı</h2>
                <p className="text-slate-500 mb-6">
                  "{query}" araması için sonuç bulunamadı. Farklı anahtar kelimeler deneyin.
                </p>
                <Link to="/">
                  <Button className="bg-[#1a1a6c] hover:bg-[#2a2a8c]">
                    Tüm Ürünleri Görüntüle
                  </Button>
                </Link>
              </div>
            )}

            <ProductGrid products={products} loading={loading} />
          </>
        )}
      </div>
    </div>
  );
}
