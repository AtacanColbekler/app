import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Each banner has:
//   src  — path to your jpeg (place files in public/banners/). null = black placeholder.
//   alt  — accessible description
//   link — the /ara?q=... route to navigate to when clicked
const BANNERS = [
  {
    id: 1,
    src: "https://www.sektoronline.com/images/bannerAna/blackview_pc.jpeg",
    alt: "Banner 1",
    link: "/ara-urun?q=BLACKVIEW%20MP",
  },
  {
    id: 2,
    src: "https://www.sektoronline.com/images/bannerAna/guvenlik.jpeg",
    alt: "Banner 2",
    link: "/ara?q=Hirsiz-Alarm-Sistemleri%20HirsizAlarmSistemleri",
  },
  {
    id: 3,
    src: "https://www.sektoronline.com/images/bannerAna/blackview.jpeg",
    alt: "Banner 3",
    link: "/ara-urun?q=BLACKVIEW%20TAB",
  },
  {
    id: 4,
    src: "https://www.sektoronline.com/images/bannerAna/jdkasa.jpeg",
    alt: "Banner 4",
    link: "/ara?q=Kasalar",
  },
  {
    id: 5,
    src: "https://www.sektoronline.com/images/bannerAna/ruijie.jpeg",
    alt: "Banner 5",
    link: "/ara-urun?q=RUIJIE",
  },
  {
    id: 6,
    src: "https://www.sektoronline.com/images/bannerAna/KOORIU.png",
    alt: "Banner 6",
    link: "/ara-urun?q=KOORUI",
  },
];

const INTERVAL_MS = 4000;

export default function BannerSlider() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + BANNERS.length) % BANNERS.length);
  }, []);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % BANNERS.length);
  }, []);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(next, INTERVAL_MS);
    return () => clearInterval(timer);
  }, [paused, next]);

  const handleArrowClick = (e, fn) => {
    e.preventDefault(); // prevent the banner Link from firing
    e.stopPropagation();
    fn();
  };

  return (
    <div
      className="relative w-full overflow-hidden bg-black select-none"
      style={{ aspectRatio: "16/5" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      data-testid="banner-slider"
    >
      {/* Slides */}
      <div
        className="flex h-full transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {BANNERS.map((banner) => (
          <Link
            key={banner.id}
            to={banner.link}
            className="relative flex-shrink-0 w-full h-full bg-black flex items-center justify-center cursor-pointer"
            aria-label={banner.alt}
            data-testid={`banner-slide-${banner.id}`}
            draggable={false}
          >
            {banner.src ? (
              <img
                src={banner.src}
                alt={banner.alt}
                className="w-full h-full object-cover"
                style={{ maxWidth: "64%" }}
                draggable={false}
              />
            ) : (
              /* Black placeholder — replace with real jpeg by setting src above */
              <div className="w-full h-full bg-black flex items-center justify-center">
                <span className="text-white/20 text-2xl font-outfit font-bold tracking-widest uppercase">
                  Banner {banner.id}
                </span>
              </div>
            )}
          </Link>
        ))}
      </div>

      {/* Prev arrow */}
      <button
        onClick={(e) => handleArrowClick(e, prev)}
        className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition-colors backdrop-blur-sm"
        aria-label="Önceki banner"
        data-testid="banner-prev"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {/* Next arrow */}
      <button
        onClick={(e) => handleArrowClick(e, next)}
        className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition-colors backdrop-blur-sm"
        aria-label="Sonraki banner"
        data-testid="banner-next"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5">
        {BANNERS.map((_, i) => (
          <button
            key={i}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCurrent(i); }}
            className={`rounded-full transition-all duration-300 ${
              i === current
                ? "w-6 h-2 bg-white"
                : "w-2 h-2 bg-white/40 hover:bg-white/70"
            }`}
            aria-label={`Banner ${i + 1}`}
            data-testid={`banner-dot-${i}`}
          />
        ))}
      </div>
    </div>
  );
}
