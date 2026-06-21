import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { ChevronLeft, Heart } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { MobileShell } from "@/components/MobileShell";
import { useTelegram } from "@/hooks/useTelegram";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Product } from "@shared/schema";

// Открыть чат с владельцем магазина с заготовленным сообщением
function openOwnerChat(text: string, tg: Window["Telegram"]["WebApp"] | undefined) {
  const adminTg = (import.meta as any).env?.VITE_ADMIN_TG as string | undefined;
  if (!adminTg) {
    alert("Владелец магазина не настроен. Установите VITE_ADMIN_TG.");
    return;
  }
  const url = `https://t.me/${adminTg}?text=${encodeURIComponent(text)}`;
  if (tg?.openTelegramLink) {
    tg.openTelegramLink(url);
  } else {
    window.open(url, "_blank");
  }
}

function SizeStrip({
  sizes,
  selected,
  onSelect,
}: {
  sizes: string[];
  selected: string | undefined;
  onSelect: (s: string) => void;
}) {
  return (
    <div className="overflow-x-auto mb-3" style={{ scrollbarWidth: "none" }}>
      <div
        className="flex items-center gap-4 px-5 h-[44px] rounded-3xl w-max"
        style={{ background: "#E5EFFF" }}
      >
        <span className="text-[#3c3c3c] text-[16px] tracking-[-0.56px] shrink-0">EU</span>
        {sizes.map((size) => (
          <button
            key={size}
            onClick={() => onSelect(size)}
            className={`text-[16px] tracking-[-0.56px] shrink-0 border-none bg-transparent cursor-pointer px-0 transition-all ${
              selected === size ? "text-[#0051FF] font-bold" : "text-[#3c3c3c]"
            }`}
          >
            {size}
          </button>
        ))}
      </div>
    </div>
  );
}

function SkeletonDetail() {
  return (
    <div className="animate-pulse px-4 pt-4">
      <div className="h-[360px] bg-gray-200 rounded-3xl mb-6" />
      <div className="h-6 bg-gray-200 rounded w-1/3 mb-3" />
      <div className="h-10 bg-gray-200 rounded w-2/3 mb-4" />
      <div className="h-[60px] bg-gray-200 rounded-3xl" />
    </div>
  );
}

export function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { userId, tg } = useTelegram();

  const { data: product, isLoading } = useQuery<Product>({
    queryKey: ["/api/products", id],
  });

  const { data: allProducts } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | undefined>();
  const [fav, setFav] = useState(false);

  const addToCartMutation = useMutation({
    mutationFn: () =>
      apiRequest("POST", "/api/cart", {
        telegramUserId: userId,
        productId: Number(id),
        size: selectedSize ?? null,
        quantity: 1,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart", userId] });
      navigate("/cart");
    },
  });

  const toggleFavMutation = useMutation({
    mutationFn: async () => {
      if (fav) {
        await apiRequest("DELETE", `/api/favorites/${userId}/${id}`);
      } else {
        await apiRequest("POST", "/api/favorites", {
          telegramUserId: userId,
          productId: Number(id),
        });
      }
    },
    onSuccess: () => {
      setFav((v) => !v);
      queryClient.invalidateQueries({ queryKey: ["/api/favorites", userId] });
    },
  });

  // "Купить" — перенаправляет в чат владельца с готовым сообщением
  function handleBuyNow() {
    if (!product) return;
    const sizeText = selectedSize ? `\n📐 Размер: EU ${selectedSize}` : "";
    const text =
      `Хочу купить:\n\n` +
      `👟 ${product.name}${sizeText}\n` +
      `💰 ${product.price.toLocaleString("ru-RU")} ₽`;
    openOwnerChat(text, tg);
  }

  const related = allProducts?.filter((p) => p.id !== Number(id)).slice(0, 4) ?? [];

  if (isLoading) {
    return (
      <MobileShell>
        <div className="w-[393px] min-h-screen pb-6" style={{ background: "#F5F7FF" }}>
          <div className="h-[54px]" />
          <SkeletonDetail />
        </div>
      </MobileShell>
    );
  }

  if (!product) {
    return (
      <MobileShell>
        <div className="w-[393px] min-h-screen flex items-center justify-center">
          <p className="text-[#7b7b7b]">Товар не найден</p>
        </div>
      </MobileShell>
    );
  }

  return (
    <MobileShell>
      <div className="relative w-[393px] min-h-screen pb-6" style={{ background: "#F5F7FF" }}>
        <div className="h-[54px]" />

        {/* Header */}
        <div className="flex items-center justify-between px-4 mb-4">
          <button
            onClick={() => navigate("/")}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm"
          >
            <ChevronLeft size={22} className="text-[#3c3c3c]" />
          </button>
          <p className="text-[#3c3c3c] text-[16px] font-bold tracking-[-0.4px] flex-1 text-center truncate px-3">
            {product.name}
          </p>
          <div className="w-10" />
        </div>

        {/* Gallery */}
        <div className="overflow-hidden px-4">
          <div
            className="flex transition-transform duration-300 ease-in-out"
            style={{ transform: `translateX(-${activeImage * 100}%)` }}
          >
            {product.images.map((src, i) => (
              <div
                key={i}
                className="min-w-full h-[360px] bg-white rounded-3xl flex items-center justify-center"
              >
                <img
                  src={src}
                  alt={`${product.name} ${i + 1}`}
                  className="max-w-[90%] max-h-[320px] object-contain"
                />
              </div>
            ))}
          </div>

          {product.images.length > 1 && (
            <div className="flex justify-center gap-1.5 mt-3">
              {product.images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`rounded-full border-none p-0 transition-all ${
                    i === activeImage ? "w-2 h-2 bg-[#0051FF]" : "w-1.5 h-1.5 bg-[#ccc]"
                  }`}
                  aria-label={`Фото ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Favourite */}
        <div className="flex justify-end px-6 py-2">
          <button
            className="border-none bg-transparent p-1 cursor-pointer"
            onClick={() => toggleFavMutation.mutate()}
          >
            <Heart
              size={26}
              strokeWidth={1.5}
              className={fav ? "text-red-500 fill-red-500" : "text-[#3c3c3c]"}
            />
          </button>
        </div>

        {/* Info block */}
        <section className="bg-white mb-4 px-4 pt-4 pb-4">
          {product.isOriginal && (
            <div className="flex items-center gap-2 text-[#2F78FF] text-[12px] mb-2">
              <span className="w-[19px] h-[19px] rounded-full bg-[#2F78FF] text-white text-[10px] flex items-center justify-center font-bold shrink-0">
                ✓
              </span>
              Оригинал
            </div>
          )}

          <h1 className="text-[#3c3c3c] text-[32px] font-bold leading-8 tracking-[-0.56px] mb-4">
            {product.name}
          </h1>

          {/* CTA buttons */}
          <div className="flex gap-3 mb-4">
            <button
              onClick={() => addToCartMutation.mutate()}
              disabled={addToCartMutation.isPending}
              className="shrink-0 border-none bg-transparent text-[#2F78FF] text-[20px] font-medium cursor-pointer px-0 py-4 disabled:opacity-50"
            >
              В корзину
            </button>
            <button
              onClick={handleBuyNow}
              className="flex-1 h-[60px] border-none rounded-3xl bg-[#0051FF] text-white text-[20px] font-medium cursor-pointer active:scale-[0.98] transition-transform"
            >
              Купить {product.price.toLocaleString("ru-RU")} ₽
            </button>
          </div>

          <SizeStrip
            sizes={product.sizes}
            selected={selectedSize}
            onSelect={setSelectedSize}
          />

          {product.description && (
            <p className="text-[14px] text-[#666] leading-[1.6] pb-4 border-b border-[#F0F0F0] mt-3">
              {product.description}
            </p>
          )}

          <button className="mt-3 border-none bg-transparent text-[12px] text-[#5075ba] underline cursor-pointer p-0">
            📏 Как определить размер обуви
          </button>
        </section>

        {/* Related products */}
        {related.length > 0 && (
          <section className="mx-[15px] bg-white rounded-3xl p-4">
            <div className="grid grid-cols-2 gap-4">
              {related.map((p) => (
                <article
                  key={p.id}
                  className="cursor-pointer"
                  onClick={() => {
                    setActiveImage(0);
                    setSelectedSize(undefined);
                    navigate(`/product/${p.id}`);
                  }}
                >
                  <div className="w-full h-[110px] bg-[#F5F7FF] rounded-2xl overflow-hidden">
                    <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                  </div>
                  <p className="text-[#3c3c3c] text-[14px] font-bold mt-2 tracking-[-0.4px]">
                    от {p.price.toLocaleString("ru-RU")} ₽
                  </p>
                  <p className="text-[#7b7b7b] text-[11px] mt-0.5 tracking-[-0.3px]">{p.name}</p>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
    </MobileShell>
  );
}
