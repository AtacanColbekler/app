import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ChevronRight, Layers } from "lucide-react";
import axios from "axios";
import { ScrollArea } from "@/components/ui/scroll-area";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function CategorySidebar({ onCategorySelect }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const { category: activeCategory } = useParams();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${API}/categories`);
        setCategories(response.data);
      } catch (error) {
        console.error("Kategoriler yüklenemedi:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      // To show in DevTools: remove the "invisible" class
      <div className="invisible space-y-2">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-10 bg-slate-100 rounded-md skeleton" />
        ))}
      </div>
    );
  }

  return (
    // To show in DevTools: remove the "invisible" class
    <div className="invisible bg-white rounded-xl border border-slate-100 overflow-hidden">
      <div className="bg-[#1a1a6c] text-white px-4 py-3">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5" />
          <h2 className="font-semibold font-outfit" data-testid="categories-title">Kategoriler</h2>
        </div>
      </div>
      
      <ScrollArea className="h-[calc(100vh-300px)] min-h-[400px]">
        <nav className="p-2" data-testid="category-list">
          <Link
            to="/"
            className={`flex items-center justify-between py-2.5 px-3 rounded-md cursor-pointer transition-all duration-200 ${
              !activeCategory 
                ? "bg-[#1a1a6c] text-white" 
                : "hover:bg-slate-100 text-slate-700"
            }`}
            data-testid="category-all"
          >
            <span className="font-medium">Tüm Ürünler</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
          
          {categories.length === 0 ? (
            <div className="px-3 py-8 text-center text-slate-500">
              <p className="text-sm">Henüz kategori bulunmuyor</p>
              <p className="text-xs mt-1">Ürünler n8n ile senkronize edildiğinde kategoriler otomatik oluşturulacaktır.</p>
            </div>
          ) : (
            categories.map((category) => (
              <Link
                key={category}
                to={`/kategori/${encodeURIComponent(category)}`}
                className={`flex items-center justify-between py-2.5 px-3 rounded-md cursor-pointer transition-all duration-200 ${
                  activeCategory === category 
                    ? "bg-[#1a1a6c] text-white" 
                    : "hover:bg-slate-100 text-slate-700"
                }`}
                onClick={() => onCategorySelect && onCategorySelect(category)}
                data-testid={`category-${category}`}
              >
                <span className="font-medium text-sm">{category}</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            ))
          )}
        </nav>
      </ScrollArea>
    </div>
  );
}
