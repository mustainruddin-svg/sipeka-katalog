import React, { useState, useEffect, useRef } from "react";
import { ShoppingCart, MapPin, Phone, Clock, Search, X, ShoppingBag } from "lucide-react";

const SHEET_PRODUK = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTN-i7uccs5AYhQP4Q2ME4TxDoCqVRYkDxVDx34ergpsFk6PHjnAHjgQfpuqH-zG3rxoGRMhWw8oinY/pub?gid=0&single=true&output=csv";
const SHEET_KATEGORI = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTN-i7uccs5AYhQP4Q2ME4TxDoCqVRYkDxVDx34ergpsFk6PHjnAHjgQfpuqH-zG3rxoGRMhWw8oinY/pub?gid=8050395&single=true&output=csv";

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

function parseCSV(text) {
  const lines = text.trim().split("\n");
  const headers = lines[0].split(",").map(h => h.trim().replace(/"/g, ""));
  return lines.slice(1).map((line, i) => {
    const values = line.split(",").map(v => v.trim().replace(/"/g, ""));
    const obj = {};
    headers.forEach((h, idx) => { obj[h] = values[idx] || ""; });
    return obj;
  }).filter(o => Object.values(o).some(v => v));
}

function formatRupiah(n) {
  return "Rp " + n.toLocaleString("id-ID");
}

function ProductCard({ product, catIcons, onAdd, added }) {
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
          <span style={{ fontSize: 52, lineHeight: 1 }}>{product.fallback || "📦"}</span>
        )}
        <span
          className="absolute top-2 left-2 text-xs font-semibold px-2 py-1 rounded-full"
          style={{ background: COLORS.primary, color: COLORS.white }}
        >
          {catIcons[product.kategori] || "📦"} {product.kategori}
        </span>
      </div>

      <div className="flex flex-col flex-1 p-3 gap-2">
        <p className="font-bold text-sm leading-snug line-clamp-2" style={{ color: COLORS.textDark, minHeight: 36 }}>
          {product.nama}
        </p>
        <div className="flex items-center justify-between mt-auto">
          <span className="font-extrabold text-base" style={{ color: COLORS.primary }}>
            {formatRupiah(parseInt(product.harga) || 0)}
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
  const [products, setProducts]     = useState([]);
  const [categories, setCategories] = useState([]);
  const [catIcons, setCatIcons]     = useState({});
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [query, setQuery]           = useState("");
  const [category, setCategory]     = useState("Semua");
  const [cartCount, setCartCount]   = useState(0);
  const [added, setAdded]           = useState({});
  const [showSearch, setShowSearch] = useState(false);
  const searchRef = useRef(null);

  // Fetch produk & kategori sekaligus
  useEffect(() => {
    Promise.all([
      fetch(SHEET_PRODUK).then(r => r.text()),
      fetch(SHEET_KATEGORI).then(r => r.text()),
    ])
      .then(([produkCSV, kategoriCSV]) => {
        // Parse produk
        const produkData = parseCSV(produkCSV).map((p, i) => ({
          id: i + 1,
          nama: p.nama || "",
          harga: parseInt(p.harga) || 0,
          kategori: p.kategori || "",
          foto: p.foto || "",
          fallback: p.fallback || "📦",
        })).filter(p => p.nama);

        // Parse kategori
        const kategoriData = parseCSV(kategoriCSV);
        const icons = {};
        kategoriData.forEach(k => { if (k.nama) icons[k.nama] = k.icon || "📦"; });

        const catList = ["Semua", ...kategoriData.map(k => k.nama).filter(Boolean)];

        setProducts(produkData);
        setCategories(catList);
        setCatIcons({ Semua: "🛒", ...icons });
        setLoading(false);
      })
      .catch(() => {
        setError("Gagal memuat data. Periksa koneksi internet Anda.");
        setLoading(false);
      });
  }, []);

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
                Kebutuhan sehari-hari lengkap tersedia di Mini Market Yayasan Ar-Rahmah Sulawesi.
              </p>
              <div className="space-y-2 pt-2">
                {[
                  [<MapPin size={15} />, "Jl. Pajjaiang No. 39, Berua, Biringkanaya, Makassar, Sulsel"],
                  [<Phone size={15} />, "+62 823-4383-6303"],
                  [<Clock size={15} />, "Senin – Sabtu, 08.00 – 17.00"],
                ].map(([icon, text], i) => (
                  <div key={i} className="flex items-center gap-2 text-sm" style={{ color: "rgba(255,255,255,0.88)" }}>
                    <span style={{ color: "#BEE9FA" }}>{icon}</span> {text}
                  </div>
                ))}
              </div>
              <button
                className="mt-2 px-6 py-2.5 rounded-xl font-bold text-sm"
                style={{ background: COLORS.white, color: COLORS.primary }}
              >
                📲 Hubungi via WhatsApp
              </button>
            </div>
            <div className="flex gap-3 md:flex-col">
              {[["🛍️", products.length || 0, "Produk"], ["📦", categories.length > 1 ? categories.length - 1 : 0, "Kategori"]].map(([icon, val, label]) => (
                <div key={label} className="rounded-2xl px-5 py-4 text-center" style={{ background: "rgba(255,255,255,0.15)" }}>
                  <div style={{ fontSize: 28 }}>{icon}</div>
                  <div className="text-2xl font-extrabold text-white">{val}</div>
                  <div className="text-xs" style={{ color: "#BEE9FA" }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORY TABS */}
      <div className="sticky z-40" style={{ top: 64, background: COLORS.white, borderBottom: `1px solid ${COLORS.border}`, boxShadow: `0 2px 8px ${COLORS.shadow}` }}>
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto py-3 scrollbar-hide">
            {categories.map(cat => (
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
                <span>{catIcons[cat] || "📦"}</span> {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* PRODUCT GRID */}
      <main className="max-w-5xl mx-auto px-4 py-6">
        {loading && (
          <div className="text-center py-20">
            <div className="text-5xl animate-spin inline-block">⏳</div>
            <p className="mt-4 font-bold" style={{ color: COLORS.textMid }}>Memuat produk...</p>
          </div>
        )}
        {error && (
          <div className="text-center py-20">
            <div style={{ fontSize: 56 }}>⚠️</div>
            <p className="mt-4 font-bold" style={{ color: COLORS.textMid }}>{error}</p>
          </div>
        )}
        {!loading && !error && (
          <>
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
                  <ProductCard key={p.id} product={p} catIcons={catIcons} onAdd={handleAdd} added={!!added[p.id]} />
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
          </>
        )}
      </main>

      {/* FOOTER */}
      <footer className="mt-8" style={{ background: COLORS.textDark, borderTop: `3px solid ${COLORS.primary}` }}>
        <div className="max-w-5xl mx-auto px-4 py-8 grid md:grid-cols-3 gap-6">
          <div>
            <h3 className="font-extrabold text-lg mb-1" style={{ color: COLORS.primary }}>SiPEKA</h3>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>Mini Market Yayasan Ar-Rahmah Sulawesi — Melayani dengan sepenuh hati.</p>
          </div>
          <div>
            <h4 className="font-bold mb-3 text-sm" style={{ color: COLORS.primary }}>Kontak</h4>
            <ul className="space-y-1 text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>
              <li>📞 +62 823-4383-6303</li>
              <li>📧 sipeka@ar-rahmah.id</li>
              <li>📍 Jl. Pajjaiang No. 39 Kel. Berua, Kec. Biringkanaya, Makassar, Sulawesi Selatan</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-3 text-sm" style={{ color: COLORS.primary }}>Ikuti Kami</h4>
            <div className="flex gap-3 text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>
              <span className="cursor-pointer hover:text-white">📘 Facebook</span>
              <span className="cursor-pointer hover:text-white">📷 Instagram</span>
            </div>
          </div>
        </div>
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <p className="text-center py-3 text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>© 2024 SiPEKA — Yayasan Ar-Rahmah Sulawesi</p>
        </div>
      </footer>
    </div>
  );
}
