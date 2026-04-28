import React, { useState, useEffect, useRef } from "react";
import { ShoppingCart, MapPin, Phone, Clock, Search, X, ShoppingBag } from "lucide-react";

const COLORS = {
  primary: "#0D9FD9",
  primaryDark: "#0A7FAE",
  primaryLight: "#E8F6FC",
  white: "#FFFFFF",
  offWhite: "#F4FAFD",
  textDark: "#0D2D3D",
  textMid: "#3A6478",
  textLight: "#7AABB8",
  border: "rgba(13, 159, 217, 0.2)",
  cardBg: "#FFFFFF",
  shadow: "rgba(13, 159, 217, 0.12)",
};

const products = [
  { id: 1,  nama: "Gentel Gent",                 harga: 18000, kategori: "Minuman", foto: "", fallback: "🥛" },
  { id: 2,  nama: "Laurier Active Day",           harga: 18000, kategori: "Minuman", foto: "", fallback: "🥛" },
  { id: 3,  nama: "JS DOS Mineral",               harga: 19500, kategori: "Minuman", foto: "", fallback: "💧" },
  { id: 4,  nama: "Le Minira 1L",                 harga: 7000,  kategori: "Minuman", foto: "", fallback: "💧" },
  { id: 5,  nama: "Tepung Bumbu Serbaguna",        harga: 23000, kategori: "Makanan", foto: "", fallback: "🌾" },
  { id: 6,  nama: "Kecap Bango",                  harga: 25000, kategori: "Makanan", foto: "", fallback: "🍯" },
  { id: 7,  nama: "FULL CREAM Susu Kental Manis", harga: 20000, kategori: "Dairy",   foto: "", fallback: "🥛" },
  { id: 8,  nama: "SKM Frisian Flag",             harga: 14000, kategori: "Dairy",   foto: "", fallback: "🥛" },
  { id: 9,  nama: "Tissu Wajah Larissi",          harga: 29000, kategori: "Tissue",  foto: "", fallback: "📋" },
  { id: 10, nama: "Tissue Gulung Premium",         harga: 32000, kategori: "Tissue",  foto: "", fallback: "🧻" },
  { id: 11, nama: "Keripik Udang Rasa Bawang",    harga: 25000, kategori: "Snack",   foto: "", fallback: "🍤" },
  { id: 12, nama: "Mie Instant Goreng Ayam",      harga: 3500,  kategori: "Snack",   foto: "", fallback: "🍜" },
];

const CATEGORIES = ["Semua", "Minuman", "Makanan", "Dairy", "Tissue", "Snack"];
const CAT_ICONS = { Semua: "🛒", Minuman: "💧", Makanan: "🍽️", Dairy: "🥛", Tissue: "🧻", Snack: "🍜" };

function formatRupiah(n) {
  return "Rp " + n.toLocaleString("id-ID");
}

function ProductCard({ product, onAdd, added }) {
  const [imgError, setImgError] = useState(false);
  const hasPhoto = product.foto && !imgError;

  return (
    <div
      className="rounded-2xl overflow-hidden flex flex-col"
      style={{
        background: COLORS.cardBg,
        border: `1.5px solid ${COLORS.border}`,
        boxShadow: `0 4px 20px ${COLORS.shadow}`,
        transition: "transform 0.2s, box-shadow 0.2s",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = `0 12px 32px ${COLORS.shadow}`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = `0 4px 20px ${COLORS.shadow}`;
      }}
    >
      <div
        className="relative overflow-hidden flex items-center justify-center"
        style={{ height: 140, background: `linear-gradient(135deg, ${COLORS.primaryLight} 0%, #dff2fb 100%)` }}
      >
        {hasPhoto ? (
          <img
            src={product.foto}
            alt={product.nama}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
            style={{ transition: "transform 0.3s" }}
          />
        ) : (
          <span style={{ fontSize: 52, lineHeight: 1 }}>{product.fallback}</span>
        )}
        <span
          className="absolute top-2 left-2 text-xs font-semibold px-2 py-1 rounded-full"
          style={{ background: COLORS.primary, color: COLORS.white }}
        >
          {CAT_ICONS[product.kategori]} {product.kategori}
        </span>
      </div>

      <div className="flex flex-col flex-1 p-3 gap-2">
        <p className="font-bold text-sm leading-snug line-clamp-2" style={{ color: COLORS.textDark, minHeight: 36 }}>
          {product.nama}
        </p>
        <div className="flex items-center justify-between mt-auto">
          <span className="font-extrabold text-base" style={{ color: COLORS.primary }}>
            {formatRupiah(product.harga)}
          </span>
          <button
            onClick={() => onAdd(product.id)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
            style={{
              background: added ? "#22c55e" : COLORS.primary,
              color: COLORS.white,
              transform: added ? "scale(0.95)" : "scale(1)",
            }}
          >
            {added ? "✓ Ditambah" : "+ Tambah"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SipekaKatalog() {
  const [query, setQuery]           = useState("");
  const [category, setCategory]     = useState("Semua");
  const [cartCount, setCartCount]   = useState(0);
  const [added, setAdded]           = useState({});
  const [showSearch, setShowSearch] = useState(false);
  const searchRef = useRef(null);

  const filtered = products.filter(p => {
    const matchCat = category === "Semua" || p.kategori === category;
    const q = query.toLowerCase().trim();
    const matchQ = !q || p.nama.toLowerCase().includes(q) || p.kategori.toLowerCase().includes(q);
    return matchCat && matchQ;
  });

  const handleAdd = id => {
    setCartCount(c => c + 1);
    setAdded(a => ({ ...a, [id]: true }));
    setTimeout(() => setAdded(a => ({ ...a, [id]: false })), 1500);
  };

  useEffect(() => {
    if (showSearch && searchRef.current) searchRef.current.focus();
  }, [showSearch]);

  return (
    <div style={{ background: COLORS.offWhite, minHeight: "100vh" }}>

      {/* HEADER */}
      <header className="sticky top-0 z-50" style={{ background: COLORS.white, borderBottom: `1px solid ${COLORS.border}`, boxShadow: `0 2px 16px ${COLORS.shadow}` }}>
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="flex items-center justify-center rounded-xl w-10 h-10 shrink-0" style={{ background: COLORS.primary }}>
            <ShoppingBag size={20} color="#fff" />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-extrabold leading-none tracking-wide" style={{ color: COLORS.primary }}>SiPEKA</h1>
            <p className="text-xs" style={{ color: COLORS.textLight }}>Mini Market Yayasan Ar-Rahmah</p>
          </div>
          <button
            onClick={() => { setShowSearch(s => !s); if (showSearch) setQuery(""); }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all"
            style={{ background: showSearch ? COLORS.primary : COLORS.primaryLight, color: showSearch ? COLORS.white : COLORS.primary, border: `1.5px solid ${COLORS.border}` }}
          >
            {showSearch ? <X size={16} /> : <Search size={16} />}
            <span className="hidden sm:inline">{showSearch ? "Tutup" : "Cari"}</span>
          </button>
          <div
            className="relative flex items-center justify-center w-10 h-10 rounded-xl cursor-pointer"
            style={{ background: COLORS.primaryLight }}
            onClick={() => alert(`Keranjang: ${cartCount} item`)}
          >
            <ShoppingCart size={20} style={{ color: COLORS.primary }} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "#ef4444", color: "#fff" }}>
                {cartCount}
              </span>
            )}
          </div>
        </div>
        <div style={{ maxHeight: showSearch ? 72 : 0, overflow: "hidden", transition: "max-height 0.3s ease", borderTop: showSearch ? `1px solid ${COLORS.border}` : "none" }}>
          <div className="max-w-5xl mx-auto px-4 py-3">
            <div className="flex items-center gap-2 rounded-xl px-3 py-2" style={{ background: COLORS.primaryLight, border: `1.5px solid ${COLORS.border}` }}>
              <Search size={18} style={{ color: COLORS.primary, flexShrink: 0 }} />
              <input
                ref={searchRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Cari nama produk atau kategori..."
                className="flex-1 bg-transparent outline-none text-sm"
                style={{ color: COLORS.textDark }}
              />
              {query && <button onClick={() => setQuery("")}><X size={16} style={{ color: COLORS.textLight }} /></button>}
            </div>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section style={{ background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryDark} 100%)`, padding: "40px 16px 48px" }}>
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 text-white space-y-4">
              <div className="inline-block text-xs font-bold px-3 py-1 rounded-full mb-2" style={{ background: "rgba(255,255,255,0.2)" }}>
                🛍️ KATALOG ONLINE
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold leading-tight">
                Belanja Mudah,<br />
                <span style={{ color: "#BEE9FA" }}>Harga Bersahabat</span>
              </h2>
              <p style={{ color: "rgba(255,255,255,0.82)", fontSize: 15 }}>
                Kebutuhan sehari-hari lengkap tersedia di Mini Market Ya
