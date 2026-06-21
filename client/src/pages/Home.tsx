import { useState } from "react";
import { useLocation } from "wouter";
import { Search, Heart, MoreHorizontal } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { MobileShell } from "@/components/MobileShell";
import type { Product } from "@shared/schema";

function ProductCard({ product, onClick }: { product: Product; onClick: () => void }) {
  const [fav, setFav] = useState(false);

  return (
    <article
      data-testid={`card-product-${product.id}`}
      className="w-[176px] cursor-pointer"
      onClick={onClick}
    >
      <div className="relative w-[176px] h-[110px] bg-white rounded-3xl overflow-hidden">
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover"
        />
        <button
          data-testid={`btn-favorite-${product.id}`}
          className="absolute top-[10px] left-[10px] z-10"
          onClick={(e) => { e.stopPropagation(); setFav((v) => !v); }}
        >
          <Heart
            size={20}
            strokeWidth={1.5}
            className={fav ? "text-red-500 fill-red-500" : "text-white drop-shadow"}
          />
        </button>
      </div>

      <div className="mt-3 flex items-start justify-between px-1">
        <p
          className="text-[#3c3c3c] text-[18px] font-bold leading-6 tracking-[-0.5px]"
          style={{ fontFamily: "'Gotham Pro', Helvetica, sans-serif" }}
        >
          от {product.price.toLocaleString("ru-RU")} ₽
        </p>
        <button
          data-testid={`btn-more-${product.id}`}
          className="mt-1"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreHorizontal size={18} className="text-[#3c3c3c]" />
        </button>
      </div>

      <div className="mt-0.5 px-1">
        <p
          className="text-[#3c3c3c] text-[12px] font-medium leading-4 tracking-[-0.56px]"
          style={{ fontFamily: "'Gotham Pro', Helvetica, sans-serif" }}
        >
          {product.name}
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

export function Home() {
  const [, navigate] = useLocation();

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  return (
    <MobileShell>
      <div
        className="relative w-[393px] min-h-screen"
        style={{ backgroundImage: "linear-gradient(160deg, #0051FF 0%, #1466FF 40%, #2780FF 70%, #0051FF 100%)" }}
      >
        <div className="h-[54px]" />

        <div className="flex justify-center items-center h-[48px] mx-[90px]">
          <div className="w-[214px] h-[48px] bg-white/20 rounded-2xl flex items-center justify-center">
            <span
              className="text-white text-[18px] font-bold tracking-wide"
              style={{ fontFamily: "'Gotham Pro', Helvetica, sans-serif" }}
            >
              Quality Football
            </span>
          </div>
        </div>

        <div className="mx-4 mt-4">
          <div className="flex items-center gap-2 bg-white rounded-2xl px-4 h-[44px]">
            <Search size={20} className="text-[#7b7b7b] shrink-0" strokeWidth={1.8} />
            <span
              className="text-[#7b7b7b] text-[14px] font-medium tracking-[-0.4px]"
              style={{ fontFamily: "'Gotham Pro', Helvetica, sans-serif" }}
            >
              Найти в Quality Football
            </span>
          </div>
        </div>

        <div className="mt-4 bg-white rounded-[24px] min-h-[calc(100vh-164px)] pb-28">
          <section className="px-4 pt-4">
            <h2
              className="text-[#3c3c3c] text-[14px] font-medium leading-4 tracking-[-0.56px] mb-5"
              style={{ fontFamily: "'Gotham Pro', Helvetica, sans-serif" }}
            >
              Подобрали для вас
            </h2>

            <div className="grid grid-cols-2 gap-x-[5px] gap-y-5">
              {isLoading
                ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
                : products?.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onClick={() => navigate(`/product/${product.id}`)}
                    />
                  ))}
            </div>
          </section>
        </div>
      </div>
    </MobileShell>
  );
}
