import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Menu, X, Phone, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const LOGO_URL = "https://customer-assets.emergentagent.com/job_f28429eb-ca57-4b6c-8a6e-98f8289c0126/artifacts/hgjiqrqk_logo.png";

export default function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/ara?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  return (
    <header className="sticky top-0 z-50">
      {/* Top bar - Contact Info */}
      <div className="bg-[#0F172A] text-white py-2 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between text-sm">
          <div className="flex items-center gap-4 flex-wrap">
            <a 
              href="tel:+905061395726" 
              className="flex items-center gap-1 hover:text-blue-300 transition-colors"
              data-testid="phone-link-1"
            >
              <Phone className="w-3 h-3" />
              <span className="hidden sm:inline">+90 506 139 57 26</span>
            </a>
            <a 
              href="tel:+905411202626" 
              className="flex items-center gap-1 hover:text-blue-300 transition-colors"
              data-testid="phone-link-2"
            >
              <Phone className="w-3 h-3" />
              <span className="hidden sm:inline">+90 541 120 26 26</span>
            </a>
          </div>
          <a 
            href="mailto:destek@antalyabilgisayaralimsatim.com" 
            className="flex items-center gap-1 hover:text-blue-300 transition-colors"
            data-testid="email-link"
          >
            <Mail className="w-3 h-3" />
            <span className="hidden md:inline">destek@antalyabilgisayaralimsatim.com</span>
            <span className="md:hidden">E-posta</span>
          </a>
        </div>
      </div>

      {/* Main header */}
      <div className="bg-[#1a1a6c] text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Mobile menu button */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-white hover:bg-white/10"
                  data-testid="mobile-menu-btn"
                >
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 bg-white p-0">
                <div className="p-4 bg-[#1a1a6c]">
                  <img 
                    src={LOGO_URL} 
                    alt="zenXteknoloji" 
                    className="h-10 object-contain"
                  />
                </div>
                <div className="p-4">
                  <form onSubmit={handleSearch} className="mb-4">
                    <div className="relative">
                      <Input
                        type="text"
                        placeholder="Ürün ara..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pr-10"
                        data-testid="mobile-search-input"
                      />
                      <button 
                        type="submit"
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#1a1a6c]"
                      >
                        <Search className="w-5 h-5" />
                      </button>
                    </div>
                  </form>
                  <nav className="space-y-2">
                    <Link 
                      to="/" 
                      className="block py-2 px-3 rounded-md hover:bg-slate-100 font-medium"
                      onClick={() => setMobileMenuOpen(false)}
                      data-testid="mobile-home-link"
                    >
                      Ana Sayfa
                    </Link>
                  </nav>
                  <div className="mt-6 pt-6 border-t">
                    <p className="text-sm text-slate-500 mb-2">İletişim</p>
                    <a href="tel:+905061395726" className="block text-sm py-1 text-slate-700">
                      +90 506 139 57 26
                    </a>
                    <a href="tel:+905411202626" className="block text-sm py-1 text-slate-700">
                      +90 541 120 26 26
                    </a>
                    <a href="tel:+905396981753" className="block text-sm py-1 text-slate-700">
                      +90 539 698 17 53
                    </a>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            {/* Logo */}
            <Link to="/" className="flex-shrink-0" data-testid="logo-link">
              <img 
                src={LOGO_URL} 
                alt="zenXteknoloji" 
                className="h-10 md:h-12 object-contain"
              />
            </Link>

            {/* Search bar - Desktop */}
            <form 
              onSubmit={handleSearch} 
              className="hidden md:flex flex-1 max-w-xl mx-4"
              data-testid="search-form"
            >
              <div className="relative w-full">
                <Input
                  type="text"
                  placeholder="Ürün ara... (model, isim veya barkod)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white text-slate-900 border-0 pr-12 h-11 rounded-md focus:ring-2 focus:ring-blue-300"
                  data-testid="search-input"
                />
                <button 
                  type="submit"
                  className="absolute right-0 top-0 h-full px-4 bg-[#2563EB] hover:bg-blue-600 text-white rounded-r-md transition-colors"
                  data-testid="search-btn"
                >
                  <Search className="w-5 h-5" />
                </button>
              </div>
            </form>

            {/* Contact quick link - Desktop */}
            <div className="hidden lg:flex items-center gap-2 text-sm">
              <Phone className="w-4 h-4" />
              <div>
                <p className="text-xs text-blue-200">Bizi Arayın</p>
                <a 
                  href="tel:+905061395726" 
                  className="font-semibold hover:text-blue-200 transition-colors"
                  data-testid="header-phone"
                >
                  +90 506 139 57 26
                </a>
              </div>
            </div>
          </div>

          {/* Mobile search */}
          <form 
            onSubmit={handleSearch} 
            className="md:hidden mt-4"
          >
            <div className="relative">
              <Input
                type="text"
                placeholder="Ürün ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white text-slate-900 border-0 pr-12 h-10 rounded-md"
                data-testid="mobile-search-input-header"
              />
              <button 
                type="submit"
                className="absolute right-0 top-0 h-full px-3 bg-[#2563EB] text-white rounded-r-md"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </header>
  );
}
