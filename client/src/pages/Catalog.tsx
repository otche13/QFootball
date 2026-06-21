import { useState } from "react";
import { useLocation } from "wouter";
import { Search, SlidersHorizontal, Heart, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { MobileShell } from "@/components/MobileShell";
import type { Product } from "@shared/schema";

const brands = ["Nike", "Adidas", "Puma", "Reebok", "ANTA", "Asics", "Salomon", "Mizuno"];
const ALL_SIZES = ["37", "37.5", "38", "38.5", "39", "39.5", "40", "40.5", "41", "42", "42.5", "43", "44", "44.5", "45", "46", "47"];
const PRICE_PRESETS = [
  { label: "до 5 000 ₽", min: 0, max: 5000 },
  { label: "5–10 000 ₽", min: 5000, max: 10000 },
  { label: "10–15 000 ₽", min: 10000, max: 15000 },
  { label: "от 15 000 ₽", min: 15000, max: Infinity },
];

function CatalogCard({ item, onClick }: { item: Product; onClick: () => void }) {
  const [fav, setFav] = useState(false);
  return (
    <article
      data-testid={`card-catalog-${item.id}`}
      className="w-[176px] cursor-pointer"
      onClick={onClick}
    >
      <div className="relative w-[176px] h-[110px] rounded-3xl overflow-hidden">
        <img src={item.images[0]} alt={item.name} className="absolute inset-0 w-full h-full object-cover" />
        <button
          className="absolute top-2 left-2 z-10"
          data-testid={`btn-fav-catalog-${item.id}`}
          onClick={(e) => { e.stopPropagation(); setFav((v) => !v); }}
        >
          <Heart size={18} strokeWidth={1.5} className={fav ? "text-red-500 fill-red-500" : "text-white drop-shadow"} />
        </button>
      </div>
      <div className="mt-3 px-1">
        <p className="text-[#3c3c3c] text-[18px] font-bold tracking-[-0.5px]">
          от {item.price.toLocaleString("ru-RU")} ₽
        </p>
        <p className="text-[#3c3c3c] text-[11px] font-medium mt-0.5 tracking-[-0.4px]">
          {item.name}
        </p>
      </div>
    </article>
  );
}

function SkeletonCard() {
  return (
    <div className="w-[176px]">
      <div className="w-[176px] h-[110px] bg-gray-200 rounded-3xl animate-pulse" />
      <div className="h-5 bg-gray-200 rounded mt-3 mx-1 animate-pulse" />
      <div className="h-3 bg-gray-100 rounded mt-1 mx-1 w-3/4 animate-pulse" />
    </div>
  );
}

interface Filters {
  brands: Set<string>;
  pricePreset: number | null;
  sizes: Set<string>;
}
const emptyFilters = (): Filters => ({ brands: new Set(), pricePreset: null, sizes: new Set() });

export function Catalog() {
  const [, navigate] = useLocation();
  const [search, setSearch] = useState("");
  const [activeBrand, setActiveBrand] = useState("Все");
  const [filterOpen, setFilterOpen] = useState(false);
  const [applied, setApplied] = useState<Filters>(emptyFilters());
  const [pending, setPending] = useState<Filters>(emptyFilters());

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const openFilter = () => {
    setPending({ brands: new Set(applied.brands), pricePreset: applied.pricePreset, sizes: new Set(applied.sizes) });
    setFilterOpen(true);
  };
  const applyFilter = () => {
    setApplied({ ...pending, brands: new Set(pending.brands), sizes: new Set(pending.sizes) });
    setFilterOpen(false);
  };
  const resetFilter = () => setPending(emptyFilters());

  const toggleBrand = (b: string) => setPending(p => { const s = new Set(p.brands); s.has(b) ? s.delete(b) : s.add(b); return { ...p, brands: s }; });
  const toggleSize = (s: string) => setPending(p => { const set = new Set(p.sizes); set.has(s) ? set.delete(s) : set.add(s); return { ...p, sizes: set }; });
  const setPrice = (i: number | null) => setPending(p => ({ ...p, pricePreset: p.pricePreset === i ? null : i }));

  const priceRange = applied.pricePreset !== null ? PRICE_PRESETS[applied.pricePreset] : null;
  const q = search.trim().toLowerCase();

  const visibleItems = (products ?? []).filter((item) => {
    if (q && !item.name.toLowerCase().includes(q) && !item.brand.toLowerCase().includes(q)) return false;
    if (activeBrand !== "Все" && item.brand !== activeBrand) return false;
    if (applied.brands.size > 0 && !applied.brands.has(item.brand)) return false;
    if (priceRange && (item.price < priceRange.min || item.price > priceRange.max)) return false;
    if (applied.sizes.size > 0 && !item.sizes.some((s) => applied.sizes.has(s))) return false;
    return true;
  });

  const activeFilterCount = applied.brands.size + (applied.pricePreset !== null ? 1 : 0) + applied.sizes.size;

  return (
    <MobileShell>
      <div className="relative w-[393px] min-h-screen bg-white pb-28">
        <div className="h-[54px]" />

        <div className="px-4 mb-4">
          <h1 className="text-[#3c3c3c] text-[22px] font-bold tracking-[-0.5px] mb-4">
            Каталог
          </h1>
          <div className="flex gap-2">
            <div className="flex-1 flex items-center gap-2 bg-[#E5EFFF] rounded-2xl px-4 h-[44px]">
              <Search size={18} className="text-[#2F78FF] shrink-0" strokeWidth={1.8} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Поиск по названию или бренду..."
                className="flex-1 bg-transparent text-[#2F78FF] text-[14px] outline-none placeholder:text-[#2F78FF]/60"
              />
              {search && (
                <button onClick={() => setSearch("")}>
                  <X size={14} className="text-[#2F78FF]" />
                </button>
              )}
            </div>
            <button
              data-testid="btn-filter"
              onClick={openFilter}
              className={`relative w-[44px] h-[44px] rounded-2xl flex items-center justify-center transition-colors ${activeFilterCount > 0 ? "bg-[#0051FF]" : "bg-[#E5EFFF]"}`}
            >
              <SlidersHorizontal size={18} className={activeFilterCount > 0 ? "text-white" : "text-[#2F78FF]"} />
              {activeFilterCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[9px] flex items-center justify-center font-bold">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="flex gap-2 px-4 mb-5 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          {["Все", ...brands].map((brand) => (
            <button key={brand} data-testid={`btn-brand-${brand}`} onClick={() => setActiveBrand(brand)}
              className={`shrink-0 px-4 h-[34px] rounded-full text-[13px] font-medium tracking-[-0.3px] transition-all ${activeBrand === brand ? "bg-[#0051FF] text-white" : "bg-[#f5f5f5] text-[#3c3c3c]"}`}>
              {brand}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-x-[5px] gap-y-5 px-4">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : visibleItems.length > 0 ? (
          <div className="grid grid-cols-2 gap-x-[5px] gap-y-5 px-4">
            {visibleItems.map((item) => (
              <CatalogCard key={item.id} item={item} onClick={() => navigate(`/product/${item.id}`)} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center mt-20 px-8">
            <p className="text-[#3c3c3c] text-[16px] font-bold text-center">Ничего не найдено</p>
            <p className="text-[#7b7b7b] text-[13px] mt-2 text-center">Попробуйте изменить фильтры или запрос</p>
          </div>
        )}
      </div>

      {filterOpen && (
        <div className="fixed inset-x-0 top-0 bottom-[74px] z-50 flex items-end justify-center" style={{ left: "50%", transform: "translateX(-50%)", width: "393px" }}>
          <div className="absolute inset-0 bg-black/30" onClick={() => setFilterOpen(false)} />
          <div className="relative w-full bg-white rounded-t-3xl z-10 overflow-y-auto" style={{ maxHeight: "calc(100vh - 74px - 20px)", scrollbarWidth: "none" }}>
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>
            <div className="flex items-center justify-between px-6 pb-4">
              <p className="text-[#3c3c3c] text-[18px] font-bold tracking-[-0.4px]">Фильтр</p>
              <button onClick={() => setFilterOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-[#f5f5f5]">
                <X size={16} className="text-[#3c3c3c]" />
              </button>
            </div>

            <div>
              <div className="px-6 mb-6">
                <p className="text-[#3c3c3c] text-[16px] font-bold tracking-[-0.4px] mb-3">Цена</p>
                <div className="flex flex-wrap gap-2">
                  {PRICE_PRESETS.map((preset, i) => (
                    <button key={i} data-testid={`filter-price-${i}`} onClick={() => setPrice(i)}
                      className={`px-4 h-[36px] rounded-full text-[13px] font-medium tracking-[-0.3px] transition-all border ${pending.pricePreset === i ? "bg-[#0051FF] text-white border-[#0051FF]" : "bg-white text-[#3c3c3c] border-[#DAE7FF]"}`}>
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="px-6 mb-6">
                <p className="text-[#3c3c3c] text-[16px] font-bold tracking-[-0.4px] mb-3">Размер (EU)</p>
                <div className="overflow-x-auto" style={{ scrollbarWidth: "none" }}>
                  <div className="flex items-center gap-4 px-5 h-[44px] rounded-3xl w-max" style={{ background: "#E5EFFF" }}>
                    <span className="text-[#3c3c3c] text-[16px] tracking-[-0.56px] shrink-0">EU</span>
                    {ALL_SIZES.map((size) => (
                      <button key={size} data-testid={`filter-size-${size}`} onClick={() => toggleSize(size)}
                        className={`text-[16px] tracking-[-0.56px] shrink-0 border-none bg-transparent cursor-pointer px-0 transition-all ${pending.sizes.has(size) ? "text-[#0051FF] font-bold" : "text-[#3c3c3c]"}`}>
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="px-6 mb-6">
                <p className="text-[#3c3c3c] text-[16px] font-bold tracking-[-0.4px] mb-3">Бренд</p>
                <div>
                  {brands.map((brand, i) => (
                    <div key={brand}>
                      <button data-testid={`filter-brand-${brand}`} onClick={() => toggleBrand(brand)} className="w-full flex items-center justify-between py-[13px]">
                        <span className="text-[#000] text-[16px] tracking-[-0.56px]">{brand}</span>
                        <div className={`w-4 h-4 rounded-[4px] flex items-center justify-center transition-colors ${pending.brands.has(brand) ? "bg-[#0051FF]" : "bg-[#D4DCEB]"}`}>
                          {pending.brands.has(brand) && (
                            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                              <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </div>
                      </button>
                      {i < brands.length - 1 && <div className="h-px bg-[#DAE7FF]" />}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 px-6 pt-2 pb-8">
                <button data-testid="btn-filter-reset" onClick={resetFilter}
                  className="flex-1 h-[48px] rounded-2xl border border-[#DAE7FF] text-[#3c3c3c] text-[14px] font-bold tracking-[-0.4px]">
                  Сбросить
                </button>
                <button data-testid="btn-filter-apply" onClick={applyFilter}
                  className="flex-1 h-[48px] rounded-2xl bg-[#0051FF] text-white text-[14px] font-bold tracking-[-0.4px]">
                  Применить
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </MobileShell>
  );
}
