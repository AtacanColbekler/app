import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ShoppingCart, Search, Plus, Trash2, ArrowLeft,
  CheckCircle, Mail, RefreshCw, AlertCircle, X,
  Package, CreditCard, User, MapPin, Phone, Lock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// ── Simple Math CAPTCHA ───────────────────────────────────────────────────────
function MathCaptcha({ onVerify }) {
  const [a, setA] = useState(() => Math.floor(Math.random() * 9) + 1);
  const [b, setB] = useState(() => Math.floor(Math.random() * 9) + 1);
  const [answer, setAnswer] = useState("");
  const [status, setStatus] = useState("idle"); // idle | ok | error

  const refresh = () => {
    setA(Math.floor(Math.random() * 9) + 1);
    setB(Math.floor(Math.random() * 9) + 1);
    setAnswer("");
    setStatus("idle");
    onVerify(false);
  };

  const check = () => {
    if (parseInt(answer, 10) === a + b) {
      setStatus("ok");
      onVerify(true);
    } else {
      setStatus("error");
      onVerify(false);
    }
  };

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <span className="text-sm font-medium text-slate-700">
        CAPTCHA: <strong>{a} + {b} = ?</strong>
      </span>
      <div className="flex items-center gap-2">
        <Input
          value={answer}
          onChange={(e) => { setAnswer(e.target.value); setStatus("idle"); onVerify(false); }}
          placeholder="Cevap"
          className={`w-20 h-9 text-center ${status === "ok" ? "border-green-500 bg-green-50" : status === "error" ? "border-red-500 bg-red-50" : ""}`}
          data-testid="captcha-input"
        />
        <Button type="button" size="sm" onClick={check} className="h-9 bg-slate-600 hover:bg-slate-700 text-white" data-testid="captcha-check-btn">
          Doğrula
        </Button>
        <button type="button" onClick={refresh} className="text-slate-400 hover:text-slate-600" title="Yenile">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
      {status === "ok" && <span className="text-green-600 text-sm flex items-center gap-1"><CheckCircle className="w-4 h-4" />Doğrulandı</span>}
      {status === "error" && <span className="text-red-600 text-sm flex items-center gap-1"><AlertCircle className="w-4 h-4" />Hatalı cevap</span>}
    </div>
  );
}

// ── Product Search Dropdown ───────────────────────────────────────────────────
function ProductSearchDropdown({ onAdd }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [qty, setQty] = useState(1);
  const [selected, setSelected] = useState(null);
  const dropdownRef = useRef(null);

  const search = useCallback(async (q) => {
    if (!q.trim() || q.length < 2) { setResults([]); setOpen(false); return; }
    setLoading(true);
    try {
      const res = await axios.get(`${API}/products/search/name`, { params: { q, limit: 20 } });
      setResults(res.data);
      setOpen(true);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => search(query), 300);
    return () => clearTimeout(t);
  }, [query, search]);

  useEffect(() => {
    const handler = (e) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (product) => {
    setSelected(product);
    setQuery(product.name);
    setOpen(false);
  };

  const handleAdd = () => {
    if (!selected) { toast.error("Lütfen bir ürün seçin"); return; }
    if (qty < 1) { toast.error("Adet en az 1 olmalıdır"); return; }
    onAdd({ ...selected, quantity: qty });
    setQuery("");
    setSelected(null);
    setQty(1);
    setResults([]);
  };

  return (
    <div className="flex items-start gap-3 flex-wrap sm:flex-nowrap">
      {/* Search input + dropdown */}
      <div ref={dropdownRef} className="relative flex-1 min-w-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelected(null); }}
            placeholder="Ürün adı veya model ara..."
            className="pl-9 h-11 border-slate-300 focus:border-[#1a1a6c] focus:ring-[#1a1a6c]"
            data-testid="order-product-search"
          />
          {loading && <RefreshCw className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 animate-spin" />}
        </div>
        {open && results.length > 0 && (
          <ul className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-64 overflow-y-auto">
            {results.map((p) => (
              <li
                key={p.model}
                onMouseDown={() => handleSelect(p)}
                className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-blue-50 border-b border-slate-100 last:border-0"
                data-testid="order-product-option"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-900 truncate">{p.name}</p>
                  <p className="text-xs text-slate-500">{p.model}</p>
                </div>
                <div className="ml-3 text-right flex-shrink-0">
                  {p.price_try ? (
                    <span className="text-sm font-semibold text-[#1a1a6c]">₺{p.price_try.toLocaleString("tr-TR", { maximumFractionDigits: 2 })}</span>
                  ) : (
                    <span className="text-xs text-slate-400">Fiyat sorulacak</span>
                  )}
                  <p className={`text-xs mt-0.5 ${p.stock_text?.toLowerCase().includes("yok") || p.stock_text?.toLowerCase().includes("0") ? "text-red-500" : "text-green-600"}`}>
                    {p.stock_text || "Stok bilinmiyor"}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
        {open && results.length === 0 && !loading && query.length >= 2 && (
          <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl p-4 text-sm text-slate-500">
            Ürün bulunamadı
          </div>
        )}
      </div>

      {/* Qty input */}
      <Input
        type="number"
        min={1}
        value={qty}
        onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
        className="w-20 h-11 text-center border-slate-300"
        data-testid="order-qty-input"
      />

      {/* Add button */}
      <Button onClick={handleAdd} className="h-11 bg-[#1a1a6c] hover:bg-blue-900 text-white gap-2 flex-shrink-0" data-testid="order-add-btn">
        <Plus className="w-4 h-4" /> Ekle
      </Button>
    </div>
  );
}

// ── Main Order Page ────────────────────────────────────────────────────────────
export default function OrderPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState("cart"); // cart | checkout | success

  // Shopping list
  const [cartItems, setCartItems] = useState(() => {
  try {
    const saved = localStorage.getItem("zenx_cart");
    return saved ? JSON.parse(saved) : [];
  } catch { return []; }
});

  // Checkout form
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", address: "", phone: ""
  });

  useEffect(() => {
  localStorage.setItem("zenx_cart", JSON.stringify(cartItems));
}, [cartItems]);

  // Email verification
  const [verifyCode, setVerifyCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [verifyingCode, setVerifyingCode] = useState(false);
  const [verifiedEmail, setVerifiedEmail] = useState("");

  // Captcha
  const [captchaOk, setCaptchaOk] = useState(false);

  // Submission
  const [submitting, setSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);

  const totalPrice = cartItems.reduce((sum, item) => {
    return sum + (item.price_try ? item.price_try * item.quantity : 0);
  }, 0);

  const addToCart = (product) => {
    setCartItems((prev) => {
      const existing = prev.find((p) => p.model === product.model);
      if (existing) {
        toast.info(`${product.name} miktarı güncellendi`);
        return prev.map((p) =>
          p.model === product.model ? { ...p, quantity: p.quantity + product.quantity } : p
        );
      }
      toast.success(`${product.name} sepete eklendi`);
      return [...prev, product];
    });
  };

  const removeFromCart = (model) => {
    setCartItems((prev) => prev.filter((p) => p.model !== model));
  };

  const updateQty = (model, qty) => {
    if (qty < 1) { removeFromCart(model); return; }
    setCartItems((prev) => prev.map((p) => p.model === model ? { ...p, quantity: qty } : p));
  };

  // Send verification code
  const handleSendCode = async () => {
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      toast.error("Geçerli bir e-posta adresi girin");
      return;
    }
    setSendingCode(true);
    try {
      await axios.post(`${API}/orders/send-verification`, { email: form.email });
      setCodeSent(true);
      setVerifiedEmail(form.email);
      toast.success("Doğrulama kodu e-posta adresinize gönderildi");
    } catch (e) {
      toast.error(e.response?.data?.detail || "Kod gönderilemedi");
    } finally {
      setSendingCode(false);
    }
  };

  // Verify code
  const handleVerifyCode = async () => {
    if (!verifyCode || verifyCode.length !== 4) {
      toast.error("4 haneli doğrulama kodunu girin");
      return;
    }
    setVerifyingCode(true);
    try {
      await axios.post(`${API}/orders/verify-code`, { email: form.email, code: verifyCode });
      setEmailVerified(true);
      toast.success("E-posta doğrulandı ✓");
    } catch (e) {
      toast.error(e.response?.data?.detail || "Doğrulama başarısız");
    } finally {
      setVerifyingCode(false);
    }
  };

  // Submit order
  const handleCheckout = async () => {
    if (!form.firstName || !form.lastName || !form.email || !form.address || !form.phone) {
      toast.error("Lütfen tüm alanları doldurun");
      return;
    }
    if (!emailVerified) {
      toast.error("E-posta adresinizi doğrulamanız gerekiyor");
      return;
    }
    if (!captchaOk) {
      toast.error("CAPTCHA doğrulamasını tamamlayın");
      return;
    }
    setSubmitting(true);
    try {
      const res = await axios.post(`${API}/orders/checkout`, {
        first_name: form.firstName,
        last_name: form.lastName,
        email: form.email,
        address: form.address,
        phone: form.phone,
        payment_method: "Banka Havalesi",
        items: cartItems.map((i) => ({ name: i.name, model: i.model, quantity: i.quantity, price_try: i.price_try })),
        total_price: totalPrice || null,
        verification_code: verifyCode,
        captcha_verified: captchaOk,
      });
      console.log("Checkout response:", res.data); // ← ADD THIS
      setCompletedOrder(res.data);
      localStorage.removeItem("zenx_cart");
      setStep("success");
    } catch (e) {
      console.error("Checkout error:", e); // ← ADD THIS
      toast.error(e.response?.data?.detail || "Sipariş gönderilemedi");
    } finally {
      setSubmitting(false);
    }
  };

  // Reset if email changes
  useEffect(() => {
    if (form.email !== verifiedEmail) {
      setEmailVerified(false);
      setCodeSent(false);
      setVerifyCode("");
    }
  }, [form.email]);

  // ── Success screen ─────────────────────────────────────────
  if (step === "success" && completedOrder) {

    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center px-4">
        <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Siparişiniz Alındı!</h1>
          <p className="text-slate-500 mb-1">Sipariş No: <strong className="text-[#1a1a6c]">{completedOrder.order_id}</strong></p>
          <p className="text-slate-500 text-sm mb-6">Sipariş detaylarınız <strong>{completedOrder.email}</strong> adresine gönderildi.</p>

          <div className="bg-blue-50 rounded-xl p-4 text-left mb-6">
            <p className="text-sm font-semibold text-[#1a1a6c] mb-2">Ödeme Bilgileri</p>
            <div className="text-sm text-slate-700 space-y-1">
              <p><span className="text-slate-500">Banka:</span> Enpara Bank A.Ş.</p>
              <p><span className="text-slate-500">Hesap Adı:</span> Mustafa Kemal Esen</p>
              <p><span className="text-slate-500">IBAN:</span> <span className="font-mono">TR08 0015 7000 0000 0106 3842 39</span></p>
              <p className="text-red-600"><span className="text-red-600">Açıklama:</span> Lütfen ödeme sonrası oluşan sipariş numarasını transfer bilgileriyle belirtiniz!</p>
              {completedOrder.total_price > 0 && (
                <p className="font-semibold text-[#1a1a6c] mt-2">
                  Toplam: ₺{completedOrder.total_price.toLocaleString("tr-TR", { maximumFractionDigits: 2 })}
                </p>
              )}
            </div>
          </div>

          <Button onClick={() => navigate("/")} className="w-full bg-[#1a1a6c] hover:bg-blue-900 text-white gap-2">
            <ArrowLeft className="w-4 h-4" /> Ana Sayfaya Dön
          </Button>
        </div>
      </div>
    );
  }

  // ── Checkout form ──────────────────────────────────────────
  if (step === "checkout") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-2xl mx-auto px-4 py-10">
          <button onClick={() => setStep("cart")} className="flex items-center gap-2 text-slate-500 hover:text-[#1a1a6c] mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Sepete Geri Dön
          </button>

          <h1 className="text-3xl font-bold text-slate-900 mb-8 font-outfit">Ödeme Bilgileri</h1>

          {/* Order summary */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-[#1a1a6c]" /> Sipariş Özeti
            </h2>
            {cartItems.map((item) => (
              <div key={item.model} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0 text-sm">
                <span className="text-slate-700">{item.name} <span className="text-slate-400">×{item.quantity}</span></span>
                <span className="font-medium text-slate-900">
                  {item.price_try ? `₺${(item.price_try * item.quantity).toLocaleString("tr-TR", { maximumFractionDigits: 2 })}` : "Fiyat sorulacak"}
                </span>
              </div>
            ))}
            {totalPrice > 0 && (
              <div className="flex justify-between items-center pt-3 mt-1">
                <span className="font-semibold text-slate-800">Toplam</span>
                <span className="font-bold text-[#1a1a6c] text-lg">₺{totalPrice.toLocaleString("tr-TR", { maximumFractionDigits: 2 })}</span>
              </div>
            )}
          </div>

          {/* Customer info */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-[#1a1a6c]" /> Kişisel Bilgiler
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-slate-600 mb-1 block">Ad *</label>
                <Input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} placeholder="Adınız" className="h-10" data-testid="checkout-firstname" />
              </div>
              <div>
                <label className="text-sm text-slate-600 mb-1 block">Soyad *</label>
                <Input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} placeholder="Soyadınız" className="h-10" data-testid="checkout-lastname" />
              </div>
            </div>

            {/* Email + verification */}
            <div className="mt-4">
              <label className="text-sm text-slate-600 mb-1 block flex items-center gap-1">
                <Mail className="w-3.5 h-3.5" /> E-posta Adresi *
              </label>
              <div className="flex gap-2">
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="mail@ornek.com"
                  className={`h-10 flex-1 ${emailVerified ? "border-green-500 bg-green-50" : ""}`}
                  data-testid="checkout-email"
                  disabled={emailVerified}
                />
                {!emailVerified && (
                  <Button
                    type="button"
                    onClick={handleSendCode}
                    disabled={sendingCode || !form.email}
                    className="h-10 bg-[#1a1a6c] hover:bg-blue-900 text-white text-sm whitespace-nowrap"
                    data-testid="send-code-btn"
                  >
                    {sendingCode ? <RefreshCw className="w-4 h-4 animate-spin" /> : codeSent ? "Tekrar Gönder" : "Kod Gönder"}
                  </Button>
                )}
                {emailVerified && <div className="flex items-center gap-1 text-green-600 px-2"><CheckCircle className="w-5 h-5" /><span className="text-sm">Doğrulandı</span></div>}
              </div>

              {codeSent && !emailVerified && (
                <div className="mt-3 flex gap-2">
                  <Input
                    value={verifyCode}
                    onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    placeholder="4 haneli kod"
                    className="h-10 w-40 text-center tracking-widest font-mono text-lg"
                    data-testid="verify-code-input"
                    maxLength={4}
                  />
                  <Button
                    type="button"
                    onClick={handleVerifyCode}
                    disabled={verifyingCode || verifyCode.length !== 4}
                    className="h-10 bg-emerald-600 hover:bg-emerald-700 text-white"
                    data-testid="verify-code-btn"
                  >
                    {verifyingCode ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Doğrula"}
                  </Button>
                </div>
              )}
              {codeSent && !emailVerified && (
                <p className="text-xs text-slate-400 mt-1">E-posta adresinize gönderilen 4 haneli kodu girin (10 dk geçerli)</p>
              )}
            </div>

            <div className="mt-4">
              <label className="text-sm text-slate-600 mb-1 block flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> Adres *
              </label>
              <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Tam adresiniz" className="h-10" data-testid="checkout-address" />
            </div>

            <div className="mt-4">
              <label className="text-sm text-slate-600 mb-1 block flex items-center gap-1">
                <Phone className="w-3.5 h-3.5" /> Telefon *
              </label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+90 5XX XXX XX XX" className="h-10" data-testid="checkout-phone" />
            </div>
          </div>

          {/* Payment info */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-[#1a1a6c]" /> Ödeme Yöntemi
            </h2>
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-4 h-4 rounded-full bg-[#1a1a6c] flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>
                <span className="font-semibold text-slate-800">Banka Havalesi / EFT</span>
              </div>
              <div className="text-sm text-slate-700 space-y-1.5">
                <div className="flex gap-2"><span className="text-slate-500 w-28">Banka</span><span>Enpara Bank A.Ş.</span></div>
                <div className="flex gap-2"><span className="text-slate-500 w-28">Hesap Adı</span><span>Mustafa Kemal Esen</span></div>
                <div className="flex gap-2"><span className="text-slate-500 w-28">IBAN</span><span className="font-mono font-medium">TR08 0015 7000 0000 0106 3842 39</span></div>
               <div className="flex gap-2"><span className="text-slate-500 w-28">Açıklama</span><span className="text-red-600">Lütfen ödeme sonrası oluşan sipariş numarasını transfer bilgileriyle belirtiniz!</span></div>
                {totalPrice > 0 && (
                  <div className="flex gap-2 pt-2 border-t border-blue-200 mt-2">
                    <span className="text-slate-500 w-28 font-semibold">Toplam Tutar</span>
                    <span className="font-bold text-[#1a1a6c]">₺{totalPrice.toLocaleString("tr-TR", { maximumFractionDigits: 2 })}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* CAPTCHA + submit */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5 text-[#1a1a6c]" /> Güvenlik Doğrulaması
            </h2>
            <MathCaptcha onVerify={setCaptchaOk} />

            <Button
              onClick={handleCheckout}
              disabled={submitting || !captchaOk || !emailVerified}
              className="w-full h-12 mt-6 bg-[#1a1a6c] hover:bg-blue-900 text-white font-semibold text-base gap-2 disabled:opacity-50"
              data-testid="checkout-submit-btn"
            >
              {submitting ? (
                <><RefreshCw className="w-4 h-4 animate-spin" /> İşleniyor...</>
              ) : (
                <><CheckCircle className="w-5 h-5" /> Siparişi Onayla</>
              )}
            </Button>
            {(!captchaOk || !emailVerified) && (
              <p className="text-xs text-slate-400 text-center mt-2">
                {!emailVerified ? "E-posta doğrulaması gerekli" : "CAPTCHA doğrulaması gerekli"}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Shopping cart / order list ─────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <button onClick={() => navigate("/")} className="flex items-center gap-2 text-slate-500 hover:text-[#1a1a6c] mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Ana Sayfaya Dön
        </button>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-[#1a1a6c] rounded-full flex items-center justify-center">
            <ShoppingCart className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 font-outfit">Sipariş Ver</h1>
        </div>

        {/* Product search */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6 shadow-sm">
          <h2 className="text-base font-semibold text-slate-700 mb-4">Ürün Ara ve Ekle</h2>
          <ProductSearchDropdown onAdd={addToCart} />
        </div>

        {/* Cart list */}
        {cartItems.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center text-slate-400">
            <ShoppingCart className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm">Henüz ürün eklenmedi</p>
            <p className="text-xs mt-1">Yukarıdan ürün arayarak sepetinize ekleyin</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-semibold text-slate-800 flex items-center gap-2">
                <Package className="w-4 h-4 text-[#1a1a6c]" /> Sipariş Listesi
                <span className="bg-[#1a1a6c] text-white text-xs rounded-full px-2 py-0.5">{cartItems.length}</span>
              </h2>
              {totalPrice > 0 && (
                <span className="font-bold text-[#1a1a6c]">
                  Toplam: ₺{totalPrice.toLocaleString("tr-TR", { maximumFractionDigits: 2 })}
                </span>
              )}
            </div>
            <ul className="divide-y divide-slate-100">
              {cartItems.map((item) => (
                <li key={item.model} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors">
                  {item.image_url && (
                    <img src={item.image_url} alt={item.name} className="w-12 h-12 object-contain rounded-lg bg-slate-100 flex-shrink-0" />
                  )}
                  {!item.image_url && (
                    <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Package className="w-5 h-5 text-slate-300" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{item.name}</p>
                    <p className="text-xs text-slate-500">{item.model}</p>
                    {item.price_try && (
                      <p className="text-xs text-[#1a1a6c] font-semibold mt-0.5">
                        ₺{(item.price_try * item.quantity).toLocaleString("tr-TR", { maximumFractionDigits: 2 })}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => updateQty(item.model, item.quantity - 1)}
                      className="w-7 h-7 rounded-md border border-slate-300 text-slate-600 hover:bg-slate-100 flex items-center justify-center font-bold"
                    >−</button>
                    <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQty(item.model, item.quantity + 1)}
                      className="w-7 h-7 rounded-md border border-slate-300 text-slate-600 hover:bg-slate-100 flex items-center justify-center font-bold"
                    >+</button>
                    <button
                      onClick={() => removeFromCart(item.model)}
                      className="ml-2 text-red-400 hover:text-red-600 transition-colors"
                      data-testid={`remove-${item.model}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Proceed button */}
        {cartItems.length > 0 && (
          <Button
            onClick={() => setStep("checkout")}
            className="w-full h-12 bg-[#1a1a6c] hover:bg-blue-900 text-white font-semibold text-base gap-2"
            data-testid="proceed-checkout-btn"
          >
            <CreditCard className="w-5 h-5" /> Ödeme Adımına Geç
          </Button>
        )}
      </div>
    </div>
  );
}