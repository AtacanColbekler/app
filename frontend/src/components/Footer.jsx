import { MapPin, Phone, Mail, Clock } from "lucide-react";

const LOGO_URL = "https://customer-assets.emergentagent.com/job_f28429eb-ca57-4b6c-8a6e-98f8289c0126/artifacts/hgjiqrqk_logo.png";

export default function Footer() {
  return (
    <footer className="bg-[#0F172A] text-slate-300">
      <div className="max-w-7xl mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <img 
              src={LOGO_URL} 
              alt="zenXteknoloji" 
              className="h-12 object-contain"
              data-testid="footer-logo"
            />
            <p className="text-sm leading-relaxed">
              Antalya'nın güvenilir teknoloji adresi. En yeni bilgisayarlar, 
              bileşenler ve aksesuarlar uygun fiyatlarla.
            </p>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold text-lg font-outfit">İletişim</h3>
            <ul className="space-y-3">
              <li>
                <a 
                  href="tel:+905061395726" 
                  className="flex items-start gap-3 hover:text-white transition-colors"
                  data-testid="footer-phone-1"
                >
                  <Phone className="w-4 h-4 mt-1 flex-shrink-0" />
                  <span>+90 506 139 57 26</span>
                </a>
              </li>
              <li>
                <a 
                  href="tel:+905411202626" 
                  className="flex items-start gap-3 hover:text-white transition-colors"
                  data-testid="footer-phone-2"
                >
                  <Phone className="w-4 h-4 mt-1 flex-shrink-0" />
                  <span>+90 541 120 26 26</span>
                </a>
              </li>
              <li>
                <a 
                  href="tel:+905396981753" 
                  className="flex items-start gap-3 hover:text-white transition-colors"
                  data-testid="footer-phone-3"
                >
                  <Phone className="w-4 h-4 mt-1 flex-shrink-0" />
                  <span>+90 539 698 17 53</span>
                </a>
              </li>
              <li>
                <a 
                  href="mailto:destek@antalyabilgisayaralimsatim.com" 
                  className="flex items-start gap-3 hover:text-white transition-colors"
                  data-testid="footer-email"
                >
                  <Mail className="w-4 h-4 mt-1 flex-shrink-0" />
                  <span className="break-all">destek@antalyabilgisayaralimsatim.com</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Address */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold text-lg font-outfit">Adres</h3>
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
              <address className="not-italic text-sm leading-relaxed" data-testid="footer-address">
                Kışla Mahallesi<br />
                Milli Egemenlik Caddesi No:8/C<br />
                Muratpaşa / Antalya
              </address>
            </div>
            <a 
              href="https://maps.google.com/?q=Kışla+Mahallesi+Milli+Egemenlik+Caddesi+No:8/C+Muratpaşa+Antalya"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
              data-testid="footer-map-link"
            >
              <MapPin className="w-4 h-4" />
              Haritada Görüntüle
            </a>
          </div>

          {/* Business Hours */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold text-lg font-outfit">Çalışma Saatleri</h3>
            <div className="flex items-start gap-3">
              <Clock className="w-4 h-4 mt-1 flex-shrink-0" />
              <div className="text-sm space-y-1" data-testid="footer-hours">
                <p>Pazartesi - Cumartesi</p>
                <p className="text-white font-medium">09:00 - 19:00</p>
                <p className="text-slate-400 mt-2">Pazar: Kapalı</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-slate-700">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-400" data-testid="footer-copyright">
              © {new Date().getFullYear()} zenXteknoloji. Tüm hakları saklıdır.
            </p>
            <div className="flex items-center gap-6 text-sm">
              <span className="text-slate-500">
                Güvenle Alışveriş
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
