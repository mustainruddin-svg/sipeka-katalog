import { useState, useEffect, useRef } from "react";
import { ShoppingCart, MapPin, Phone, Clock, Search, X, ShoppingBag } from "lucide-react";

const COLORS = {
  primary: "#0D9FD9",
  primaryDark: "#0A7FAE",
  primaryLight: "#E8F6FC",
  primaryGlow: "rgba(13, 159, 217, 0.15)",
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
      {/* Image */}
      <div
        className="relative overflow-hidden flex items-center justify-center"
        style={{
          height: 140,
          background: `linear-gradient(135deg, ${COLORS.primaryLight} 0%, #dff2fb 100%)`,
        }}
      >
        {hasPhoto ? (
          <img
            src={product.foto}
            alt={product.nama}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
            style={{ transition: "transform 0.3s" }}
            onMouseEnter={e => (e.target.style.transform = "scale(1.06)")}
            onMouseLeave={e => (e.target.style.transform = "scale(1)")}
          />
        ) : (
          <span style={{ fontSize: 52, lineHeight: 1 }}>{product.fallback}</span>
        )}
        {/* Category badge */}
        <span
          className="absolute top-2 left-2 text-xs font-semibold px-2 py-1 rounded-full"
          style={{ background: COLORS.primary, color: COLORS.white, letterSpacing: "0.03em" }}
        >
          {CAT_ICONS[product.kategori]} {product.kategori}
        </span>
      </div>

      {/* Info */}
      <div className="flex flex-col flex-1 p-3 gap-2">
        <p
          className="font-bold text-sm leading-snug line-clamp-2"
          style={{ color: COLORS.textDark, minHeight: 36 }}
        >
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
              boxShadow: added ? "0 2px 8px rgba(34,197,94,0.3)" : `0 2px 8px ${COLORS.shadow}`,
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
    <div style={{ background: COLORS.offWhite, minHeight: "100vh", fontFamily: "'Nunito', 'Segoe UI', sans-serif" }}>

      {/* ── HEADER ── */}
      <header
        className="sticky top-0 z-50"
        style={{
          background: COLORS.white,
          borderBottom: `1px solid ${COLORS.border}`,
          boxShadow: `0 2px 16px ${COLORS.shadow}`,
        }}
      >
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <div
            className="flex items-center justify-center rounded-xl w-10 h-10 shrink-0"
            style={{ background: COLORS.primary }}
          >
            <ShoppingBag size={20} color="#fff" />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-extrabold leading-none tracking-wide" style={{ color: COLORS.primary }}>
              SiPEKA
            </h1>
            <p className="text-xs" style={{ color: COLORS.textLight }}>Mini Market Yayasan Ar-Rahmah</p>
          </div>

          {/* Search toggle */}
          <button
            onClick={() => { setShowSearch(s => !s); if (showSearch) setQuery(""); }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: showSearch ? COLORS.primary : COLORS.primaryLight,
              color: showSearch ? COLORS.white : COLORS.primary,
              border: `1.5px solid ${COLORS.border}`,
            }}
          >
            {showSearch ? <X size={16} /> : <Search size={16} />}
            <span className="hidden sm:inline">{showSearch ? "Tutup" : "Cari"}</span>
          </button>

          {/* Cart */}
          <div
            className="relative flex items-center justify-center w-10 h-10 rounded-xl cursor-pointer"
            style={{ background: COLORS.primaryLight }}
            onClick={() => alert(`Keranjang: ${cartCount} item`)}
          >
            <ShoppingCart size={20} style={{ color: COLORS.primary }} />
            {cartCount > 0 && (
              <span
                className="absolute -top-1 -right-1 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center"
                style={{ background: "#ef4444", color: "#fff" }}
              >
                {cartCount}
              </span>
            )}
          </div>
        </div>

        {/* Expandable search bar */}
        <div
          style={{
            maxHeight: showSearch ? 72 : 0,
            overflow: "hidden",
            transition: "max-height 0.3s ease",
            borderTop: showSearch ? `1px solid ${COLORS.border}` : "none",
          }}
        >
          <div className="max-w-5xl mx-auto px-4 py-3">
            <div
              className="flex items-center gap-2 rounded-xl px-3 py-2"
              style={{ background: COLORS.primaryLight, border: `1.5px solid ${COLORS.border}` }}
            >
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
              {query && (
                <button onClick={() => setQuery("")}>
                  <X size={16} style={{ color: COLORS.textLight }} />
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section
        style={{
          background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryDark} 100%)`,
          padding: "40px 16px 48px",
        }}
      >
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 text-white space-y-4">
              <div
                className="inline-block text-xs font-bold px-3 py-1 rounded-full mb-2"
                style={{ background: "rgba(255,255,255,0.2)", letterSpacing: "0.08em" }}
              >
                🛍️ KATALOG ONLINE
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold leading-tight">
                Belanja Mudah,<br />
                <span style={{ color: "#BEE9FA" }}>Harga Bersahabat</span>
              </h2>
              <p style={{ color: "rgba(255,255,255,0.82)", fontSize: 15 }}>
                Kebutuhan sehari-hari lengkap tersedia di Mini Market Yayasan Ar-Rahmah Sulawesi.
              </p>
              <div className="space-y-2 pt-2">
                {[
                  [<MapPin size={15} />, "Jl. Pendidikan No. 45, Makassar, Sulsel"],
                  [<Phone size={15} />, "+62 812-3456-7890"],
                  [<Clock size={15} />, "Senin – Sabtu, 08.00 – 17.00"],
                ].map(([icon, text], i) => (
                  <div key={i} className="flex items-center gap-2 text-sm" style={{ color: "rgba(255,255,255,0.88)" }}>
                    <span style={{ color: "#BEE9FA" }}>{icon}</span> {text}
                  </div>
                ))}
              </div>
              <button
                className="mt-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all"
                style={{ background: COLORS.white, color: COLORS.primary, boxShadow: "0 4px 16px rgba(0,0,0,0.15)" }}
                onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.04)")}
                onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
              >
                📲 Hubungi via WhatsApp
              </button>
            </div>
            <div className="flex gap-3 md:flex-col">
              {[["🛍️", products.length, "Produk"], ["📦", CATEGORIES.length - 1, "Kategori"]].map(([icon, val, label]) => (
                <div
                  key={label}
                  className="rounded-2xl px-5 py-4 text-center"
                  style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)" }}
                >
                  <div style={{ fontSize: 28 }}>{icon}</div>
                  <div className="text-2xl font-extrabold text-white">{val}</div>
                  <div className="text-xs" style={{ color: "#BEE9FA" }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CATEGORY TABS ── */}
      <div
        className="sticky z-40"
        style={{ top: 64, background: COLORS.white, borderBottom: `1px solid ${COLORS.border}`, boxShadow: `0 2px 8px ${COLORS.shadow}` }}
      >
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto py-3 scrollbar-hide">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className="flex items-center gap-1.5 whitespace-nowrap px-4 py-2 rounded-xl text-sm font-bold transition-all shrink-0"
                style={{
                  background: category === cat ? COLORS.primary : COLORS.primaryLight,
                  color: category === cat ? COLORS.white : COLORS.primary,
                  border: `1.5px solid ${category === cat ? COLORS.primary : COLORS.border}`,
                }}
              >
                <span>{CAT_ICONS[cat]}</span> {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── PRODUCT GRID ── */}
      <main className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold" style={{ color: COLORS.textMid }}>
            {query
              ? <>Hasil "<span style={{ color: COLORS.primary }}>{query}</span>" — {filtered.length} produk</>
              : <>{filtered.length} produk {category !== "Semua" ? `· ${category}` : "tersedia"}</>
            }
          </p>
          {(query || category !== "Semua") && (
            <button
              onClick={() => { setQuery(""); setCategory("Semua"); setShowSearch(false); }}
              className="text-xs font-bold px-2 py-1 rounded-lg"
              style={{ color: COLORS.primary, background: COLORS.primaryLight }}
            >
              Reset
            </button>
          )}
        </div>

        {filtered.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map(p => (
              <ProductCard key={p.id} product={p} onAdd={handleAdd} added={!!added[p.id]} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div style={{ fontSize: 56 }}>🔍</div>
            <p className="mt-4 text-lg font-bold" style={{ color: COLORS.textMid }}>Produk tidak ditemukan</p>
            <p className="text-sm mt-1" style={{ color: COLORS.textLight }}>Coba kata kunci lain atau reset filter</p>
            <button
              onClick={() => { setQuery(""); setCategory("Semua"); setShowSearch(false); }}
              className="mt-4 px-5 py-2 rounded-xl font-bold text-sm"
              style={{ background: COLORS.primary, color: COLORS.white }}
            >
              Reset Pencarian
            </button>
          </div>
        )}
      </main>

      {/* ── FOOTER ── */}
      <footer className="mt-8" style={{ background: COLORS.textDark, borderTop: `3px solid ${COLORS.primary}` }}>
        <div className="max-w-5xl mx-auto px-4 py-8 grid md:grid-cols-3 gap-6">
          <div>
            <h3 className="font-extrabold text-lg mb-1" style={{ color: COLORS.primary }}>SiPEKA</h3>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
              Mini Market Yayasan Ar-Rahmah Sulawesi — Melayani dengan sepenuh hati.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-3 text-sm" style={{ color: COLORS.primary }}>Kontak</h4>
            <ul className="space-y-1 text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>
              <li>📞 +62 812-3456-7890</li>
              <li>📧 sipeka@ar-rahmah.id</li>
              <li>📍 Makassar, Sulawesi Selatan</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-3 text-sm" style={{ color: COLORS.primary }}>Ikuti Kami</h4>
            <div className="flex gap-3 text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>
              <span className="cursor-pointer hover:text-white transition-colors">📘 Facebook</span>
              <span className="cursor-pointer hover:text-white transition-colors">📷 Instagram</span>
            </div>
          </div>
        </div>
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <p className="text-center py-3 text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
            © 2024 SiPEKA — Yayasan Ar-Rahmah Sulawesi
          </p>
        </div>
      </footer>
    </div>
  );
}
