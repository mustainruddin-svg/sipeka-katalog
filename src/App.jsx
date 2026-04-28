import React, { useState, useEffect, useRef } from "react";
import { MapPin, Phone, Clock, Search, X, ShoppingBag, ZoomIn } from "lucide-react";

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

const WA_NUMBER = "6282343836303";

function parseCSV(text) {
  const lines = text.trim().split("\n");
  const headers = lines[0].split(",").map(h => h.trim().replace(/"/g, ""));
  return lines.slice(1).map((line) => {
    const values = line.split(",").map(v => v.trim().replace(/"/g, ""));
    const obj = {};
    headers.forEach((h, idx) => { obj[h] = values[idx] || ""; });
    return obj;
  }).filter(o => Object.values(o).some(v => v));
}

function formatRupiah(n) {
  return "Rp " + n.toLocaleString("id-ID");
}

// ── POPUP DETAIL PRODUK ──────────────────────────────────
function ProductModal({ product, catIcons, onClose }) {
  const [imgError, setImgError] = useState(false);
  const hasPhoto = product.foto && !imgError;
  const habis = product.stok === "habis";

  useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(13, 45, 61, 0.7)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm rounded-3xl overflow-hidden"
        style={{
          background: COLORS.white,
          boxShadow: "0 24px 60px rgba(13,45,61,0.3)",
          animation: "popIn 0.25s ease",
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Tombol Tutup */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full"
          style={{ background: "rgba(0,0,0,0.35)", color: "#fff" }}
        >
          <X size={16} />
        </button>

        {/* Foto Produk */}
        <div
          className="relative flex items-center justify-center"
          style={{
            height: 260,
            background: habis
              ? "linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%)"
              : `linear-gradient(135deg, ${COLORS.primaryLight} 0%, #dff2fb 100%)`,
          }}
        >
          {hasPhoto ? (
            <img
              src={product.foto}
              alt={product.nama}
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
              style={{ filter: habis ? "grayscale(100%)" : "none" }}
            />
          ) : (
            <span style={{
              fontSize: 90,
              filter: habis ? "grayscale(100%)" : "none",
              opacity: habis ? 0.5 : 1,
            }}>
              {product.fallback || "📦"}
            </span>
          )}

          {/* Label HABIS di popup */}
          {habis && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span
                className="px-6 py-2 rounded-full text-white font-extrabold text-lg tracking-widest"
                style={{ background: "rgba(0,0,0,0.55)", letterSpacing: "0.15em" }}
              >
                HABIS
              </span>
            </div>
          )}
        </div>

        {/* Info Produk */}
        <div className="p-5 space-y-3">
          {/* Badge Kategori + Stok */}
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="inline-block text-xs font-bold px-3 py-1 rounded-full"
              style={{ background: COLORS.primaryLight, color: COLORS.primary }}
            >
              {catIcons[product.kategori] || "📦"} {product.kategori}
            </span>
            {habis && (
              <span
                className="inline-block text-xs font-bold px-3 py-1 rounded-full"
                style={{ background: "#fee2e2", color: "#dc2626" }}
              >
                ⛔ Stok Habis
              </span>
            )}
            {!habis && (
              <span
                className="inline-block text-xs font-bold px-3 py-1 rounded-full"
                style={{ background: "#dcfce7", color: "#16a34a" }}
              >
                ✅ Tersedia
              </span>
            )}
          </div>

          {/* Nama */}
          <h2 className="text-xl font-extrabold leading-snug" style={{ color: habis ? "#9ca3af" : COLORS.textDark }}>
            {product.nama}
          </h2>

          {/* Harga */}
          <div
            className="flex items-center justify-between p-3 rounded-2xl"
            style={{ background: habis ? "#f3f4f6" : COLORS.primaryLight }}
          >
            <span className="text-sm font-semibold" style={{ color: COLORS.textMid }}>Harga</span>
            <span className="text-2xl font-extrabold" style={{ color: habis ? "#9ca3af" : COLORS.primary }}>
              {formatRupiah(parseInt(product.harga) || 0)}
            </span>
          </div>

          <p className="text-center text-xs" style={{ color: COLORS.textLight }}>
            Klik di luar atau tekan ESC untuk tutup
          </p>
        </div>
      </div>

      <style>{`
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.92) translateY(16px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}

// ── CARD PRODUK ──────────────────────────────────────────
function ProductCard({ product, catIcons, onClick }) {
  const [imgError, setImgError] = useState(false);
  const hasPhoto = product.foto && !imgError;
  const habis = product.stok === "habis";

  return (
    <div
      className="rounded-2xl overflow-hidden flex flex-col cursor-pointer"
      style={{
        background: COLORS.cardBg,
        border: `1.5px solid ${habis ? "#e5e7eb" : COLORS.border}`,
        boxShadow: `0 4px 20px ${COLORS.shadow}`,
        transition: "transform 0.2s, box-shadow 0.2s",
        opacity: habis ? 0.85 : 1,
      }}
      onClick={onClick}
      onMouseEnter={e => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = `0 12px 32px ${COLORS.shadow}`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = `0 4px 20px ${COLORS.shadow}`;
      }}
    >
      {/* Foto */}
      <div
        className="relative overflow-hidden flex items-center justify-center group"
        style={{
          height: 140,
          background: habis
            ? "linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%)"
            : `linear-gradient(135deg, ${COLORS.primaryLight} 0%, #dff2fb 100%)`,
        }}
      >
        {hasPhoto ? (
          <img
            src={product.foto}
            alt={product.nama}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
            style={{
              transition: "transform 0.3s",
              filter: habis ? "grayscale(100%)" : "none",
            }}
          />
        ) : (
          <span style={{
            fontSize: 52,
            lineHeight: 1,
            filter: habis ? "grayscale(100%)" : "none",
            opacity: habis ? 0.5 : 1,
          }}>
            {product.fallback || "📦"}
          </span>
        )}

        {/* Badge kategori — sembunyikan kalau habis */}
        {!habis && (
          <span
            className="absolute top-2 left-2 text-xs font-semibold px-2 py-1 rounded-full"
            style={{ background: COLORS.primary, color: COLORS.white }}
          >
            {catIcons[product.kategori] || "📦"} {product.kategori}
          </span>
        )}

        {/* Label HABIS */}
        {habis && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1"
            style={{ background: "rgba(0,0,0,0.35)" }}>
            <span
              className="px-4 py-1.5 rounded-full text-white font-extrabold text-sm tracking-widest"
              style={{ background: "rgba(0,0,0,0.6)", letterSpacing: "0.12em" }}
            >
              HABIS
            </span>
          </div>
        )}

        {/* Overlay hint (hanya kalau ada stok) */}
        {!habis && (
          <div
            className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ background: "rgba(13,159,217,0.15)" }}
          >
            <div
              className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold text-white"
              style={{ background: "rgba(13,159,217,0.85)" }}
            >
              <ZoomIn size={13} /> Lihat Detail
            </div>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col flex-1 p-3 gap-1">
        <p
          className="font-bold text-sm leading-snug line-clamp-2"
          style={{ color: habis ? "#9ca3af" : COLORS.textDark, minHeight: 36 }}
        >
          {product.nama}
        </p>
        <div className="mt-auto pt-1 flex items-center justify-between">
          <span
            className="font-extrabold text-base"
            style={{ color: habis ? "#9ca3af" : COLORS.primary }}
          >
            {formatRupiah(parseInt(product.harga) || 0)}
          </span>
          {habis && (
            <span className="text-xs font-bold px-2 py-0.5 rounded-full"
              style={{ background: "#fee2e2", color: "#dc2626" }}>
              Habis
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ── MAIN APP ─────────────────────────────────────────────
export default function SipekaKatalog() {
  const [products, setProducts]        = useState([]);
  const [categories, setCategories]    = useState([]);
  const [catIcons, setCatIcons]        = useState({});
  const [loading, setLoading]          = useState(true);
  const [error, setError]              = useState(null);
  const [query, setQuery]              = useState("");
  const [category, setCategory]        = useState("Semua");
  const [showSearch, setShowSearch]    = useState(false);
  const [selectedProduct, setSelected] = useState(null);
  const searchRef = useRef(null);

  useEffect(() => {
    const ts = Date.now();
    Promise.all([
      fetch(`https://docs.google.com/spreadsheets/d/e/2PACX-1vTN-i7uccs5AYhQP4Q2ME4TxDoCqVRYkDxVDx34ergpsFk6PHjnAHjgQfpuqH-zG3rxoGRMhWw8oinY/pub?gid=0&single=true&output=csv&t=${ts}`).then(r => r.text()),
      fetch(`https://docs.google.com/spreadsheets/d/e/2PACX-1vTN-i7uccs5AYhQP4Q2ME4TxDoCqVRYkDxVDx34ergpsFk6PHjnAHjgQfpuqH-zG3rxoGRMhWw8oinY/pub?gid=8050395&single=true&output=csv&t=${ts}`).then(r => r.text()),
    ])
      .then(([produkCSV, kategoriCSV]) => {
        const produkData = parseCSV(produkCSV).map((p, i) => ({
          id: i + 1,
          nama: p.nama || "",
          harga: parseInt(p.harga) || 0,
          kategori: p.kategori || "",
          foto: p.foto || "",
          fallback: p.fallback || "📦",
          stok: p.stok || "ada",
        })).filter(p => p.nama);

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

  useEffect(() => {
    if (showSearch && searchRef.current) searchRef.current.focus();
  }, [showSearch]);

  const waLink = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent("Halo SiPEKA, saya ingin memesan produk")}`;

  const WaIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );

  return (
    <div style={{ background: COLORS.offWhite, minHeight: "100vh" }}>

      {/* POPUP MODAL */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          catIcons={catIcons}
          onClose={() => setSelected(null)}
        />
      )}

      {/* HEADER */}
      <header className="sticky top-0 z-40" style={{ background: COLORS.white, borderBottom: `1px solid ${COLORS.border}`, boxShadow: `0 2px 16px ${COLORS.shadow}` }}>
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
          <a href={waLink} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center w-10 h-10 rounded-xl"
            style={{ background: "#25D366" }}>
            <WaIcon />
          </a>
        </div>
        <div style={{ maxHeight: showSearch ? 72 : 0, overflow: "hidden", transition: "max-height 0.3s ease", borderTop: showSearch ? `1px solid ${COLORS.border}` : "none" }}>
          <div className="max-w-5xl mx-auto px-4 py-3">
            <div className="flex items-center gap-2 rounded-xl px-3 py-2" style={{ background: COLORS.primaryLight, border: `1.5px solid ${COLORS.border}` }}>
              <Search size={18} style={{ color: COLORS.primary, flexShrink: 0 }} />
              <input ref={searchRef} type="text" value={query} onChange={e => setQuery(e.target.value)}
                placeholder="Cari nama produk atau kategori..."
                className="flex-1 bg-transparent outline-none text-sm" style={{ color: COLORS.textDark }} />
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
              <a href={waLink} target="_blank" rel="noopener noreferrer"
                className="inline-block mt-2 px-6 py-2.5 rounded-xl font-bold text-sm"
                style={{ background: COLORS.white, color: COLORS.primary }}>
                📲 Hubungi via WhatsApp
              </a>
            </div>
            <div className="flex gap-3 md:flex-col">
              {[
                ["🛍️", products.length || 0, "Produk"],
                ["📦", categories.length > 1 ? categories.length - 1 : 0, "Kategori"],
              ].map(([icon, val, label]) => (
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
      <div className="sticky z-30" style={{ top: 64, background: COLORS.white, borderBottom: `1px solid ${COLORS.border}`, boxShadow: `0 2px 8px ${COLORS.shadow}` }}>
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto py-3 scrollbar-hide">
            {categories.map(cat => (
              <button key={cat} onClick={() => setCategory(cat)}
                className="flex items-center gap-1.5 whitespace-nowrap px-4 py-2 rounded-xl text-sm font-bold transition-all shrink-0"
                style={{ background: category === cat ? COLORS.primary : COLORS.primaryLight, color: category === cat ? COLORS.white : COLORS.primary, border: `1.5px solid ${category === cat ? COLORS.primary : COLORS.border}` }}>
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
                <button onClick={() => { setQuery(""); setCategory("Semua"); setShowSearch(false); }}
                  className="text-xs font-bold px-2 py-1 rounded-lg"
                  style={{ color: COLORS.primary, background: COLORS.primaryLight }}>
                  Reset
                </button>
              )}
            </div>
            {filtered.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {filtered.map(p => (
                  <ProductCard key={p.id} product={p} catIcons={catIcons} onClick={() => setSelected(p)} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div style={{ fontSize: 56 }}>🔍</div>
                <p className="mt-4 text-lg font-bold" style={{ color: COLORS.textMid }}>Produk tidak ditemukan</p>
                <p className="text-sm mt-1" style={{ color: COLORS.textLight }}>Coba kata kunci lain atau reset filter</p>
                <button onClick={() => { setQuery(""); setCategory("Semua"); setShowSearch(false); }}
                  className="mt-4 px-5 py-2 rounded-xl font-bold text-sm"
                  style={{ background: COLORS.primary, color: COLORS.white }}>
                  Reset Pencarian
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* FLOATING WA BUTTON */}
      <a href={waLink} target="_blank" rel="noopener noreferrer"
        className="fixed bottom-6 right-6 flex items-center gap-2 px-4 py-3 rounded-2xl font-bold text-sm text-white z-40"
        style={{ background: "#25D366", boxShadow: "0 4px 20px rgba(37,211,102,0.4)" }}>
        <WaIcon /> Pesan via WA
      </a>

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
