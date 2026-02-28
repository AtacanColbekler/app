import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate } from "react-router-dom";
import { Search, Menu, Phone, Mail, ChevronRight, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const LOGO_URL =
  "https://customer-assets.emergentagent.com/job_f28429eb-ca57-4b6c-8a6e-98f8289c0126/artifacts/hgjiqrqk_logo.png";

// ─────────────────────────────────────────────────────────────
//  MENU DATA
// ─────────────────────────────────────────────────────────────
const STATIC_MENU_ITEMS = [
  { label: "Ana Sayfa", to: "/" },

  {
    label: "Bilgisayarlar",
    to: "/ara?q=Masaustu-Bilgisayarlar%20Notebook%20Tablet",
    children: [
      {
        label: "Masaüstü Bilgisayarlar",
        to: "/ara?q=Masaustu-Bilgisayarlar%20MasaUstuBilgisayarlar",
        children: [
          { label: "Masaüstü PC",  to: "/ara?q=Masaustu-Bilgisayarlar%20MasaUstuBilgisayarlar" },
          { label: "All in One",   to: "/ara?q=All-in-One-Bilgisayarlar%20AllinOnePc" },
          { label: "Mini PC",      to: "/ara?q=Mini-PC%20MiniPcBilgisayarlar" },
          { label: "Thin Client",  to: "/ara?q=Thin-Client" },
        ],
      },
      {
        label: "Taşınabilir",
        to: "/ara?q=Notebook%20Notebooklar",
        children: [
          { label: "Notebook",             to: "/ara?q=Notebook%20Notebooklar" },
          { label: "Tablet",               to: "/ara?q=Tablet%20TabletAksesuar" },
          { label: "Taşınabilir Aksesuarlar", to: "/ara?q=Tasinabilir-Aksesuarlari%20NotebookCantalari%20NotebookAdaptorleri%20NotebookSogutucular" },
        ],
      },
      {
        label: "İş İstasyonları",
        to: "/ara?q=IsIstasyonlari%20Masaustu-Is-Istasyonlari%20Mobil-Is-Istasyonlari",
        children: [
          { label: "Masaüstü İş İstasyonu", to: "/ara?q=Masaustu-Is-Istasyonlari%20IsIstasyonlari" },
          { label: "Mobil İş İstasyonu",    to: "/ara?q=Mobil-Is-Istasyonlari" },
        ],
      },
    ],
  },

  {
    label: "Bileşenler",
    to: "/ara?q=Islemciler%20Anakartlar%20Bellekler%20Diskler%20EkranKarti",
    children: [
      {
        label: "İşlemciler",
        to: "/ara?q=Islemciler%20Islemci%20Chip",
        children: [
          { label: "İşlemci",          to: "/ara?q=Islemci%20Islemciler" },
          { label: "İşlemci Soğutucu", to: "/ara?q=Islemci-Sogutuculari%20IslemciSogutuculari" },
          { label: "chip", to: "/ara?q=Chip" },
          
        ],
      },
      { label: "Anakartlar",     to: "/ara?q=Anakart%20Anakartlar" },
      {
        label: "Bellekler",
        to: "/ara?q=Bellekler%20MasaUstuBellekler%20NotebookBellekler",
        children: [
          { label: "Masaüstü Bellek", to: "/ara?q=Masaustu-Bellekler%20MasaUstuBellekler%20Bellekler" },
          { label: "Notebook Bellek", to: "/ara?q=Notebook-Bellekler%20NotebookBellekler" },
          { label: "USB Bellek",      to: "/ara?q=USB-Bellekler%20UsbBellekler" },
          { label: "Hafıza Kartı",    to: "/ara?q=Hafiza-Kartlari%20HafizaKartlari" },
        ],
      },
      {
        label: "Harddiskler",
        to: "/ara?q=Diskler%20SSD-Diskler%20Sata-Harddiskler",
        children: [
          { label: "SSD Diskler",      to: "/ara?q=SSD-Diskler%20ssddisk" },
          { label: "Sata Harddisk",    to: "/ara?q=Sata-Harddiskler%20satahdd" },
          { label: "Taşınabilir SSD",  to: "/ara?q=Tasinabilir-SSD%20tasinabilirdisk" },
          { label: "Taşınabilir HDD",  to: "/ara?q=Tasinabilir-HDD%20tasinabilirdisk" },
          { label: "Notebook HDD",     to: "/ara?q=NotebookEkran" },
          { label: "HDD Kutu & Dock",  to: "/ara?q=HDD-Kutulari---Dock%20hddkutu" },
          { label: "HDD Aksesuarları", to: "/ara?q=DiskKizak%20DepolamaUniteleri" },
          { label: "Aksesuarlar", to: "/ara?q=Aksesuarlar" },
          { label: "Diskler", to: "/ara?q=Diskler" },
          
          
        ],
      },
      { label: "Ekran Kartları",  to: "/ara?q=Ekran-Kartlari%20EkranKarti" },
      {
        label: "Monitör",
        to: "/ara?q=Monitorler%20Monitor-Aksesuarlari",
        children: [
          { label: "Monitörler",            to: "/ara?q=Monitorler" },
          { label: "Monitör Aksesuarları",  to: "/ara?q=Monitor-Aksesuarlari" },
          { label: "Dijital Signage",       to: "/ara?q=Monitorler" },
        ],
      },
      {
        label: "Kasalar & Güç",
        to: "/ara?q=Kasalar%20PowerSupply",
        children: [
          { label: "Kasalar",           to: "/ara?q=Kasalar" },
          { label: "Power Supply",      to: "/ara?q=Power-Supply%20PowerSupply%20SPowerSupply" },
          { label: "Kasa Aksesuarları", to: "/ara?q=Kasa-Aksesuarlari%20KasaAksesuar" },
        ],
      },
      { label: "Optik Sürücüler", to: "/ara?q=OptikSurucu%20DvdR" },
    ],
  },

  {
    label: "Çevre Birimleri",
    to: "/ara?q=Klavyeler%20Mouselar%20WebKamera%20Hoparlor",
    children: [
      {
        label: "Klavye & Mouse",
        to: "/ara?q=Klavyeler%20Mouselar",
        children: [
          { label: "Klavyeler",        to: "/ara?q=Klavyeler" },
          { label: "Mouseler",         to: "/ara?q=Mouselar%20Mouseler" },
          { label: "Klavye Mouse Set", to: "/ara?q=Klavye---Mouse-Setleri%20KlavyeMouseSetleri" },
          { label: "Mousepad",         to: "/ara?q=MousePadlar" },
        ],
      },
      { label: "Hoparlör",         to: "/ara?q=Hoparlor%20Hoparlorler" },
      {
        label: "Kulaklık & Mikrofon",
        to: "/ara?q=KulaklikMikrofon%20Mikrofonlu-Kulaklik",
        children: [
          { label: "Kulaklık",            to: "/ara?q=KulaklikMikrofon" },
          { label: "Mikrofonlu Kulaklık", to: "/ara?q=Mikrofonlu-Kulaklik" },
        ],
      },
      { label: "Web Kameralar",    to: "/ara?q=Web-Kameralar%20WebKamera" },
      { label: "Oyun Ürünleri",    to: "/ara?q=Oyun-urunleri%20OyunAksesuar" },
      { label: "Ses Kartları",     to: "/ara?q=AgKartlari" },
      { label: "Powerbank & Şarj", to: "/ara?q=Powerbank---Sarj" },
    ],
  },

  {
    label: "Yazıcılar",
    to: "/ara?q=siyahlazer%20renklilazer%20inkjetyazici%20tankliyazici",
    children: [
      {
        label: "Lazer Yazıcılar",
        to: "/ara?q=siyahlazer%20renklilazer%20cokfonksiyonlulazer",
        children: [
          { label: "Siyah Lazer",     to: "/ara?q=Siyah-Lazer%20siyahlazer" },
          { label: "Renkli Lazer",    to: "/ara?q=Renkli-Lazer%20renklilazer" },
          { label: "Çok Fonksiyonlu", to: "/ara?q=Cok-Fonksiyonlu-Lazer%20cokfonksiyonlulazer" },
          { label: "Tanklı Lazer",    to: "/ara?q=Tankli-Yazici%20tankliyazici" },
        ],
      },
      {
        label: "Inkjet Yazıcılar",
        to: "/ara?q=inkjetyazici%20tankliyazici",
        children: [
          { label: "Inkjet Yazıcı", to: "/ara?q=Inkjet-Yazici%20inkjetyazici" },
          { label: "Tanklı Yazıcı", to: "/ara?q=Tankli-Yazici%20tankliyazici" },
        ],
      },
      { label: "Nokta Vuruşlu",      to: "/ara?q=Nokta-Vuruslu-Fis-(Slip)-Yazicilar%20EndustriyelYazici" },
      {
        label: "Tarayıcılar",
        to: "/ara?q=dokumantarayici%20Optik-Tarayicilar",
        children: [
          { label: "Döküman Tarayıcı", to: "/ara?q=Dokuman-Tarayicilar%20dokumantarayici" },
          { label: "Optik Tarayıcı",   to: "/ara?q=Optik-Tarayicilar" },
        ],
      },
      { label: "Faks Makinaları",     to: "/ara?q=faks" },
      { label: "Kağıt İmha",          to: "/ara?q=kagit-imha" },
      { label: "Yazıcı Aksesuarları", to: "/ara?q=DrumUniteleri%20TonerTozu" },
    ],
  },

  {
    label: "Yazılım",
    to: "/ara?q=IsletimSistemleri%20OfisUygulamalari%20Antivirus",
    children: [
      {
        label: "İşletim Sistemleri",
        to: "/ara?q=IsletimSistemleri",
        children: [
          { label: "OEM Lisans",  to: "/ara?q=OEM-Lisans" },
          { label: "Kutu Lisans", to: "/ara?q=Kutu-Lisans" },
          { label: "Open Lisans", to: "/ara?q=Online" },
          { label: "ESD Online",  to: "/ara?q=ESD---Online-Lisans" },
          { label: "Isletim Sistemleri",  to: "/ara?q=IsletimSistemleri" },
          
        ],
      },
      {
        label: "Ofis Yazılımları",
        to: "/ara?q=OfisUygulamalari",
        children: [
          { label: "Kutu Office", to: "/ara?q=Kutu-Office-Lisans" },
          { label: "Open Office", to: "/ara?q=Online" },
          { label: "ESD Office",  to: "/ara?q=ESD-(Office-Online-Lisans)" },
          { label: "Ofis Uygulamalari",  to: "/ara?q=OfisUygulamalari" },
          
        ],
      },
      {
        label: "Sunucu Lisansları",
        to: "/ara?q=SunucuLisanlari",
        children: [
          { label: "OEM & ROK",    to: "/ara?q=OEM---ROK-Lisans" },
          { label: "Open Sunucu", to: "/ara?q=Online" },
          { label: "Sunucu Lisanslari", to: "/ara?q=SunucuLisanlari" },
          
        ],
      },
      {
        label: "Antivirüs",
        to: "/ara?q=Antivirus",
        children: [
          { label: "Bireysel", to: "/ara?q=Bireysel%20Antivirus" },
          { label: "Kurumsal", to: "/ara?q=Kurumsal%20Antivirus" },
        ],
      },
    ],
  },

  {
    label: "Network",
    to: "/ara?q=AccessPoint%20Switch%20Modem%20Firewall",
    children: [
      { label: "Modemler", to: "/ara?q=Modem%20Modemler" },
      {
        label: "Ağ İletişim",
        to: "/ara?q=KablosuzAgUrunleri%20AccessPoint%20Router",
        children: [
          { label: "Access Point & Router", to: "/ara?q=Access-Point-ve-Router%20AccessPoint" },
          { label: "Home Router",           to: "/ara?q=Home-Router%20Router%20KablosuzAgUrunleri%20Modem%20Modemler" },
          { label: "Hotspot / Gateway",     to: "/ara?q=Hotspot-Gateway" },
          { label: "PoE Adaptör/Enjector",  to: "/ara?q=PoE-Adaptor-Enjector%20PoeUrunleri" },
          { label: "Kablosuz USB Adaptör",  to: "/ara?q=Kablosuz-USB-Adaptor" },
          { label: "Kablosuz PCI Kart",     to: "/ara?q=Kablosuz-PCI-Kart%20PciKartlar" },
          { label: "Ethernet Kartı",        to: "/ara?q=Ethernet-Karti" },
          { label: "Menzil Arttırıcı",      to: "/ara?q=MenzilArttirici%20PowerlineUrunleri" },
          { label: "Antenler",              to: "/ara?q=TvAntenKablo" },
        ],
      },
      {
        label: "Switch",
        to: "/ara?q=Switch%20POE-Switchler%20Data-Non-PoE-Switchler",
        children: [
          { label: "Data / Non-PoE",      to: "/ara?q=Data-Non-PoE-Switchler" },
          { label: "PoE Switch",          to: "/ara?q=POE-Switchler" },
          { label: "SFP / Gbic Modül",    to: "/ara?q=SFP-Gbic-Modul" },
          { label: "Fiber / Omurga",      to: "/ara?q=Fiber-Omurga-Switchler" },
          { label: "Endüstriyel Switch",  to: "/ara?q=Endustriyel-Switchler" },
          { label: "Sade Switch",  to: "/ara?q=Switch" },
        ],
      },
      { label: "Patch Panel",  to: "/ara?q=Patch-Panel" },
      { label: "Print Server", to: "/ara?q=print-server" },
      {
        label: "Network Sarf",
        to: "/ara?q=Konnektor%20Pense%20TestCihaz",
        children: [
          { label: "Konnektör",   to: "/ara?q=Konnektor" },
          { label: "Pense",       to: "/ara?q=Pense" },
          { label: "Test Cihazı", to: "/ara?q=TestCihaz" },
        ],
      },
      {
        label: "Ağ Kabloları",
        to: "/ara?q=CatKablo%20PatchKablo%20CAT6-UTP---FTP-Kablolar",
        children: [
          { label: "Patch Kablo",    to: "/ara?q=Patch-Kablolar%20PatchKablo" },
          { label: "CAT6 UTP / FTP", to: "/ara?q=CAT6-UTP---FTP-Kablolar%20CatKablo" },
        ],
      },
      {
        label: "Fiber",
        to: "/ara?q=Fiber-Kablolar%20Fiber-Patch-Kablo%20Fiber-Converter",
        children: [
          { label: "Fiber Kablo",       to: "/ara?q=Fiber-Kablolar" },
          { label: "Fiber Patch Kablo", to: "/ara?q=Fiber-Patch-Kablo" },
          { label: "Fiber Patch Panel", to: "/ara?q=Fiber-Patch-Paneller" },
          { label: "Fiber Converter",   to: "/ara?q=Fiber-Converter" },
          { label: "Fiber Pigtail",     to: "/ara?q=Fiber-Pigtail" },
          { label: "Fiber Konnektör",   to: "/ara?q=Konnektor" },
          { label: "Fiber Adaptör",     to: "/ara?q=Fiber-Adaptorler" },
          { label: "Sonlandırma",       to: "/ara?q=Sonlandirma-urunleri" },
        ],
      },
    ],
  },

  {
    label: "Kurumsal",
    to: "/ara?q=Sunucular%20Firewall%20Veri-Yedekleme-Depolama%20Kabinler",
    children: [
      {
        label: "Sunucu & Aksesuarları",
        to: "/ara?q=Sunucular%20Sunucu-Aksamlari",
        children: [
          { label: "Sunucular",        to: "/ara?q=Sunucular" },
          { label: "Sunucu Aksamları", to: "/ara?q=Sunucu-Aksamlari" },
        ],
      },
      { label: "Veri Yedekleme", to: "/ara?q=Veri-Yedekleme-Depolama" },
      { label: "Firewall",       to: "/ara?q=Firewall" },
      {
        label: "İş İstasyonları",
        to: "/ara?q=IsIstasyonlari%20Masaustu-Is-Istasyonlari%20Mobil-Is-Istasyonlari",
        children: [
          { label: "Masaüstü", to: "/ara?q=Masaustu-Is-Istasyonlari" },
          { label: "Mobil",    to: "/ara?q=Mobil-Is-Istasyonlari" },
        ],
      },
      {
        label: "Kabinler",
        to: "/ara?q=Kabinler%20Kabin",
        children: [
          { label: "Kabin",             to: "/ara?q=Kabin%20Kabinler" },
          { label: "Kabin Aksesuarları",to: "/ara?q=Kabin-Aksesuarlari%20KabinAksesuar%20Aksesuarlar" },
        ],
      },
      { label: "Video Konferans", to: "/ara?q=Video-Konferans-Cihazlari" },
    ],
  },

  {
    label: "UPS & Güç",
    to: "/ara?q=Line-Interactive-UPS%20Online-UPS%20Aku",
    children: [
      { label: "Line Interactive UPS", to: "/ara?q=Line-Interactive-UPS%20LineInteractive" },
      { label: "Online UPS",           to: "/ara?q=Online-UPS" },
      { label: "Akü",                  to: "/ara?q=Aku%20Akuler" },
      { label: "Korumalı Prizler",     to: "/ara?q=Korumali-Prizler%20PrizCevirici" },
    ],
  },

  {
    label: "Barkod & PDKS",
    to: "/ara?q=EltipiOkuyucu%20Barkod-Yazicilar%20PosPc%20Parmak-Izi-Sistemleri",
    children: [
      {
        label: "Barkod Okuyucular",
        to: "/ara?q=EltipiOkuyucu%20MasaUstuOkuyucu",
        children: [
          { label: "El Tipi",         to: "/ara?q=El-Tipi-Barkod-Okuyucu%20EltipiOkuyucu" },
          { label: "Masaüstü",        to: "/ara?q=Masaustu-Barkod-Okuyucu%20MasaUstuOkuyucu" },
          { label: "2D / QR Okuyucu", to: "/ara?q=KareKod-(2D)-Barkod-Okuyucu" },
        ],
      },
      { label: "Barkod Yazıcılar",      to: "/ara?q=Barkod-Yazicilar%20MasaUstuBarkodYazici%20MobilYazicilar" },
      { label: "Termal Fiş Yazıcı",     to: "/ara?q=Termal-Fis-(Slip)-Yazicilar%20FisYazici" },
      { label: "Nokta Vuruşlu Fiş",     to: "/ara?q=Nokta-Vuruslu-Fis-(Slip)-Yazicilar" },
      { label: "El Terminalleri",        to: "/ara?q=El-Terminalleri%20ElTerminali" },
      { label: "POS Terminali",          to: "/ara?q=Pos-Terminalleri-(AIO)-%20PosPc" },
      { label: "Para Çekmeceleri",       to: "/ara?q=Para-Cekmeceleri" },
      {
        label: "PDKS Sistemleri",
        to: "/ara?q=Yuz-Tanima-Sistemleri%20Parmak-Izi-Sistemleri%20Kartli-Gecis-Sistemleri",
        children: [
          { label: "Yüz Tanıma",           to: "/ara?q=Yuz-Tanima-Sistemleri" },
          { label: "Parmak İzi",            to: "/ara?q=Parmak-Izi-Sistemleri" },
          { label: "Kartlı Geçiş",          to: "/ara?q=Kartli-Gecis-Sistemleri" },
          { label: "Proximity / Kilitler",  to: "/ara?q=Proximity---Mifare---Kilitler" },
        ],
      },
    ],
  },

  {
    label: "Güvenlik",
    to: "/ara?q=IpKameralar%20DvrCihazlar%20NvrCihazlar%20HirsizAlarmSistemleri",
    children: [
      {
        label: "Kameralar",
        to: "/ara?q=IpKameralar%20AHD---HD-TVI-Kameralar",
        children: [
          { label: "IP Kameralar",     to: "/ara?q=IP-Kameralar%20IpKameralar%20Kablosuz(WIFI)Kameralar%204gKameralar" },
          { label: "AHD & HD-TVI",     to: "/ara?q=AHD---HD-TVI-Kameralar%20Ahd_HdTviKameralar" },
          { label: "Araç Kameraları",  to: "/ara?q=Arac-Kameralari%20AracKamera" },
          { label: "Ev & Bebek Kamera",to: "/ara?q=EvBebekKameralari%20Kablosuz(WIFI)Kameralar" },
        ],
      },
      {
        label: "Kayıt Cihazları",
        to: "/ara?q=DvrCihazlar%20NvrCihazlar",
        children: [
          { label: "DVR", to: "/ara?q=DVR-Cihazlar%20DvrCihazlar" },
          { label: "NVR", to: "/ara?q=NVR-Cihazlar%20NvrCihazlar" },
          { label: "DVRPIL", to: "/ara?q=DVRPIL" },
          
        ],
      },
      {
        label: "Ses Sistemleri",
        to: "/ara?q=Hoparlorler%20Amfi-Mikserler%20Mikrofonlar",
        children: [
          { label: "Hoparlörler",    to: "/ara?q=Hoparlorler" },
          { label: "Amfi / Mikser",  to: "/ara?q=Amfi-Mikserler" },
          { label: "Mikrofonlar",    to: "/ara?q=Mikrofonlar" },
          { label: "Acil Anons",     to: "/ara?q=Acil-AnonsSistemleri" },
        ],
      },
      {
        label: "Alarm Sistemleri",
        to: "/ara?q=HirsizAlarmSistemleri%20Yangin-Alarm-Sistemleri",
        children: [
          { label: "Hırsız Alarm", to: "/ara?q=Hirsiz-Alarm-Sistemleri%20HirsizAlarmSistemleri" },
          { label: "Yangın Alarm", to: "/ara?q=Yangin-Alarm-Sistemleri" },
        ],
      },
      {
        label: "Güvenlik Aksesuarları",
        to: "/ara?q=KameraAksesuar%20KanalAksesuar%20CCTV-Kablolar",
        children: [
          { label: "CCTV Kablolar",      to: "/ara?q=CCTV-Kablolar%20GuvenlikKablolari" },
          { label: "Bağlantı Ekipmanı",  to: "/ara?q=Baglanti-Ekipmanlari%20BaglantiEkipmanlari" },
          { label: "Güvenlik Adaptörü",  to: "/ara?q=Guvenlik-Adaptorleri%20GuvenlikAdaptorleri" },
          { label: "Kontrol Klavyesi",   to: "/ara?q=Kontrol-Klavyesi" },
          { label: "Kamera Aksesuar",   to: "/ara?q=KameraAksesuar" },
          { label: "Kanal Aksesuar",   to: "/ara?q=KanalAksesuar" },
          
          
        ],
      },
      {
        label: "Intercom",
        to: "/ara?q=Villa-Setleri%20Ic-unite%20Dis-unite",
        children: [
          { label: "İç Ünite",   to: "/ara?q=Ic-unite" },
          { label: "Dış Ünite",  to: "/ara?q=Dis-unite" },
          { label: "Villa Seti", to: "/ara?q=Villa-Setleri" },
        ],
      },
      { label: "Termal Isı Ölçer", to: "/ara?q=Termal-Isi-Olcer" },
      { label: "Akıllı Prizler",   to: "/ara?q=Akilli-Prizler" },
    ],
  },

  {
    label: "Elektronik",
    to: "/ara?q=Projeksiyonlar%20Televizyonlar%20IP-Telefonlar%20Telsizler",
    children: [
      {
        label: "Görüntüleme",
        to: "/ara?q=Projeksiyonlar%20Akilli-Tahta",
        children: [
          { label: "Akıllı Tahta",    to: "/ara?q=Akilli-Tahta" },
          { label: "Projeksiyon",     to: "/ara?q=Projeksiyon%20Projeksiyonlar" },
          { label: "Perde",           to: "/ara?q=Projeksiyon-Perdeleri%20ProjeksiyonPerde" },
          { label: "Presenter",       to: "/ara?q=Presenter%20SunumKumandasi" },
          { label: "Askı Aparatları", to: "/ara?q=Proj--Aski-Aparatlari%20ProjeksiyonAski" },
        ],
      },
      {
        label: "Televizyonlar",
        to: "/ara?q=Televizyonlar",
        children: [
          { label: "Televizyon",       to: "/ara?q=Televizyonlar" },
          { label: "TV Askı Aparatı",  to: "/ara?q=tv-aski" },
        ],
      },
      {
        label: "Telefonlar",
        to: "/ara?q=IP-Telefonlar%20Telsizler",
        children: [
          { label: "IP Telefon",        to: "/ara?q=IP-Telefonlar" },
          { label: "DECT Telefon",      to: "/ara?q=dect" },
          { label: "Masaüstü Telefon",  to: "/ara?q=masaustu-telefon" },
          { label: "Telsiz",            to: "/ara?q=Telsizler" },
        ],
      },
      { label: "Klima",            to: "/ara?q=Klimalar" },
      { label: "Scooter",          to: "/ara?q=scooter" },
    ],
  },

  {
    label: "Sarf & Kablo",
    to: "/ara?q=Tonerler%20Kartuslar%20GoruntuKablolari%20UsbKablolari",
    children: [
      {
        label: "Tüketim Malzemeleri",
        to: "/ara?q=Tonerler%20Kartuslar",
        children: [
          { label: "Kartuşlar",    to: "/ara?q=Kartuslar%20OrjinalToner%20MuadilToner" },
          { label: "Tonerler",     to: "/ara?q=Tonerler%20OrjinalToner%20MuadilToner" },
          { label: "Mürekkepler",  to: "/ara?q=Murekkepler" },
          { label: "Matris Şerit", to: "/ara?q=Matris-Seritler%20MatrisSerit" },
        ],
      },
      { label: "CD & DVD",      to: "/ara?q=DvdR" },
      { label: "Kompresör",     to: "/ara?q=Kompresor" },
      {
        label: "Kablolar",
        to: "/ara?q=GoruntuKablolari%20USB-Kablolar%20Guc-Kablolari",
        children: [
          { label: "Görüntü Kabloları", to: "/ara?q=Goruntu-Kablolari%20GoruntuKablolari" },
          { label: "USB Kablolar",      to: "/ara?q=USB-Kablolar%20UsbKablolari" },
          { label: "Güç Kabloları",     to: "/ara?q=Guc-Kablolari%20GucKablolari" },
          { label: "Ses Kabloları",     to: "/ara?q=Ses-Kablolari%20SesKablolari" },
          { label: "Data Kabloları",    to: "/ara?q=SataKablo" },
        ],
      },
      {
        label: "Çoklayıcılar",
        to: "/ara?q=HdmiCoklayicilar%20UsbCoklayicilar%20VGA-Coklayici",
        children: [
          { label: "VGA Çoklayıcı",  to: "/ara?q=VGA-Coklayici" },
          { label: "HDMI Çoklayıcı", to: "/ara?q=HDMI-Coklayici%20HdmiCoklayicilar" },
          { label: "USB Çoklayıcı",  to: "/ara?q=USB-Coklayici%20UsbCoklayicilar" },
          { label: "KVM Switch",     to: "/ara?q=kvm-switch" },
        ],
      },
      {
        label: "Çeviriciler",
        to: "/ara?q=UsbCevirici%20HdmiCevirici%20TypeCCevirici",
        children: [
          { label: "USB Çevirici",      to: "/ara?q=USB-Cevirici%20UsbCevirici%20SeriPortCevirici" },
          { label: "HDMI Çevirici",     to: "/ara?q=HDMI-Cevirici%20HdmiCevirici" },
          { label: "VGA Çevirici",      to: "/ara?q=VGA-Cevirici" },
          { label: "DVI Çevirici",      to: "/ara?q=DVI-Cevirici%20DviCevirici" },
          { label: "Display Çevirici",  to: "/ara?q=Display-Cevirici%20DisplayCevirici" },
          { label: "Type-C Çevirici",   to: "/ara?q=Type-C-Cevirici%20TypeCCevirici" },
          { label: "Ethernet Çevirici", to: "/ara?q=Ethernet-Cevirici" },
          { label: "PCI Çevirici",      to: "/ara?q=PCI-Cevirici" },
          { label: "Görüntü Aktarıcı",  to: "/ara?q=Goruntu-Aktaricilar" },
          { label: "Kart Okuyucu",      to: "/ara?q=kart-okuyucu" },
        ],
      },
    ],
  },
];

// ─────────────────────────────────────────────────────────────
//  DESKTOP: Portal dropdown — renders via fixed positioning
//  so it escapes ALL overflow:hidden/auto ancestors.
// ─────────────────────────────────────────────────────────────
function FlyoutSubmenu({ items, visible, anchorRect }) {
  if (!visible || !items?.length || !anchorRect) return null;
  const width = 208;
  // Flip left if flyout would overflow right edge of viewport
  const overflowsRight = anchorRect.right + 0 + width > window.innerWidth;
  const style = {
    position: "fixed",
    top: anchorRect.top,
    left: overflowsRight ? anchorRect.left - width - 0 : anchorRect.right + 0,
    width,
    zIndex: 99999,
  };
  return createPortal(
    <div style={style} className="bg-white rounded-md shadow-xl border border-slate-100 py-1">
      {items.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          className="block px-4 py-2 text-sm text-slate-700 hover:bg-[#1a1a6c] hover:text-white transition-colors"
        >
          {item.label}
        </Link>
      ))}
    </div>,
    document.body
  );
}

function DropdownPortal({ item, anchorRect, onClose }) {
  const [activeChild, setActiveChild] = useState(null);
  const [childRect, setChildRect] = useState(null);
  const rowRef = useRef({});

  if (!item?.children?.length || !anchorRect) return null;

  const width = Math.max(anchorRect.width, 220);
  // Flip left if dropdown would overflow right edge of viewport
  const overflowsRight = anchorRect.left + width > window.innerWidth;
  const style = {
    position: "fixed",
    top: anchorRect.bottom,
    left: overflowsRight ? anchorRect.right - width : anchorRect.left,
    width,
    zIndex: 9999,
  };

  return createPortal(
    <div
      style={style}
      className="bg-white rounded-b-lg shadow-2xl border border-slate-100 py-1"
    >
      {item.children.map((child) => (
        <div
          key={child.to}
          ref={(el) => { if (el) rowRef.current[child.label] = el; }}
          onMouseEnter={() => {
            if (child.children?.length) {
              const el = rowRef.current[child.label];
              if (el) setChildRect(el.getBoundingClientRect());
              setActiveChild(child.label);
            } else {
              setActiveChild(null);
            }
          }}
          onMouseLeave={() => setActiveChild(null)}
        >
          {child.children?.length ? (
            <div className="flex items-center justify-between px-4 py-2 text-sm text-slate-700 hover:bg-[#1a1a6c] hover:text-white cursor-pointer transition-colors group">
              <span>{child.label}</span>
              <ChevronRight className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100" />
              <FlyoutSubmenu
                items={child.children}
                visible={activeChild === child.label}
                anchorRect={childRect}
              />
            </div>
          ) : (
            <Link
              to={child.to}
              className="block px-4 py-2 text-sm text-slate-700 hover:bg-[#1a1a6c] hover:text-white transition-colors"
              onClick={onClose}
            >
              {child.label}
            </Link>
          )}
        </div>
      ))}
    </div>,
    document.body
  );
}

// ─────────────────────────────────────────────────────────────
//  DESKTOP: Single nav item — measures itself, passes rect
//  to portal so dropdown is always positioned correctly.
// ─────────────────────────────────────────────────────────────
function NavItem({ item }) {
  const [open, setOpen] = useState(false);
  const [anchorRect, setAnchorRect] = useState(null);
  const ref = useRef(null);
  const timerRef = useRef(null);

  const handleMouseEnter = () => {
    clearTimeout(timerRef.current);
    if (ref.current) setAnchorRect(ref.current.getBoundingClientRect());
    setOpen(true);
  };

  const handleMouseLeave = () => {
    timerRef.current = setTimeout(() => setOpen(false), 120);
  };

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const hasChildren = item.children?.length > 0;

  return (
    <li
      ref={ref}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Link
        to={item.to}
        className={`inline-flex items-center gap-1 whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-colors
          ${open
            ? "bg-[#1a1a6c] text-white"
            : "text-slate-700 hover:bg-slate-100 hover:text-[#1a1a6c]"
          }`}
      >
        {item.label}
        {hasChildren && (
          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-150 ${open ? "rotate-180" : ""}`} />
        )}
      </Link>

      {hasChildren && open && (
        <DropdownPortal item={item} anchorRect={anchorRect} onClose={() => setOpen(false)} />
      )}
    </li>
  );
}

// ─────────────────────────────────────────────────────────────
//  MOBILE: Accordion item (handles all nesting depths)
// ─────────────────────────────────────────────────────────────
function MobileAccordion({ item, depth = 0, onClose }) {
  const [open, setOpen] = useState(false);
  const hasChildren = item.children?.length > 0;

  const paddingLeft = depth === 0 ? "px-3" : depth === 1 ? "px-6" : "px-9";
  const textSize = depth === 0 ? "text-sm font-semibold" : "text-sm";
  const bg = depth === 0 ? "" : depth === 1 ? "bg-slate-50" : "bg-slate-100";

  return (
    <div className={bg}>
      {hasChildren ? (
        <>
          <button
            onClick={() => setOpen((v) => !v)}
            className={`w-full flex items-center justify-between ${paddingLeft} py-2.5 ${textSize} text-slate-800 hover:text-[#1a1a6c] transition-colors`}
          >
            <span>{item.label}</span>
            <ChevronDown
              className={`w-4 h-4 mr-1 text-slate-400 transition-transform duration-200 flex-shrink-0 ${open ? "rotate-180" : ""}`}
            />
          </button>
          {open && (
            <div className="border-l-2 border-[#1a1a6c]/20 ml-3">
              {item.children.map((child) => (
                <MobileAccordion key={child.to} item={child} depth={depth + 1} onClose={onClose} />
              ))}
            </div>
          )}
        </>
      ) : (
        <Link
          to={item.to}
          onClick={onClose}
          className={`block ${paddingLeft} py-2.5 ${textSize} text-slate-700 hover:text-[#1a1a6c] transition-colors`}
        >
          {item.label}
        </Link>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  HEADER
// ─────────────────────────────────────────────────────────────
export default function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearch = useCallback(
    (e) => {
      e.preventDefault();
      if (searchQuery.trim()) {
        navigate(`/ara-urun?q=${encodeURIComponent(searchQuery.trim())}`);
        setSearchQuery("");
      }
    },
    [searchQuery, navigate]
  );

  const closeMobile = () => setMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 overflow-visible">

      {/* ── Top bar ─────────────────────────────────────────── */}
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
              href="tel:+905396981753"
              className="flex items-center gap-1 hover:text-blue-300 transition-colors"
              data-testid="phone-link-2"
            >
              <Phone className="w-3 h-3" />
              <span className="hidden sm:inline">+90 539 698 17 53</span>
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

      {/* ── Main header ─────────────────────────────────────── */}
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

              {/* ── Mobile Drawer ────────────────────────────── */}
              <SheetContent side="left" className="w-80 bg-white p-0 flex flex-col">
                <div className="p-4 bg-[#1a1a6c] flex-shrink-0">
                  <img src={LOGO_URL} alt="zenXteknoloji" className="h-10 object-contain" />
                </div>

                {/* Mobile search */}
                <div className="p-4 border-b flex-shrink-0">
                  <form onSubmit={(e) => { handleSearch(e); closeMobile(); }}>
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
                </div>

                {/* Mobile nav — scrollable */}
                <nav className="overflow-y-auto flex-1 divide-y divide-slate-100">
                  {STATIC_MENU_ITEMS.map((item) => (
                    <MobileAccordion key={item.to} item={item} depth={0} onClose={closeMobile} />
                  ))}
                </nav>

                {/* Contact info */}
                <div className="p-4 border-t bg-slate-50 flex-shrink-0">
                  <p className="text-xs text-slate-500 mb-2 font-semibold uppercase tracking-wide">İletişim</p>
                  {["+90 506 139 57 26", "+90 541 120 26 26", "+90 539 698 17 53"].map((num) => (
                    <a
                      key={num}
                      href={`tel:${num.replace(/\s/g, "")}`}
                      className="flex items-center gap-2 text-sm py-1 text-slate-700 hover:text-[#1a1a6c]"
                    >
                      <Phone className="w-3 h-3" /> {num}
                    </a>
                  ))}
                </div>
              </SheetContent>
            </Sheet>

            {/* Logo */}
            <Link to="/" className="flex-shrink-0" data-testid="logo-link">
              <img src={LOGO_URL} alt="zenXteknoloji" className="h-10 md:h-12 object-contain" />
            </Link>

            {/* Desktop search */}
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

            {/* Quick phone — Desktop */}
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

          {/* Mobile search bar */}
          <form onSubmit={handleSearch} className="md:hidden mt-4">
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

      {/* ── Desktop nav bar ──────────────────────────────────── */}
      <nav className="hidden lg:block bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 overflow-visible">
          <ul className="flex items-center gap-1 py-2 flex-wrap">
            {STATIC_MENU_ITEMS.map((item) => (
              <NavItem key={item.to} item={item} />
            ))}
          </ul>
        </div>
      </nav>
    </header>
  );
}
